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
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        // Register all models to prevent schema registration errors
        registerAllModels();
        console.log('✅ All models registered');
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
