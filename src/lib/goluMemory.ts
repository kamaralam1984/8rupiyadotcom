/**
 * GOLU Memory Management System
 * Handles 7-day conversation memory for context continuity
 */

import ConversationMemory from '@/models/ConversationMemory';
import type { UserRole } from './goluPersonas';

/**
 * PART 2: MEMORY SAVE (conversation ke end me)
 * Save conversation to memory after each interaction
 */
export async function saveConversationMemory(params: {
  userId: string;
  sessionId: string;
  userName: string;
  userRole: UserRole;
  query: string;
  response: string;
  category: string;
}): Promise<void> {
  try {
    const { userId, sessionId, userName, userRole, query, response, category } = params;

    // Find or create memory for this session
    let memory = await ConversationMemory.findOne({
      userId,
      sessionId,
    });

    if (!memory) {
      // Create new memory
      memory = await ConversationMemory.create({
        userId,
        sessionId,
        userName,
        userRole,
        conversations: [],
        summary: '',
        importantInfo: [],
      });
    }

    // Add new conversation
    memory.conversations.push({
      query,
      response,
      category,
      timestamp: new Date(),
    });

    // Update last accessed time
    memory.lastAccessedAt = new Date();

    // Extract important info (names, dates, numbers, etc.)
    const newImportantInfo = extractImportantInfo(query, response);
    if (newImportantInfo.length > 0) {
      memory.importantInfo.push(...newImportantInfo);
      // Keep only last 10 important facts
      if (memory.importantInfo.length > 10) {
        memory.importantInfo = memory.importantInfo.slice(-10);
      }
    }

    await memory.save();

    console.log(`💾 GOLU Memory: Saved conversation for ${userName} (${memory.conversations.length} total)`);
  } catch (error) {
    console.error('❌ GOLU Memory: Failed to save:', error);
    // Don't throw - memory failure shouldn't break chat
  }
}

/**
 * PART 3: MEMORY LOAD (chat ke start me)
 * Load recent memories for context
 */
export async function loadConversationMemory(params: {
  userId: string;
  sessionId?: string;
  limit?: number;
}): Promise<string> {
  try {
    const { userId, sessionId, limit = 5 } = params;

    // Find recent memories for this user
    const query: any = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const memories = await ConversationMemory.find(query)
      .sort({ lastAccessedAt: -1 })
      .limit(3) // Get last 3 sessions
      .lean();

    if (!memories || memories.length === 0) {
      return '';
    }

    // Build memory context
    let memoryContext = '🧠 RECENT CONVERSATION HISTORY:\n\n';

    for (const memory of memories) {
      const recentConvs = memory.conversations.slice(-limit);
      
      if (recentConvs.length > 0) {
        memoryContext += `Session: ${formatDate(memory.lastAccessedAt)}\n`;
        
        recentConvs.forEach((conv: any, idx: number) => {
          memoryContext += `${idx + 1}. User: "${conv.query}"\n`;
          memoryContext += `   GOLU: "${conv.response.substring(0, 100)}..."\n`;
        });

        // Add important info
        if (memory.importantInfo && memory.importantInfo.length > 0) {
          memoryContext += `\nKey Info: ${memory.importantInfo.join(', ')}\n`;
        }

        memoryContext += '\n';
      }
    }

    memoryContext += `\n📌 USE THIS CONTEXT: Reference past conversations naturally. Don't repeat already solved issues.`;

    console.log(`🧠 GOLU Memory: Loaded ${memories.length} recent sessions`);
    return memoryContext;
  } catch (error) {
    console.error('❌ GOLU Memory: Failed to load:', error);
    return '';
  }
}

/**
 * Get memory summary for system prompt
 */
