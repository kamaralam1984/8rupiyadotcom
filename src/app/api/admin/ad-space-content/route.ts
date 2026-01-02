import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthRequest } from '@/middleware/auth';
import connectMongo from '@/lib/mongodb';
import AdSpaceContent from '@/models/AdSpaceContent';

// GET - Fetch all ad space contents
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectMongo();

    const contents = await AdSpaceContent.find({})
      .sort({ rail: 1, position: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      contents,
    });
  } catch (error: any) {
    console.error('Error fetching ad space contents:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch contents' },
      { status: 500 }
    );
  }
});

// POST - Create new ad space content
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectMongo();

    const body = await req.json();
    const {
      rail,
      position,
      title,
      content,
      backgroundColor,
      textColor,
      borderColor,
      isActive,
      showBorder,
      showBackground,
      padding,
      margin,
      textAlign,
      linkUrl,
      linkText,
    } = body;

    if (!rail || !content) {
      return NextResponse.json(
        { success: false, error: 'Rail and content are required' },
        { status: 400 }
      );
    }

    const newContent = new AdSpaceContent({
      rail,
      position: position || 1,
      title: title || '',
      content,
      backgroundColor: backgroundColor || '#FFFFFF',
      textColor: textColor || '#1F2937',
      borderColor: borderColor || '#E5E7EB',
      isActive: isActive !== undefined ? isActive : true,
      showBorder: showBorder !== undefined ? showBorder : true,
      showBackground: showBackground !== undefined ? showBackground : true,
      padding: padding || 'p-4',
      margin: margin || 'mb-4',
      textAlign: textAlign || 'left',
      linkUrl: linkUrl || '',
      linkText: linkText || '',
    });

    await newContent.save();

    return NextResponse.json({
      success: true,
      content: newContent,
    });
  } catch (error: any) {
    console.error('Error creating ad space content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create content' },
      { status: 500 }
    );
  }
});

