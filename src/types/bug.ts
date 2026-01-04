// Bug management types
export enum BugPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BugSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  SEVERE = 'severe',
}

export enum BugStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  FIXED = 'fixed',
  CLOSED = 'closed',
  REOPENED = 'reopened',
  IGNORED = 'ignored',
}

export enum BugCategory {
  UI_UX = 'ui_ux',
  FUNCTIONALITY = 'functionality',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  DATA = 'data',
  API = 'api',
  INTEGRATION = 'integration',
  OTHER = 'other',
}

export interface Bug {
  _id: string;
  title: string;
  description: string;
  priority: BugPriority;
  severity: BugSeverity;
  status: BugStatus;
  category: BugCategory;
  errorId?: string; // Link to Error model if bug originated from error
  assignedTo?: string;
  reportedBy?: string;
  tags?: string[];
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: string;
  browser?: string;
  device?: string;
  screenshots?: string[];
  relatedBugs?: string[];
  preventionRules?: string[]; // IDs of prevention rules that should prevent this bug
  fixDetails?: string;
  fixCode?: string;
  testResults?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface BugPreventionRule {
  _id: string;
  name: string;
  description: string;
  pattern: string; // Regex or pattern to match
  category: BugCategory;
  priority: BugPriority;
  action: 'block' | 'warn' | 'log';
  enabled: boolean;
  conditions?: Record<string, any>;
  preventionCode?: string; // Code snippet that prevents the bug
  examples?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BugStats {
  total: number;
  byStatus: Record<BugStatus, number>;
  byPriority: Record<BugPriority, number>;
  bySeverity: Record<BugSeverity, number>;
  byCategory: Record<BugCategory, number>;
  recent: number; // Bugs in last 7 days
  fixed: number; // Fixed in last 30 days
  avgResolutionTime: number; // Average hours to fix
}