export async function getMemorySummary(userId: string): Promise<{
  hasMemory: boolean;
  totalConversations: number;
  importantFacts: string[];
  lastInteraction: Date | null;
}> {
  try {
    const memories = await ConversationMemory.find({ userId })
      .sort({ lastAccessedAt: -1 })
      .limit(5)
      .lean();

    if (!memories || memories.length === 0) {
      return {
        hasMemory: false,
        totalConversations: 0,
        importantFacts: [],
        lastInteraction: null,
      };
    }

    const totalConversations = memories.reduce((sum, m) => sum + m.conversations.length, 0);
    const allImportantFacts = memories
      .flatMap(m => m.importantInfo || [])
      .filter((fact, idx, arr) => arr.indexOf(fact) === idx) // Unique
      .slice(0, 5); // Top 5

    return {
      hasMemory: true,
      totalConversations,
      importantFacts: allImportantFacts,
      lastInteraction: memories[0].lastAccessedAt,
    };
  } catch (error) {
    console.error('❌ GOLU Memory: Failed to get summary:', error);
    return {
      hasMemory: false,
      totalConversations: 0,
      importantFacts: [],
      lastInteraction: null,
    };
  }
}

/**
 * Clean old memories (older than 7 days)
 * Run this periodically
 */
export async function cleanOldMemories(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await ConversationMemory.deleteMany({
      lastAccessedAt: { $lt: sevenDaysAgo },
    });

    if (result.deletedCount && result.deletedCount > 0) {
      console.log(`🧹 GOLU Memory: Cleaned ${result.deletedCount} old memories`);
    }

    return result.deletedCount || 0;
  } catch (error) {
    console.error('❌ GOLU Memory: Failed to clean:', error);
    return 0;
  }
}

/**
 * Extract important information from conversation
 * Names, dates, numbers, promises, etc.
 */
function extractImportantInfo(query: string, response: string): string[] {
  const important: string[] = [];
  const combined = `${query} ${response}`.toLowerCase();

  // Extract names (capitalized words)
  const nameMatches = query.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g);
  if (nameMatches) {
    important.push(...nameMatches.slice(0, 2));
  }

  // Extract numbers/amounts
  const numberMatches = combined.match(/₹[\d,]+|[\d,]+\s*rupees?/gi);
  if (numberMatches) {
    important.push(...numberMatches.slice(0, 2));
  }

  // Extract dates
  const dateMatches = combined.match(/\d+\s*(?:january|february|march|april|may|june|july|august|september|october|november|december|\d+\s*tareekh)/gi);
  if (dateMatches) {
    important.push(...dateMatches.slice(0, 2));
  }

  // Extract promises/commitments
  if (response.includes('set kar diya') || response.includes('reminder') || response.includes('yaad dilaunga')) {
    important.push('Reminder set');
  }

  return important.filter(Boolean).slice(0, 5);
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString('en-IN');
}

/**
 * PART 4: System prompt memory injection
 */
export function injectMemoryIntoPrompt(
  basePrompt: string,
  memoryContext: string,
  memorySummary: {
    hasMemory: boolean;
    totalConversations: number;
    importantFacts: string[];
  }
): string {
  if (!memoryContext && !memorySummary.hasMemory) {
    return basePrompt;
  }

  let enrichedPrompt = basePrompt;

  // Add memory summary
  if (memorySummary.hasMemory) {
    enrichedPrompt += `\n\n🔹 CONVERSATION HISTORY AVAILABLE:\n`;
    enrichedPrompt += `- Previous conversations: ${memorySummary.totalConversations}\n`;
    if (memorySummary.importantFacts.length > 0) {
      enrichedPrompt += `- Key facts: ${memorySummary.importantFacts.join(', ')}\n`;
    }
  }

  // Add recent context
  if (memoryContext) {
    enrichedPrompt += `\n\n${memoryContext}`;
  }

  // Add memory usage rules
  enrichedPrompt += `\n\n🎯 MEMORY USAGE RULES:
- Reference past conversations naturally
- Don't repeat already solved issues
- Build on previous context
- Show continuity in responses
- If user mentions something from past, acknowledge it`;

  return enrichedPrompt;
}

