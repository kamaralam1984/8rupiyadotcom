import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Error from '@/models/Error';
import { ErrorType, ErrorStatus } from '@/types/error';
import { checkBugPrevention, createBugFromError } from '@/lib/bugPrevention';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      errorType = ErrorType.OTHER,
      message,
      stack,
      endpoint,
      method,
      userAgent,
      userId,
      sessionId,
      metadata = {},
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Error message is required' },
        { status: 400 }
      );
    }

    // Check bug prevention rules
    const preventionCheck = await checkBugPrevention(message, errorType, endpoint);
    if (preventionCheck.matched && preventionCheck.action === 'block') {
      return NextResponse.json({
        success: false,
        blocked: true,
        message: `Error blocked by prevention rule: ${preventionCheck.rule?.name}`,
      });
    }

    // Check if similar error exists in last 5 minutes (prevent duplicates)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingError = await Error.findOne({
      message: message.substring(0, 200), // First 200 chars
      endpoint,
      status: ErrorStatus.PENDING,
      createdAt: { $gte: fiveMinutesAgo },
    });

    let error;
    let isNewError = false;

    if (existingError) {
      // Update existing error count
      existingError.metadata = {
        ...existingError.metadata,
        occurrenceCount: (existingError.metadata?.occurrenceCount || 1) + 1,
        lastOccurrence: new Date(),
      };
      await existingError.save();
      error = existingError;
    } else {
      // Create new error
      error = new Error({
        errorType,
        status: ErrorStatus.PENDING,
        message: message.substring(0, 1000), // Limit message length
        stack: stack?.substring(0, 5000), // Limit stack length
        endpoint,
        method,
        userAgent,
        userId,
        sessionId,
        metadata: {
          ...metadata,
          occurrenceCount: 1,
          firstOccurrence: new Date(),
          lastOccurrence: new Date(),
        },
      });

      await error.save();
      isNewError = true;
    }

    // Automatically create bug from error if it's new or if occurrence count is high
    let bugId = null;
    if (isNewError || (error.metadata?.occurrenceCount || 0) >= 5) {
      bugId = await createBugFromError(
        error._id.toString(),
        message,
        errorType,
        endpoint,
        stack
      );
    }

    return NextResponse.json({ 
      success: true, 
      errorId: error._id,
      bugId,
      duplicate: !isNewError,
      warning: preventionCheck.matched && preventionCheck.action === 'warn' 
        ? `Warning: ${preventionCheck.rule?.description}` 
        : undefined,
    });
  } catch (error: any) {
    console.error('Error logging failed:', error);
    return NextResponse.json(
      { error: 'Failed to log error', details: error.message },
      { status: 500 }
    );
  }
}

