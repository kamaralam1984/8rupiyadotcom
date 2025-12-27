import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// POST /api/admin/shops/fix-agent-ids - Fix missing agentId/shopperId for all shops
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    // Only Admin can run this fix
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ 
        error: 'Forbidden',
        message: 'Only Admin can run this fix.'
      }, { status: 403 });
    }

    const mongoose = await import('mongoose');
    const adminId = new mongoose.Types.ObjectId(user.userId);

    // Find all shops missing shopperId or agentId
    const shopsToFix = await Shop.find({
      $or: [
        { shopperId: { $exists: false } },
        { shopperId: null },
        { agentId: { $exists: false } },
        { agentId: null },
      ]
    });

    let fixed = 0;
    let errors = 0;

    for (const shop of shopsToFix) {
      try {
        // Set shopperId if missing
        if (!shop.shopperId) {
          // Use existing agentId or operatorId, otherwise use admin
          if (shop.agentId) {
            shop.shopperId = shop.agentId;
          } else if (shop.operatorId) {
            shop.shopperId = shop.operatorId;
          } else {
            shop.shopperId = adminId;
          }
        }

        // Set agentId if missing
        if (!shop.agentId) {
          shop.agentId = shop.shopperId || adminId;
        }

        await shop.save();
        fixed++;
      } catch (error: any) {
        console.error(`Error fixing shop ${shop._id}:`, error.message);
        errors++;
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Fixed ${fixed} shops. ${errors} errors.`,
      fixed,
      errors,
      total: shopsToFix.length
    });
  } catch (error: any) {
    console.error('Fix agent IDs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

