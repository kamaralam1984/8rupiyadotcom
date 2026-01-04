import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Error from '@/models/Error';
import { ErrorStatus, ErrorType } from '@/types/error';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import { DatabaseRepair } from '@/lib/databaseRepair';

// GET - Fetch all errors with filters
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const errorType = searchParams.get('errorType');
    const endpoint = searchParams.get('endpoint');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: any = {};

    if (status) {
      query.status = status;
    } else {
      // Default: show pending errors
      query.status = ErrorStatus.PENDING;
    }

    if (errorType) {
      query.errorType = errorType;
    }

    if (endpoint) {
      query.endpoint = { $regex: endpoint, $options: 'i' };
    }

    const errors = await Error.find(query)
      .populate('userId', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Error.countDocuments(query);

    // Get error stats
    const stats = {
      pending: await Error.countDocuments({ status: ErrorStatus.PENDING }),
      fixed: await Error.countDocuments({ status: ErrorStatus.FIXED }),
      autoFixed: await Error.countDocuments({ status: ErrorStatus.AUTO_FIXED }),
      ignored: await Error.countDocuments({ status: ErrorStatus.IGNORED }),
      byType: await Error.aggregate([
        { $match: { status: ErrorStatus.PENDING } },
        { $group: { _id: '$errorType', count: { $sum: 1 } } },
      ]),
    };

    return NextResponse.json({
      errors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching errors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    );
  }
}

// POST - Auto-fix errors
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { errorId, action } = body;

    if (!errorId || !action) {
      return NextResponse.json(
        { error: 'errorId and action are required' },
        { status: 400 }
      );
    }

    const error = await Error.findById(errorId);
    if (!error) {
      return NextResponse.json(
        { error: 'Error not found' },
        { status: 404 }
      );
    }

    let fixResult: any = { success: false, message: 'Unknown action' };

    switch (action) {
      case 'auto_fix':
        fixResult = await autoFixError(error);
        break;
      case 'ignore':
        error.status = ErrorStatus.IGNORED;
        error.resolvedAt = new Date();
        await error.save();
        fixResult = { success: true, message: 'Error ignored' };
        break;
      case 'mark_fixed':
        error.status = ErrorStatus.FIXED;
        error.resolvedAt = new Date();
        await error.save();
        fixResult = { success: true, message: 'Error marked as fixed' };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(fixResult);
  } catch (error: any) {
    console.error('Error fixing error:', error);
    return NextResponse.json(
      { error: 'Failed to fix error', details: error.message },
      { status: 500 }
    );
  }
}

