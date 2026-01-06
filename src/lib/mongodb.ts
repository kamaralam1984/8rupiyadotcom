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
    // ⚡ ULTRA-OPTIMIZED connection options for 1-second performance
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      
      // ⚡ Aggressive connection pooling for maximum performance
      maxPoolSize: 50, // Increased from 10 to 50 for better concurrency
      minPoolSize: 10, // Increased from 2 to 10 to keep connections ready
      
      // ⚡ Optimized timeout settings (balanced for SSL/TLS connections)
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection (SSL connections need more time)
      connectTimeoutMS: 5000, // 5 seconds connection timeout (secureConnect needs more time for TLS handshake)
      socketTimeoutMS: 30000, // 30 seconds socket timeout (reduced from 45s)
      
      // ⚡ Faster heartbeat for quicker reconnection
      heartbeatFrequencyMS: 5000, // Check server every 5 seconds (reduced from 10s)
      
      // ⚡ Keep connections alive longer for reuse
      maxIdleTimeMS: 300000, // Keep idle connections for 5 minutes (increased from 60s)
      
      // ⚡ Compression for faster data transfer
      compressors: ['zlib'],
      zlibCompressionLevel: 1, // Faster compression (reduced from 6)
      
      // ⚡ Read preference for better performance
      readPreference: 'primaryPreferred',
      
      // ⚡ Ultra-fast write concern (no journal wait)
      writeConcern: {
        w: 1, // Acknowledge after writing to primary
        j: false, // Don't wait for journal (faster writes)
        wtimeout: 1000, // 1 second write timeout
      },
      
      // ⚡ Direct connection for faster initial connection
      directConnection: false, // Use connection string (faster for Atlas)
      
      // ⚡ Retry settings for faster recovery
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully with optimized pool');
        
        // Register all models to prevent schema registration errors
        registerAllModels();
        console.log('✅ All models registered');
        
        // ⚡ Set up mongoose optimizations for maximum speed
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
