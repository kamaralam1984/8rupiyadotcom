import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  const status = {
    mongodb: 'disconnected',
    redis: 'disconnected',
    timestamp: new Date().toISOString(),
  };

  // Check MongoDB
  try {
    await connectDB();
    status.mongodb = 'connected';
  } catch (error) {
    status.mongodb = 'disconnected';
  }

  // Check Redis
  try {
    const client = await getRedisClient();
    if (client) {
      // Try to get a test key to verify connection
      await client.get('health-check');
      status.redis = 'connected';
    } else {
      status.redis = 'disconnected';
    }
  } catch (error) {
    status.redis = 'disconnected';
  }

  return NextResponse.json(status);
}

