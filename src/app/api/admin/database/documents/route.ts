import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { withAuth, AuthRequest } from '@/middleware/auth';
import User, { UserRole } from '@/models/User';

// GET /api/admin/database/documents - Get documents from a collection (Admin only)
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    // Verify user exists and is admin in database
    const dbUser = await User.findById(user.userId);
    if (!dbUser || dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const collectionName = searchParams.get('collection');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    if (!collectionName) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const collection = db.collection(collectionName);
    
    // Build query for search
    let query: any = {};
    if (search) {
      // Search in all string fields
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
      ];
      
      // Try to parse search as ObjectId
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      }
    }

    const skip = (page - 1) * limit;
    const total = await collection.countDocuments(query);
    
    const documents = await collection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Convert ObjectId and Date to strings for JSON serialization
    const serializedDocuments = documents.map(doc => {
      const serialized: any = {};
      for (const [key, value] of Object.entries(doc)) {
        if (value instanceof mongoose.Types.ObjectId) {
          serialized[key] = value.toString();
        } else if (value instanceof Date) {
          serialized[key] = value.toISOString();
        } else if (value && typeof value === 'object' && value.constructor === Object) {
          serialized[key] = JSON.parse(JSON.stringify(value, (k, v) => {
            if (v instanceof mongoose.Types.ObjectId) return v.toString();
            if (v instanceof Date) return v.toISOString();
            return v;
          }));
        } else {
          serialized[key] = value;
        }
      }
      return serialized;
    });

    return NextResponse.json({
      success: true,
      documents: serializedDocuments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

