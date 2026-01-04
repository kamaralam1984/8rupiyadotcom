import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import { DatabaseRepair } from '@/lib/databaseRepair';

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

    const body = await req.json();
    const { repairType } = body;

    if (!repairType) {
      return NextResponse.json(
        { error: 'repairType is required' },
        { status: 400 }
      );
    }

    let result;

    switch (repairType) {
      case 'connection':
        result = await DatabaseRepair.fixConnection();
        break;
      case 'indexes':
        result = await DatabaseRepair.fixMissingIndexes();
        break;
      case 'duplicates':
        result = await DatabaseRepair.fixDuplicateKeys();
        break;
      case 'orphaned':
        result = await DatabaseRepair.cleanupOrphanedDocuments();
        break;
      case 'rebuild':
        result = await DatabaseRepair.rebuildIndexes();
        break;
      case 'all':
        result = await DatabaseRepair.runAllRepairs();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid repairType' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('Database repair error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to repair database', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