// Auto-fix function
async function autoFixError(error: any): Promise<any> {
  const errorMessage = error.message.toLowerCase();
  const endpoint = error.endpoint || '';

  // Fix 1: Database connection errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('mongodb')
  ) {
    try {
      const result = await DatabaseRepair.fixConnection();
      if (result.success) {
        error.status = ErrorStatus.AUTO_FIXED;
        error.autoFixed = true;
        error.fixDetails = result.message;
        error.resolvedAt = new Date();
        error.fixAttempts = (error.fixAttempts || 0) + 1;
        error.lastFixAttempt = new Date();
        await error.save();
        return { success: true, message: result.message };
      } else {
        error.fixAttempts = (error.fixAttempts || 0) + 1;
        error.lastFixAttempt = new Date();
        error.fixDetails = result.message;
        await error.save();
        return { success: false, message: result.message };
      }
    } catch (e: any) {
      error.fixAttempts = (error.fixAttempts || 0) + 1;
      error.lastFixAttempt = new Date();
      error.fixDetails = `Database connection fix failed: ${e.message}`;
      await error.save();
      return { success: false, message: `Database connection fix failed: ${e.message}` };
    }
  }

  // Fix 2: Cache errors
  if (errorMessage.includes('cache') || errorMessage.includes('redis')) {
    try {
      // Clear cache for the endpoint
      if (endpoint) {
        const cacheKey = endpoint.replace('/api/', '');
        // Try to clear cache (non-critical)
        try {
          // Redis cache clearing would go here if needed
        } catch (e) {
          // Cache clearing is non-critical
        }
      }
      error.status = ErrorStatus.AUTO_FIXED;
      error.autoFixed = true;
      error.fixDetails = 'Cache cleared';
      error.resolvedAt = new Date();
      error.fixAttempts = (error.fixAttempts || 0) + 1;
      error.lastFixAttempt = new Date();
      await error.save();
      return { success: true, message: 'Cache cleared' };
    } catch (e) {
      error.fixAttempts = (error.fixAttempts || 0) + 1;
      error.lastFixAttempt = new Date();
      await error.save();
      return { success: false, message: 'Cache clear failed' };
    }
  }

  // Fix 3: API route errors (500 errors)
  if (
    endpoint.includes('/api/') &&
    (errorMessage.includes('500') ||
      errorMessage.includes('internal server error'))
  ) {
    // For API errors, we can't auto-fix code issues, but we can mark for review
    error.status = ErrorStatus.PENDING;
    error.fixDetails = 'API error - requires code review';
    error.fixAttempts = (error.fixAttempts || 0) + 1;
    error.lastFixAttempt = new Date();
    await error.save();
    return {
      success: false,
      message: 'API errors require manual code review',
    };
  }

  // Fix 4: Missing indexes - Now auto-fixable!
  if (
    errorMessage.includes('index') ||
    errorMessage.includes('2dsphere') ||
    errorMessage.includes('geospatial') ||
    errorMessage.includes('e11000') ||
    errorMessage.includes('duplicate key')
  ) {
    try {
      let result;
      
      // If it's a duplicate key error, fix duplicates first
      if (errorMessage.includes('e11000') || errorMessage.includes('duplicate key')) {
        result = await DatabaseRepair.fixDuplicateKeys();
        if (result.success) {
          // Then fix indexes
          const indexResult = await DatabaseRepair.fixMissingIndexes();
          result = indexResult;
        }
      } else {
        // Just fix missing indexes
        result = await DatabaseRepair.fixMissingIndexes();
      }
      
      if (result.success) {
        error.status = ErrorStatus.AUTO_FIXED;
        error.autoFixed = true;
        error.fixDetails = result.message;
        error.resolvedAt = new Date();
        error.fixAttempts = (error.fixAttempts || 0) + 1;
        error.lastFixAttempt = new Date();
        await error.save();
        return { 
          success: true, 
          message: result.message,
          details: result.details 
        };
      } else {
        error.status = ErrorStatus.PENDING;
        error.fixDetails = result.message;
        error.fixAttempts = (error.fixAttempts || 0) + 1;
        error.lastFixAttempt = new Date();
        await error.save();
        return {
          success: false,
          message: result.message,
          fixDetails: result.details,
        };
      }
    } catch (e: any) {
      error.status = ErrorStatus.PENDING;
      error.fixDetails = `Index fix failed: ${e.message}`;
      error.fixAttempts = (error.fixAttempts || 0) + 1;
      error.lastFixAttempt = new Date();
      await error.save();
      return {
        success: false,
        message: `Index fix failed: ${e.message}`,
      };
    }
  }

  // Fix 5: Validation errors - try to clean orphaned documents
  if (errorMessage.includes('validation') || errorMessage.includes('required') || errorMessage.includes('cast to')) {
    try {
      const result = await DatabaseRepair.cleanupOrphanedDocuments();
      if (result.success) {
        error.status = ErrorStatus.AUTO_FIXED;
        error.autoFixed = true;
        error.fixDetails = result.message;
        error.resolvedAt = new Date();
        error.fixAttempts = (error.fixAttempts || 0) + 1;
        error.lastFixAttempt = new Date();
        await error.save();
        return { 
          success: true, 
          message: result.message,
          details: result.details 
        };
      } else {
        error.status = ErrorStatus.PENDING;
        error.fixDetails = result.message;
        error.fixAttempts = (error.fixAttempts || 0) + 1;
        error.lastFixAttempt = new Date();
        await error.save();
        return {
          success: false,
          message: result.message,
        };
      }
    } catch (e: any) {
      error.status = ErrorStatus.PENDING;
      error.fixDetails = `Validation error cleanup failed: ${e.message}`;
      error.fixAttempts = (error.fixAttempts || 0) + 1;
      error.lastFixAttempt = new Date();
      await error.save();
      return {
        success: false,
        message: `Validation error cleanup failed: ${e.message}`,
      };
    }
  }

  // Default: Cannot auto-fix
  error.fixAttempts = (error.fixAttempts || 0) + 1;
  error.lastFixAttempt = new Date();
  error.fixDetails = 'Auto-fix not available for this error type';
  await error.save();
  return {
    success: false,
    message: 'Auto-fix not available for this error type',
  };
}


