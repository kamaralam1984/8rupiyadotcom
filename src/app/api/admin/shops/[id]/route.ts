import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const shopId = id;
    const updates = await req.json();

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'category',
      'address',
      'city',
      'pincode',
      'keywords',
      'seoKeywords', // Save SEO keywords
      'images',
      'photos', // Also update photos array
      'isFeatured',
      'homepagePriority',
      'status',
      'planExpiry',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        (shop as any)[field] = updates[field];
      }
    });

    // Sync images to photos array if images updated
    if (updates.images) {
      (shop as any).photos = updates.images;
    }

    // Sync keywords to seoKeywords if keywords updated
    if (updates.keywords) {
      (shop as any).seoKeywords = updates.keywords;
    }

    // Handle contact information (phone and email are direct fields in Shop model)
    // Support both contact object and direct phone/email fields
    if (updates.contact) {
      console.log('📞 Updating contact info from contact object:', updates.contact);
      if (updates.contact.phone) {
        shop.phone = updates.contact.phone;
      }
      if (updates.contact.email) {
        shop.email = updates.contact.email;
      }
    }
    
    // Also handle direct phone and email fields
    if (updates.phone !== undefined) {
      console.log('📞 Updating phone from direct field:', updates.phone);
      shop.phone = updates.phone;
    }
    if (updates.email !== undefined) {
      console.log('📧 Updating email from direct field:', updates.email);
      shop.email = updates.email;
    }
    
    if (updates.phone || updates.email || updates.contact) {
      console.log('✅ Contact updated - Phone:', shop.phone, 'Email:', shop.email);
    }

    await shop.save();

    // Return shop with contact object for backward compatibility
    const shopResponse = shop.toObject();
    (shopResponse as any).contact = {
      phone: shop.phone || '',
      email: shop.email || '',
    };

    return NextResponse.json({
      success: true,
      message: 'Shop updated successfully',
      shop: shopResponse,
    });
  } catch (error: any) {
    console.error('Error updating shop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const shopId = id;
    const shop = await Shop.findByIdAndDelete(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Shop deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting shop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

