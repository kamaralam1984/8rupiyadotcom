/**
 * 🧠 GOLU WEEKLY SUMMARY GENERATOR
 * 
 * Automatically generates AI-powered weekly summaries of user interactions
 * Provides insights, statistics, and learned preferences
 */

import mongoose from 'mongoose';
import GoluConversation, { CommandCategory } from '@/models/GoluConversation';
import Reminder from '@/models/Reminder';
import UnprioritizedTask from '@/models/UnprioritizedTask';
import WeeklySummary, { SummaryType, SummaryStatus } from '@/models/WeeklySummary';
import { getEnhancedAIResponse } from '@/lib/gemini-ai';

// Get week number from date
function getWeekNumber(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

// Get start and end dates for a week
function getWeekDates(year: number, weekNumber: number): { startDate: Date; endDate: Date } {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  const endDate = new Date(ISOweekStart);
  endDate.setDate(endDate.getDate() + 6);
  return { startDate: ISOweekStart, endDate };
}

// Get current week dates
export function getCurrentWeekDates(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const { week, year } = getWeekNumber(now);
  return getWeekDates(year, week);
}

// Get last week dates
export function getLastWeekDates(): { startDate: Date; endDate: Date } {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  const { week, year } = getWeekNumber(now);
  return getWeekDates(year, week);
}

/**
 * Generate weekly summary for a user
 */
export async function generateWeeklySummary(
  userId: mongoose.Types.ObjectId | string,
  startDate?: Date,
  endDate?: Date
): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Use last week if dates not provided
    const dates = startDate && endDate 
      ? { startDate, endDate } 
      : getLastWeekDates();
    
    const { week, year } = getWeekNumber(dates.startDate);
    
    console.log(`📊 Generating weekly summary for user ${userId} (Week ${week}, ${year})`);
    
    // Check if summary already exists
    const existingSummary = await WeeklySummary.findOne({
      userId: new mongoose.Types.ObjectId(userId as string),
      type: SummaryType.WEEKLY,
      year,
      weekNumber: week,
    });
    
    if (existingSummary && existingSummary.status === SummaryStatus.COMPLETED) {
      console.log('✅ Summary already exists');
      return existingSummary;
    }
    
    // Fetch conversations for the week
    const conversations = await GoluConversation.find({
      userId: new mongoose.Types.ObjectId(userId as string),
      createdAt: {
        $gte: dates.startDate,
        $lte: dates.endDate,
      },
    })
      .sort({ createdAt: 1 })
      .lean();
    
    if (conversations.length === 0) {
      console.log('⚠️  No conversations found for this week');
      return null;
    }
    
    // Fetch reminders created during the week
    const reminders = await Reminder.find({
      userId: new mongoose.Types.ObjectId(userId as string),
      createdAt: {
        $gte: dates.startDate,
        $lte: dates.endDate,
      },
    }).lean();
    
    // Fetch tasks created during the week
    const tasks = await UnprioritizedTask.find({
      userId: new mongoose.Types.ObjectId(userId as string),
      createdAt: {
        $gte: dates.startDate,
        $lte: dates.endDate,
      },
    }).lean();
    
    // Calculate statistics
    const stats = calculateWeeklyStats(conversations, reminders, tasks);
    
    // Generate AI summary
    const aiSummary = await generateAISummary(conversations, stats);
    
    // Extract key insights
    const keyInsights = extractKeyInsights(conversations, stats);
    
    // Extract important events
    const importantEvents = extractImportantEvents(conversations);
    
    // Learn user preferences
    const preferences = learnUserPreferences(conversations);
    
    // Create or update summary
    let summary;
    if (existingSummary) {
      existingSummary.summary = aiSummary;
      existingSummary.keyInsights = keyInsights;
      existingSummary.topCategories = stats.topCategories;
      existingSummary.totalConversations = conversations.length;
      existingSummary.totalRemindersSet = reminders.length;
      existingSummary.totalTasksCreated = tasks.length;
      existingSummary.totalShopsSearched = stats.shopsSearched;
      existingSummary.activityBreakdown = stats.activityBreakdown;
      existingSummary.importantEvents = importantEvents;
      existingSummary.preferencesLearned = preferences;
      existingSummary.status = SummaryStatus.COMPLETED;
      existingSummary.conversationIds = conversations.map((c: any) => c._id);
      existingSummary.processingTimeMs = Date.now() - startTime;
      existingSummary.generatedAt = new Date();
      summary = await existingSummary.save();
    } else {
      summary = await WeeklySummary.create({
        userId: new mongoose.Types.ObjectId(userId as string),
        type: SummaryType.WEEKLY,
        startDate: dates.startDate,
        endDate: dates.endDate,
        weekNumber: week,
        year,
        summary: aiSummary,
        keyInsights,
        topCategories: stats.topCategories,
        totalConversations: conversations.length,
        totalRemindersSet: reminders.length,
        totalTasksCreated: tasks.length,
        totalShopsSearched: stats.shopsSearched,
        activityBreakdown: stats.activityBreakdown,
        importantEvents,
        preferencesLearned: preferences,
        status: SummaryStatus.COMPLETED,
        conversationIds: conversations.map((c: any) => c._id),
        processingTimeMs: Date.now() - startTime,
        generatedAt: new Date(),
      });
    }
    
    console.log(`✅ Weekly summary generated in ${Date.now() - startTime}ms`);
    return summary;
    
  } catch (error: any) {
    console.error('❌ Failed to generate weekly summary:', error);
    throw error;
  }
}

