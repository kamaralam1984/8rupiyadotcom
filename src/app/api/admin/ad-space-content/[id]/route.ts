import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthRequest } from '@/middleware/auth';
import connectMongo from '@/lib/mongodb';
import AdSpaceContent from '@/models/AdSpaceContent';

// GET - Fetch single ad space content
export const GET = withAuth(async (
  req: AuthRequest,
  context?: { params?: Promise<{ id: string }> }
) => {
  try {
    await connectMongo();

    if (!context?.params) {
      return NextResponse.json(
        { success: false, error: 'Missing params' },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const content = await AdSpaceContent.findById(id).lean();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error: any) {
    console.error('Error fetching ad space content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch content' },
      { status: 500 }
    );
  }
});

// PUT - Update ad space content
export const PUT = withAuth(async (
  req: AuthRequest,
  context?: { params?: Promise<{ id: string }> }
) => {
  try {
    await connectMongo();

    if (!context?.params) {
      return NextResponse.json(
        { success: false, error: 'Missing params' },
        { status: 400 }
      );
    }

    const { id } = await context.params;
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

    const existingContent = await AdSpaceContent.findById(id);

    if (!existingContent) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (rail !== undefined) existingContent.rail = rail;
    if (position !== undefined) existingContent.position = position;
    if (title !== undefined) existingContent.title = title;
    if (content !== undefined) existingContent.content = content;
    if (backgroundColor !== undefined) existingContent.backgroundColor = backgroundColor;
    if (textColor !== undefined) existingContent.textColor = textColor;
    if (borderColor !== undefined) existingContent.borderColor = borderColor;
    if (isActive !== undefined) existingContent.isActive = isActive;
    if (showBorder !== undefined) existingContent.showBorder = showBorder;
    if (showBackground !== undefined) existingContent.showBackground = showBackground;
    if (padding !== undefined) existingContent.padding = padding;
    if (margin !== undefined) existingContent.margin = margin;
    if (textAlign !== undefined) existingContent.textAlign = textAlign;
    if (linkUrl !== undefined) existingContent.linkUrl = linkUrl;
    if (linkText !== undefined) existingContent.linkText = linkText;

    await existingContent.save();

    return NextResponse.json({
      success: true,
      content: existingContent,
    });
  } catch (error: any) {
    console.error('Error updating ad space content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update content' },
      { status: 500 }
    );
  }
});

// DELETE - Delete ad space content
export const DELETE = withAuth(async (
  req: AuthRequest,
  context?: { params?: Promise<{ id: string }> }
) => {
  try {
    await connectMongo();

    if (!context?.params) {
      return NextResponse.json(
        { success: false, error: 'Missing params' },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const content = await AdSpaceContent.findByIdAndDelete(id);

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting ad space content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete content' },
      { status: 500 }
    );
  }
});

