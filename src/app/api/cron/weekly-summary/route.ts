import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { generateAllWeeklySummaries } from '@/lib/goluWeeklySummary';

/**
 * CRON JOB: Generate Weekly Summaries
 * 
 * This endpoint should be called weekly to generate summaries for all active users
 * 
 * Setup with Vercel Cron Jobs:
 * 1. Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-summary",
 *     "schedule": "0 0 * * 1"  // Every Monday at midnight
 *   }]
 * }
 * 
 * Or use external cron service (cron-job.org, EasyCron, etc.) to call:
 * POST https://8rupiya.com/api/cron/weekly-summary
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify authorization (protect cron endpoint)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid cron secret.' },
        { status: 401 }
      );
    }
    
    console.log('🔄 Starting weekly summary generation cron job...');
    
    await connectDB();
    
    // Generate summaries for all active users
    const results = await generateAllWeeklySummaries();
    
    const successCount = results.filter((r: any) => r.success).length;
    const failureCount = results.length - successCount;
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Weekly summary cron job completed in ${duration}ms`);
    console.log(`✅ Success: ${successCount}, ❌ Failed: ${failureCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Weekly summary generation completed',
      stats: {
        totalUsers: results.length,
        successCount,
        failureCount,
        durationMs: duration,
      },
      results,
    });
    
  } catch (error: any) {
    console.error('❌ Weekly summary cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Weekly summary generation failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual trigger (with auth)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';
  
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid cron secret.' },
      { status: 401 }
    );
  }
  
  // Call the POST handler
  return POST(req);
}

