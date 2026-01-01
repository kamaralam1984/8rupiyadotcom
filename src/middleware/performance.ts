/**
 * ⚡ PERFORMANCE MONITORING MIDDLEWARE
 * Tracks response times and optimizes API calls
 */

import { NextRequest, NextResponse } from 'next/server';

// Performance metrics
interface PerformanceMetrics {
  path: string;
  method: string;
  duration: number;
  timestamp: Date;
  status: number;
}

// Store recent metrics (in-memory, limited to last 100)
const recentMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 100;

/**
 * Performance monitoring middleware
 */
export function performanceMiddleware(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const path = req.nextUrl.pathname;
    const method = req.method;

    try {
      // Execute the handler
      const response = await handler(req, ...args);
      
      // Calculate duration
      const duration = Date.now() - startTime;
      
      // Log slow requests (> 1 second)
      if (duration > 1000) {
        console.warn(`⚠️  Slow request: ${method} ${path} took ${duration}ms`);
      }
      
      // Store metrics
      storeMetric({
        path,
        method,
        duration,
        timestamp: new Date(),
        status: response.status || 200,
      });
      
      // Add performance headers
      if (response instanceof NextResponse) {
        response.headers.set('X-Response-Time', `${duration}ms`);
        response.headers.set('X-Cache-Status', response.headers.get('X-Cache-Status') || 'MISS');
      }
      
      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Log error with timing
      console.error(`❌ Request failed: ${method} ${path} (${duration}ms)`, error.message);
      
      // Store error metric
      storeMetric({
        path,
        method,
        duration,
        timestamp: new Date(),
        status: 500,
      });
      
      throw error;
    }
  };
}

/**
 * Store performance metric
 */
function storeMetric(metric: PerformanceMetrics) {
  recentMetrics.push(metric);
  
  // Keep only last MAX_METRICS
  if (recentMetrics.length > MAX_METRICS) {
    recentMetrics.shift();
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  if (recentMetrics.length === 0) {
    return null;
  }
  
  const durations = recentMetrics.map(m => m.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  const minDuration = Math.min(...durations);
  
  // Count by path
  const byPath: { [key: string]: number } = {};
  recentMetrics.forEach(m => {
    byPath[m.path] = (byPath[m.path] || 0) + 1;
  });
  
  // Count slow requests (> 1 second)
  const slowRequests = recentMetrics.filter(m => m.duration > 1000).length;
  
  return {
    totalRequests: recentMetrics.length,
    avgDuration: Math.round(avgDuration),
    maxDuration: Math.round(maxDuration),
    minDuration: Math.round(minDuration),
    slowRequests,
    slowPercentage: ((slowRequests / recentMetrics.length) * 100).toFixed(2),
    mostRequested: Object.entries(byPath).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}

/**
 * Clear metrics
 */
export function clearMetrics() {
  recentMetrics.length = 0;
}