/**
 * Calculate weekly statistics
 */
function calculateWeeklyStats(conversations: any[], reminders: any[], tasks: any[]) {
  const categoryCount: { [key: string]: number } = {};
  const activityBreakdown: any = {
    shopping: 0,
    reminders: 0,
    medical: 0,
    financial: 0,
    family: 0,
    astrology: 0,
    travel: 0,
    business: 0,
    general: 0,
  };
  
  let shopsSearched = 0;
  
  conversations.forEach((conv) => {
    const category = conv.category || 'GENERAL';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
    
    // Activity breakdown
    const cat = category.toLowerCase();
    if (cat === 'shopping' || cat === 'shop_search') {
      activityBreakdown.shopping++;
      if (conv.metadata?.shops?.length > 0) {
        shopsSearched += conv.metadata.shops.length;
      }
    } else if (cat === 'alarm' || cat === 'reminder') {
      activityBreakdown.reminders++;
    } else if (cat === 'medical' || cat === 'health') {
      activityBreakdown.medical++;
    } else if (cat === 'financial' || cat === 'finance') {
      activityBreakdown.financial++;
    } else if (cat === 'family') {
      activityBreakdown.family++;
    } else if (cat === 'astrology' || cat === 'jyotish') {
      activityBreakdown.astrology++;
    } else if (cat === 'travel') {
      activityBreakdown.travel++;
    } else if (cat === 'business') {
      activityBreakdown.business++;
    } else {
      activityBreakdown.general++;
    }
  });
  
  // Sort categories by count
  const topCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    topCategories,
    activityBreakdown,
    shopsSearched,
  };
}

/**
 * Generate AI-powered summary using Gemini
 */
async function generateAISummary(conversations: any[], stats: any): Promise<string> {
  try {
    // Prepare conversation context
    const conversationSample = conversations
      .slice(0, 20) // First 20 conversations
      .map((c, i) => `${i + 1}. User: "${c.userQuery}"\n   GOLU: "${c.goluResponse?.substring(0, 100)}..."`)
      .join('\n\n');
    
    const prompt = `
आप GOLU के weekly summary generator हैं। नीचे दिए गए conversations और stats को analyze करके एक friendly, personalized weekly summary बनाइए।

📊 WEEK STATISTICS:
- Total Conversations: ${conversations.length}
- Top Categories: ${stats.topCategories.map((c: any) => `${c.category} (${c.count})`).join(', ')}
- Activity: Shopping (${stats.activityBreakdown.shopping}), Reminders (${stats.activityBreakdown.reminders}), Medical (${stats.activityBreakdown.medical}), Financial (${stats.activityBreakdown.financial})

💬 SAMPLE CONVERSATIONS:
${conversationSample}

Generate a warm, friendly summary in Hinglish that:
1. Highlights main activities this week
2. Mentions interesting patterns
3. Appreciates user's engagement
4. Encourages continued use
5. Keep it under 300 words
6. Use emojis for friendliness

Style: Friendly, conversational Hinglish (like GOLU talks)
`;
    
    const fallbackResponse = 'Is week bahut achha raha! Aapne GOLU ke saath achhi baatcheet ki. 🎉';
    const aiResponse = await getEnhancedAIResponse(prompt, 'weekly-summary', fallbackResponse);
    return aiResponse;
    
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return `Is week aapne ${conversations.length} conversations kiye! Bahut achha engagement raha. 🎉`;
  }
}

