/**
 * Export utilities for analytics data
 */

export interface ExportData {
  headers: string[];
  rows: any[][];
  filename: string;
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: ExportData) {
  const { headers, rows, filename } = data;

  // Create CSV content
  let csvContent = headers.join(',') + '\n';

  rows.forEach((row) => {
    const escapedRow = row.map((cell) => {
      // Escape quotes and wrap in quotes if contains comma
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    csvContent += escapedRow.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export analytics stats to CSV
 */
export function exportStatsToCSV(stats: any, range: string) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const data: ExportData = {
    filename: `8rupiya-analytics-${range}-${timestamp}.csv`,
    headers: ['Metric', 'Value'],
    rows: [
      ['Report Date', new Date().toLocaleString()],
      ['Date Range', range],
      [''],
      ['=== OVERVIEW ===', ''],
      ['Total Visits', stats.totalVisits],
      ['Unique Visitors', stats.uniqueVisitors],
      ['Returning Visitors', stats.returningVisitors],
      ['Average Time Spent (seconds)', stats.avgTimeSpent],
      [''],
      ['=== SHOPS ===', ''],
      ['Total Shops', stats.totalShops],
      ['Active Shops', stats.activeShops],
      ['Inactive Shops', stats.inactiveShops],
      [''],
      ['=== DEVICE BREAKDOWN ===', ''],
      ['Mobile', stats.deviceBreakdown.mobile],
      ['Desktop', stats.deviceBreakdown.desktop],
      ['Tablet', stats.deviceBreakdown.tablet],
      [''],
      ['=== TRAFFIC SOURCE ===', ''],
      ['Direct', stats.trafficSource.direct],
      ['Search', stats.trafficSource.search],
      ['Social', stats.trafficSource.social],
      ['Referral', stats.trafficSource.referral],
    ],
  };

  exportToCSV(data);
}

/**
 * Export top pages to CSV
 */
export function exportTopPagesToCSV(topPages: Array<{ path: string; views: number }>) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const data: ExportData = {
    filename: `8rupiya-top-pages-${timestamp}.csv`,
    headers: ['Page', 'Views'],
    rows: topPages.map((page) => [page.path, page.views]),
  };

  exportToCSV(data);
}

/**
 * Export daily trend to CSV
 */
export function exportDailyTrendToCSV(dailyData: Array<{ date: string; visits: number }>) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const data: ExportData = {
    filename: `8rupiya-daily-trend-${timestamp}.csv`,
    headers: ['Date', 'Visits'],
    rows: dailyData.map((day) => [day.date, day.visits]),
  };

  exportToCSV(data);
}

/**
 * Export complete analytics report
 */
export function exportCompleteReport(stats: any, range: string) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const rows: any[][] = [
    ['8Rupiya Analytics Report'],
    ['Generated:', new Date().toLocaleString()],
    ['Date Range:', range],
    [''],
    ['=== OVERVIEW ==='],
    ['Total Visits', stats.totalVisits],
    ['Unique Visitors', stats.uniqueVisitors],
    ['Returning Visitors', stats.returningVisitors],
    ['Average Time Spent', `${Math.floor(stats.avgTimeSpent / 60)}m ${stats.avgTimeSpent % 60}s`],
    [''],
    ['=== SHOPS ==='],
    ['Total Shops', stats.totalShops],
    ['Active Shops', stats.activeShops],
    ['Inactive Shops', stats.inactiveShops],
    [''],
    ['=== DEVICE BREAKDOWN ==='],
    ['Device', 'Count', 'Percentage'],
    [
      'Mobile',
      stats.deviceBreakdown.mobile,
      `${((stats.deviceBreakdown.mobile / stats.totalVisits) * 100).toFixed(1)}%`,
    ],
    [
      'Desktop',
      stats.deviceBreakdown.desktop,
      `${((stats.deviceBreakdown.desktop / stats.totalVisits) * 100).toFixed(1)}%`,
    ],
    [
      'Tablet',
      stats.deviceBreakdown.tablet,
      `${((stats.deviceBreakdown.tablet / stats.totalVisits) * 100).toFixed(1)}%`,
    ],
    [''],
    ['=== TRAFFIC SOURCE ==='],
    ['Source', 'Count', 'Percentage'],
    [
      'Direct',
      stats.trafficSource.direct,
      `${((stats.trafficSource.direct / stats.totalVisits) * 100).toFixed(1)}%`,
    ],
    [
      'Search',
      stats.trafficSource.search,
      `${((stats.trafficSource.search / stats.totalVisits) * 100).toFixed(1)}%`,
    ],
    [
      'Social',
      stats.trafficSource.social,
      `${((stats.trafficSource.social / stats.totalVisits) * 100).toFixed(1)}%`,
    ],
    [
      'Referral',
      stats.trafficSource.referral,
      `${((stats.trafficSource.referral / stats.totalVisits) * 100).toFixed(1)}%`,
    ],
    [''],
    ['=== TOP PAGES ==='],
    ['Page', 'Views'],
  ];

  stats.topPages.forEach((page: any) => {
    rows.push([page.path, page.views]);
  });

  rows.push(['']);
  rows.push(['=== DAILY TREND ===']);
  rows.push(['Date', 'Visits']);

  stats.trends.daily.forEach((day: any) => {
    rows.push([day.date, day.visits]);
  });

  const data: ExportData = {
    filename: `8rupiya-complete-report-${range}-${timestamp}.csv`,
    headers: [],
    rows,
  };

  // Create CSV without headers (first row is title)
  let csvContent = '';
  rows.forEach((row) => {
    const escapedRow = row.map((cell: any) => {
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    csvContent += escapedRow.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', data.filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

