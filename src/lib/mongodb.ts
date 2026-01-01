import mongoose from 'mongoose';
import { registerAllModels } from '@/models';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/8rupiya';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Validate MongoDB URI format
function validateMongoURI(uri: string): void {
  // Check if it's a mongodb+srv URI
  if (uri.startsWith('mongodb+srv://')) {
    // mongodb+srv URIs should not have port numbers
    if (uri.includes(':27017') || uri.match(/:\d{4,5}/)) {
      throw new Error('mongodb+srv URI cannot have port number. Remove the port from your connection string.');
    }
  }
  
  // Check if it's a standard mongodb URI
  if (uri.startsWith('mongodb://')) {
    // Standard URIs can have ports, but let's validate format
    if (!uri.match(/^mongodb:\/\/.+/)) {
      throw new Error('Invalid MongoDB URI format');
    }
  }
}

// Validate URI before using it
try {
  validateMongoURI(MONGODB_URI);
} catch (error: any) {
  console.error('MongoDB URI Validation Error:', error.message);
  throw error;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // ⚡ Optimized connection options for faster performance
    const opts = {
      bufferCommands: false,
      
      // Connection pooling for better performance
      maxPoolSize: 10, // Maximum number of connections in pool
      minPoolSize: 2,  // Minimum number of connections
      
      // Timeout settings for faster failure detection
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      
      // Heartbeat settings
      heartbeatFrequencyMS: 10000, // Check server every 10 seconds
      
      // Connection settings
      maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
      
      // Compression for faster data transfer
      compressors: ['zlib'],
      zlibCompressionLevel: 6, // Balance between speed and compression
      
      // Read preference for better performance
      readPreference: 'primaryPreferred', // Try primary first, fallback to secondary
      
      // Write concern for faster writes (adjust based on your needs)
      writeConcern: {
        w: 1, // Acknowledge after writing to primary
        j: false, // Don't wait for journal
      },
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully with optimized pool');
        
        // Register all models to prevent schema registration errors
        registerAllModels();
        console.log('✅ All models registered');
        
        // Set up mongoose optimizations
        mongoose.set('strictQuery', false); // Faster queries
        mongoose.set('autoIndex', process.env.NODE_ENV === 'development'); // Only auto-index in dev
        
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    // Provide more helpful error messages
    if (e.message.includes('port number')) {
      throw new Error('MongoDB URI Error: mongodb+srv URIs cannot have port numbers. Please check your MONGODB_URI in .env.local file.');
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;