/**
 * Extract key insights from conversations
 */
function extractKeyInsights(conversations: any[], stats: any): string[] {
  const insights: string[] = [];
  
  // Most active day
  const dayCount: { [key: string]: number } = {};
  conversations.forEach((c) => {
    const day = new Date(c.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
  if (mostActiveDay) {
    insights.push(`${mostActiveDay[0]} ko sabse zyada active rahe (${mostActiveDay[1]} conversations)`);
  }
  
  // Top category
  if (stats.topCategories.length > 0) {
    const top = stats.topCategories[0];
    insights.push(`${top.category} me sabse zyada interest dikha (${top.count} queries)`);
  }
  
  // Shopping activity
  if (stats.activityBreakdown.shopping > 0) {
    insights.push(`${stats.activityBreakdown.shopping} baar shopping help maangi, ${stats.shopsSearched} shops dekhe`);
  }
  
  // Reminders
  if (stats.activityBreakdown.reminders > 0) {
    insights.push(`${stats.activityBreakdown.reminders} reminders set kiye - organized ho rahe hain! 👍`);
  }
  
  // Medical/Health
  if (stats.activityBreakdown.medical > 0) {
    insights.push(`Health ke liye ${stats.activityBreakdown.medical} queries - swasthya ka dhyan rakh rahe hain! 💪`);
  }
  
  return insights.slice(0, 5); // Top 5 insights
}

/**
 * Extract important events from conversations
 */
function extractImportantEvents(conversations: any[]): any[] {
  const events: any[] = [];
  
  conversations.forEach((conv) => {
    // Look for important keywords
    const query = conv.userQuery?.toLowerCase() || '';
    const category = conv.category || 'GENERAL';
    
    if (query.includes('appointment') || query.includes('meeting') || query.includes('doctor')) {
      events.push({
        date: conv.createdAt,
        event: conv.userQuery.substring(0, 100),
        category: 'APPOINTMENT',
      });
    } else if (query.includes('salary') || query.includes('rent') || query.includes('bill')) {
      events.push({
        date: conv.createdAt,
        event: conv.userQuery.substring(0, 100),
        category: 'FINANCIAL',
      });
    } else if (category === 'MEDICAL' || category === 'HEALTH') {
      events.push({
        date: conv.createdAt,
        event: conv.userQuery.substring(0, 100),
        category: 'MEDICAL',
      });
    }
  });
  
  return events.slice(0, 10); // Top 10 important events
}

/**
 * Learn user preferences from conversations
 */
function learnUserPreferences(conversations: any[]): any {
  const languages: { [key: string]: number } = {};
  const queries: { [key: string]: number } = {};
  const categories: { [key: string]: number } = {};
  const hourCounts: number[] = new Array(24).fill(0);
  
  conversations.forEach((conv) => {
    // Language preference
    const lang = conv.detectedLanguage || 'hi';
    languages[lang] = (languages[lang] || 0) + 1;
    
    // Common queries
    const query = conv.userQuery?.toLowerCase().substring(0, 50) || '';
    queries[query] = (queries[query] || 0) + 1;
    
    // Category preference
    const cat = conv.category || 'GENERAL';
    categories[cat] = (categories[cat] || 0) + 1;
    
    // Active hours
    const hour = new Date(conv.createdAt).getHours();
    hourCounts[hour]++;
  });
  
  // Find preferred language
  const preferredLanguage = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'hi';
  
  // Find common queries (top 5)
  const commonQueries = Object.entries(queries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([q]) => q);
  
  // Find frequent categories (top 3)
  const frequentCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c);
  
  // Find most active time range
  let maxHour = 0;
  let maxCount = 0;
  for (let i = 0; i < 24; i++) {
    if (hourCounts[i] > maxCount) {
      maxCount = hourCounts[i];
      maxHour = i;
    }
  }
  
  let activeHours = 'General';
  if (maxHour >= 6 && maxHour < 12) activeHours = 'Morning (6-12 AM)';
  else if (maxHour >= 12 && maxHour < 17) activeHours = 'Afternoon (12-5 PM)';
  else if (maxHour >= 17 && maxHour < 21) activeHours = 'Evening (5-9 PM)';
  else activeHours = 'Night (9 PM-6 AM)';
  
  return {
    preferredLanguage,
    commonQueries,
    frequentCategories,
    activeHours,
  };
}

/**
 * Get user's latest weekly summary
 */
export async function getLatestWeeklySummary(userId: mongoose.Types.ObjectId | string) {
  try {
    const summary = await WeeklySummary.findOne({
      userId: new mongoose.Types.ObjectId(userId as string),
      status: SummaryStatus.COMPLETED,
    })
      .sort({ endDate: -1 })
      .lean();
    
    return summary;
  } catch (error) {
    console.error('Failed to get latest summary:', error);
    return null;
  }
}

/**
 * Get all summaries for a user
 */
export async function getUserWeeklySummaries(
  userId: mongoose.Types.ObjectId | string,
  limit: number = 10
) {
  try {
    const summaries = await WeeklySummary.find({
      userId: new mongoose.Types.ObjectId(userId as string),
      status: SummaryStatus.COMPLETED,
    })
      .sort({ endDate: -1 })
      .limit(limit)
      .lean();
    
    return summaries;
  } catch (error) {
    console.error('Failed to get summaries:', error);
    return [];
  }
}

/**
 * Check if summary needs to be generated
 */
export async function checkAndGenerateSummary(userId: mongoose.Types.ObjectId | string) {
  try {
    const lastWeek = getLastWeekDates();
    const { week, year } = getWeekNumber(lastWeek.startDate);
    
    // Check if summary exists for last week
    const exists = await WeeklySummary.findOne({
      userId: new mongoose.Types.ObjectId(userId as string),
      type: SummaryType.WEEKLY,
      year,
      weekNumber: week,
    });
    
    if (!exists) {
      console.log(`📊 Generating missing summary for week ${week}, ${year}`);
      return await generateWeeklySummary(userId);
    }
    
    return exists;
  } catch (error) {
    console.error('Failed to check/generate summary:', error);
    return null;
  }
}

/**
 * Generate summaries for all active users (cron job)
 */
export async function generateAllWeeklySummaries() {
  try {
    console.log('📊 Starting weekly summary generation for all users...');
    
    const lastWeek = getLastWeekDates();
    
    // Find all users who had conversations last week
    const userIds = await GoluConversation.distinct('userId', {
      createdAt: {
        $gte: lastWeek.startDate,
        $lte: lastWeek.endDate,
      },
      userId: { $ne: null },
    });
    
    console.log(`Found ${userIds.length} active users for last week`);
    
    const results = [];
    for (const userId of userIds) {
      try {
        const summary = await generateWeeklySummary(userId);
        if (summary) {
          results.push({ userId, success: true });
        }
      } catch (error) {
        console.error(`Failed for user ${userId}:`, error);
        results.push({ userId, success: false, error });
      }
    }
    
    console.log(`✅ Generated ${results.filter(r => r.success).length}/${userIds.length} summaries`);
    return results;
    
  } catch (error) {
    console.error('❌ Failed to generate all summaries:', error);
    throw error;
  }
}

