import BugPreventionRule from '@/models/BugPreventionRule';
import Bug from '@/models/Bug';
import { BugCategory, BugPriority, BugSeverity, BugStatus } from '@/types/bug';
import connectDB from './mongodb';

/**
 * Check if an error matches any prevention rules
 */
export async function checkBugPrevention(
  errorMessage: string,
  errorType: string,
  endpoint?: string
): Promise<{ matched: boolean; rule?: any; action?: 'block' | 'warn' | 'log' }> {
  try {
    await connectDB();

    const rules = await BugPreventionRule.find({ enabled: true }).lean();

    for (const rule of rules) {
      try {
        // Check if error message matches pattern
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(errorMessage) || (endpoint && regex.test(endpoint))) {
          return {
            matched: true,
            rule,
            action: rule.action,
          };
        }
      } catch (err) {
        // Invalid regex pattern, skip
        console.error('Invalid regex pattern in prevention rule:', rule.name);
      }
    }

    return { matched: false };
  } catch (error) {
    console.error('Error checking bug prevention:', error);
    return { matched: false };
  }
}

/**
 * Automatically create a bug from an error
 */
export async function createBugFromError(
  errorId: string,
  errorMessage: string,
  errorType: string,
  endpoint?: string,
  stack?: string
): Promise<string | null> {
  try {
    await connectDB();

    // Determine bug category from error type
    let category = BugCategory.OTHER;
    let priority = BugPriority.MEDIUM;
    let severity = BugSeverity.MODERATE;

    if (errorType.includes('database') || errorType.includes('db')) {
      category = BugCategory.DATA;
      priority = BugPriority.HIGH;
      severity = BugSeverity.MAJOR;
    } else if (errorType.includes('api')) {
      category = BugCategory.API;
      priority = BugPriority.HIGH;
    } else if (errorType.includes('auth') || errorType.includes('security')) {
      category = BugCategory.SECURITY;
      priority = BugPriority.CRITICAL;
      severity = BugSeverity.SEVERE;
    } else if (errorType.includes('validation')) {
      category = BugCategory.FUNCTIONALITY;
      priority = BugPriority.MEDIUM;
    } else if (errorType.includes('network')) {
      category = BugCategory.INTEGRATION;
      priority = BugPriority.HIGH;
    }

    // Check if bug already exists for this error
    const existingBug = await Bug.findOne({ errorId }).lean();
    if (existingBug) {
      return existingBug._id.toString();
    }

    // Create new bug
    const bug = new Bug({
      title: errorMessage.substring(0, 100),
      description: errorMessage,
      priority,
      severity,
      category,
      status: BugStatus.NEW,
      errorId,
      actualBehavior: errorMessage,
      environment: process.env.NODE_ENV || 'production',
      metadata: {
        errorType,
        endpoint,
        stack: stack?.substring(0, 1000), // Limit stack length
        autoCreated: true,
      },
    });

    await bug.save();

    return bug._id.toString();
  } catch (error) {
    console.error('Error creating bug from error:', error);
    return null;
  }
}

/**
 * Apply prevention rules to prevent bugs
 */
export async function applyPreventionRules(
  code: string,
  context?: Record<string, any>
): Promise<{ blocked: boolean; warnings: string[] }> {
  try {
    await connectDB();

    const rules = await BugPreventionRule.find({ enabled: true }).lean();
    const warnings: string[] = [];

    for (const rule of rules) {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(code)) {
          if (rule.action === 'block') {
            return { blocked: true, warnings: [`Blocked by rule: ${rule.name}`] };
          } else if (rule.action === 'warn') {
            warnings.push(`Warning: ${rule.description}`);
          }
        }
      } catch (err) {
        // Invalid regex, skip
      }
    }

    return { blocked: false, warnings };
  } catch (error) {
    console.error('Error applying prevention rules:', error);
    return { blocked: false, warnings: [] };
  }
}

