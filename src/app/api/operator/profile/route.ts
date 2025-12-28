import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.OPERATOR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const operator = await User.findById(payload.userId);
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, phone } = body;

    // Update fields if provided
    if (name !== undefined) operator.name = name.trim();
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: operator._id }
      });
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 400 });
      }
      operator.email = email.toLowerCase().trim();
    }
    if (phone !== undefined) {
      // Validate phone format
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return NextResponse.json({ 
          error: 'Phone number must be 10 digits' 
        }, { status: 400 });
      }
      // Check if phone is already taken by another user
      const existingUser = await User.findOne({ 
        phone: phone.replace(/\s+/g, ''),
        _id: { $ne: operator._id }
      });
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Phone number already exists' 
        }, { status: 400 });
      }
      operator.phone = phone.replace(/\s+/g, '');
    }

    await operator.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      operator: {
        _id: operator._id.toString(),
        name: operator.name,
        email: operator.email,
        phone: operator.phone,
      },
    });
  } catch (error: any) {
    console.error('Error updating operator profile:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update profile' 
    }, { status: 500 });
  }
}

