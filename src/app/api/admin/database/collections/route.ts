import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import mongoose from 'mongoose';

// GET /api/admin/database/collections - Get all collections
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database connection not established' }, { status: 500 });
    }

    // Get all collections
    const collections = await db.listCollections().toArray();
    
    // Get count for each collection
    const collectionsWithCount = await Promise.all(
      collections.map(async (collection) => {
        const count = await db.collection(collection.name).countDocuments();
        return {
          name: collection.name,
          count,
          type: collection.type,
        };
      })
    );

    return NextResponse.json({
      success: true,
      collections: collectionsWithCount.sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
