import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { withAuth, AuthRequest } from '@/middleware/auth';

// PUT /api/admin/users/update - Update user (Admin only)
export const PUT = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const jwtPayload = req.user!;
    
    // Verify user exists and is admin in database
    const dbUser = await User.findById(jwtPayload.userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!dbUser.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }
    
    // Only admin can update users
    if (dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ 
        error: 'Forbidden. Admin access required.',
        message: `Your current role is: ${dbUser.role}. Admin role is required.`
      }, { status: 403 });
    }

    const body = await req.json();
    const { userId, name, email, phone, password, isActive } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Find user to update
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Prevent admin from deactivating themselves
    if (userId === jwtPayload.userId && isActive === false) {
      return NextResponse.json({ 
        error: 'You cannot deactivate your own account' 
      }, { status: 400 });
    }

    // Update fields if provided
    if (name !== undefined) userToUpdate.name = name.trim();
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 400 });
      }
      userToUpdate.email = email.toLowerCase().trim();
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
        _id: { $ne: userId }
      });
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Phone number already exists' 
        }, { status: 400 });
      }
      userToUpdate.phone = phone.replace(/\s+/g, '');
    }
    if (password !== undefined && password !== '') {
      // Validate password length
      if (password.length < 6) {
        return NextResponse.json({ 
          error: 'Password must be at least 6 characters' 
        }, { status: 400 });
      }
      userToUpdate.password = await hashPassword(password);
    }
    if (isActive !== undefined) {
      userToUpdate.isActive = isActive;
    }

    await userToUpdate.save();

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: userToUpdate._id.toString(),
        name: userToUpdate.name,
        email: userToUpdate.email,
        phone: userToUpdate.phone,
        role: userToUpdate.role,
        isActive: userToUpdate.isActive,
        createdAt: userToUpdate.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    let errorMessage = error.message || 'Failed to update user';
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      errorMessage = `Validation error: ${validationErrors.join(', ')}`;
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      errorMessage = `${field} already exists`;
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}, [UserRole.ADMIN]);

