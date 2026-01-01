import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WeeklySummary, { SummaryStatus } from '@/models/WeeklySummary';
import { withAuth, AuthRequest } from '@/middleware/auth';
import {
  generateWeeklySummary,
  getLatestWeeklySummary,
  getUserWeeklySummaries,
  checkAndGenerateSummary,
  getCurrentWeekDates,
  getLastWeekDates,
} from '@/lib/goluWeeklySummary';

// GET /api/golu/summary - Get weekly summaries for authenticated user
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    const { userId } = req.user as any;
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    if (action === 'latest') {
      // Get latest summary
      const summary = await getLatestWeeklySummary(userId);
      
      if (!summary) {
        return NextResponse.json({
          success: false,
          message: 'No summaries found',
          summary: null,
        });
      }
      
      return NextResponse.json({
        success: true,
        summary,
      });
      
    } else if (action === 'list') {
      // Get all summaries
      const summaries = await getUserWeeklySummaries(userId, limit);
      
      return NextResponse.json({
        success: true,
        summaries,
        count: summaries.length,
      });
      
    } else if (action === 'stats') {
      // Get summary statistics
      const stats = await WeeklySummary.getSummaryStats(userId);
      
      return NextResponse.json({
        success: true,
        stats,
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use: latest, list, or stats' },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('Failed to fetch summaries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST /api/golu/summary - Generate a new weekly summary
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    const { userId, name } = req.user as any;
    const body = await req.json();
    
    const { action = 'generate', startDate, endDate } = body;
    
    if (action === 'generate') {
      // Generate summary for specific period or last week
      let dates;
      if (startDate && endDate) {
        dates = {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        };
      } else {
        dates = getLastWeekDates();
      }
      
      console.log(`📊 Generating summary for ${name} (${dates.startDate} to ${dates.endDate})`);
      
      const summary = await generateWeeklySummary(userId, dates.startDate, dates.endDate);
      
      if (!summary) {
        return NextResponse.json({
          success: false,
          message: 'No conversations found for this period',
        });
      }
      
      return NextResponse.json({
        success: true,
        summary,
        message: 'Summary generated successfully',
      });
      
    } else if (action === 'check') {
      // Check if last week's summary exists, generate if not
      const summary = await checkAndGenerateSummary(userId);
      
      return NextResponse.json({
        success: true,
        summary,
        message: summary ? 'Summary ready' : 'No conversations to summarize',
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use: generate or check' },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('Failed to generate summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

