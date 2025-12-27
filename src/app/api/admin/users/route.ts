import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { withAuth, AuthRequest } from '@/middleware/auth';

// GET /api/admin/users - Get users by role (Admin only)
export const GET = withAuth(async (req: AuthRequest) => {
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
    
    // Only admin can access this endpoint
    if (dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ 
        error: 'Forbidden. Admin access required.',
        message: `Your current role is: ${dbUser.role}. Admin role is required.`
      }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('role');

    let query: any = {};
    
    if (role) {
      // Validate role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        agentId: user.agentId?.toString(),
        operatorId: user.operatorId?.toString(),
        createdAt: user.createdAt,
      })),
      count: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

