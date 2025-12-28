import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import Shop from '@/models/Shop';
import { withAuth, AuthRequest } from '@/middleware/auth';

// DELETE /api/admin/users/delete - Delete user (Admin only)
export const DELETE = withAuth(async (req: AuthRequest) => {
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
    
    // Only admin can delete users
    if (dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ 
        error: 'Forbidden. Admin access required.',
        message: `Your current role is: ${dbUser.role}. Admin role is required.`
      }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === jwtPayload.userId) {
      return NextResponse.json({ 
        error: 'You cannot delete your own account' 
      }, { status: 400 });
    }

    // Find user to delete
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if user has associated shops (for agents/operators)
    if (userToDelete.role === UserRole.AGENT || userToDelete.role === UserRole.OPERATOR) {
      const shopCount = await Shop.countDocuments({
        $or: [
          { agentId: userToDelete._id },
          { operatorId: userToDelete._id }
        ]
      });

      if (shopCount > 0) {
        return NextResponse.json({ 
          error: `Cannot delete user. This ${userToDelete.role} has ${shopCount} associated shop(s). Please reassign or delete shops first.` 
        }, { status: 400 });
      }
    }

    // Check if user has dependent users (for agents with operators)
    if (userToDelete.role === UserRole.AGENT) {
      const dependentOperators = await User.countDocuments({
        agentId: userToDelete._id,
        role: UserRole.OPERATOR
      });

      if (dependentOperators > 0) {
        return NextResponse.json({ 
          error: `Cannot delete agent. This agent has ${dependentOperators} operator(s) assigned. Please reassign operators first.` 
        }, { status: 400 });
      }
    }

    // Check if user has dependent users (for operators with shoppers)
    if (userToDelete.role === UserRole.OPERATOR) {
      const dependentShoppers = await User.countDocuments({
        operatorId: userToDelete._id,
        role: UserRole.SHOPPER
      });

      if (dependentShoppers > 0) {
        return NextResponse.json({ 
          error: `Cannot delete operator. This operator has ${dependentShoppers} shopper(s) assigned. Please reassign shoppers first.` 
        }, { status: 400 });
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: `User "${userToDelete.name}" has been deleted successfully`,
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete user'
    }, { status: 500 });
  }
}, [UserRole.ADMIN]);

