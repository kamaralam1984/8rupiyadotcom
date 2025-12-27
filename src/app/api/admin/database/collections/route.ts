import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { withAuth, AuthRequest } from '@/middleware/auth';
import User, { UserRole } from '@/models/User';

// GET /api/admin/database/collections - Get all collections (Admin only)
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    // Verify user exists and is admin in database
    const dbUser = await User.findById(user.userId);
    if (!dbUser || dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const collections = await db.listCollections().toArray();
    
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const count = await db.collection(collection.name).countDocuments();
        return {
          name: collection.name,
          count,
          type: collection.type || 'collection',
        };
      })
    );

    return NextResponse.json({
      success: true,
      collections: collectionsWithCounts.sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

