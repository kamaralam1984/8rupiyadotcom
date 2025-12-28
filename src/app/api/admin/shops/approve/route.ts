import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';
import { cacheDel } from '@/lib/redis';

export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    // Only Admin and Accountants can approve shops
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.ACCOUNTANT) {
      return NextResponse.json({ 
        error: 'Forbidden',
        message: 'Only Admin and Accountants can approve shops.'
      }, { status: 403 });
    }

    const { shopId, action } = await req.json(); // action: 'approve' or 'reject'

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Ensure required fields are present before saving
    // If missing, set defaults to prevent validation errors
    if (!shop.shopperId) {
      // Use agentId or operatorId as fallback
      if (shop.agentId) {
        shop.shopperId = shop.agentId as any;
      } else if (shop.operatorId) {
        shop.shopperId = shop.operatorId as any;
      } else {
        // If no owner/agent/operator, assign the current admin/accountant as agentId and shopperId
        // This ensures shops can be approved even if they don't have an assigned agent
        const mongoose = await import('mongoose');
        shop.agentId = new mongoose.Types.ObjectId(user.userId) as any;
        shop.shopperId = new mongoose.Types.ObjectId(user.userId) as any;
      }
    }

    // Also ensure agentId is set if missing
    if (!shop.agentId) {
      const mongoose = await import('mongoose');
      shop.agentId = shop.shopperId || new mongoose.Types.ObjectId(user.userId) as any;
    }

    if (!shop.email) {
      // Generate email from shop name or phone
      const emailBase = shop.name?.replace(/\s+/g, '').toLowerCase() || 
                       shop.phone?.replace(/\D/g, '') || 
                       `shop${shop._id}`;
      shop.email = `${emailBase}@shop.8rupiya.com`;
    }

    if (!shop.description) {
      // Use address as description if description is missing
      shop.description = shop.address || shop.name || 'Shop description';
    }

    if (action === 'approve') {
      shop.status = ShopStatus.ACTIVE; // Set status as 'active' when approved
    } else if (action === 'reject') {
      shop.status = ShopStatus.REJECTED;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await shop.save();

    // Clear cache
    await cacheDel(`shops:nearby:*`);

    return NextResponse.json({ success: true, shop });
  } catch (error: any) {
    console.error('Shop approval error:', error);
    
    // Provide more detailed error message for validation errors
    let errorMessage = error.message || 'Failed to approve/reject shop';
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      errorMessage = `Shop validation failed: ${validationErrors.join(', ')}`;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}, [UserRole.ADMIN, UserRole.ACCOUNTANT]);

