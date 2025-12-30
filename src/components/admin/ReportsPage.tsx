'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiFileText,
  FiDownload,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiShoppingBag,
  FiPercent,
  FiUserCheck,
  FiRefreshCw,
  FiTrendingUp,
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);

  const reportTypes: ReportType[] = [
    {
      id: 'revenue',
      name: 'Revenue Report',
      description: 'All successful payments and revenue',
      icon: FiDollarSign,
      color: 'green',
    },
    {
      id: 'commissions',
      name: 'Commission Report',
      description: 'Agent, Operator, and Company commissions',
      icon: FiPercent,
      color: 'purple',
    },
    {
      id: 'shops',
      name: 'Shops Report',
      description: 'All registered shops with details',
      icon: FiShoppingBag,
      color: 'blue',
    },
    {
      id: 'users',
      name: 'Users Report',
      description: 'All registered users by role',
      icon: FiUsers,
      color: 'indigo',
    },
    {
      id: 'agents',
      name: 'Agents Report',
      description: 'Agent performance and earnings',
      icon: FiUserCheck,
      color: 'cyan',
    },
    {
      id: 'operators',
      name: 'Operators Report',
      description: 'Operator performance and earnings',
      icon: FiUserCheck,
      color: 'emerald',
    },
  ];

  const generateReport = async () => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        type: selectedReport,
      });
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/reports/generate?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    // Convert to CSV
    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map((row) =>
        headers.map((header) => {
          const value = row[header];
          // Escape commas and quotes
          return typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      ),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    // Add title
    const reportTitle = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
    doc.setFontSize(18);
    doc.setTextColor(88, 28, 135); // Purple color
    doc.text(reportTitle, 14, 15);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    if (startDate || endDate) {
      const dateRange = `Date Range: ${startDate || 'All'} to ${endDate || 'All'}`;
      doc.text(dateRange, 14, 28);
    }
    doc.text(`Total Records: ${reportData.length}`, 14, startDate || endDate ? 34 : 28);
    
    // Add 8Rupiya branding
    doc.setFontSize(12);
    doc.setTextColor(147, 51, 234); // Purple
    doc.text('8Rupiya.com', doc.internal.pageSize.width - 40, 15);
    
    // Prepare table data
    const headers = Object.keys(reportData[0]);
    const rows = reportData.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'number' && value > 1000
          ? value.toLocaleString()
          : value?.toString() || 'N/A';
      })
    );

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startDate || endDate ? 40 : 34,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [147, 51, 234], // Purple
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 243, 255], // Light purple
      },
      columnStyles: headers.reduce((acc, header, index) => {
        // Right align numeric columns
        if (reportData.some(row => typeof row[header] === 'number')) {
          acc[index] = { halign: 'right' };
        }
        return acc;
      }, {} as any),
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          '© 8Rupiya.com - Admin Reports',
          doc.internal.pageSize.width - 14,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      },
    });

    // Save PDF
    doc.save(`${selectedReport}_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and export comprehensive reports</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <motion.button
              key={report.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? `border-${report.color}-500 bg-${report.color}-50 dark:bg-${report.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r from-${report.color}-500 to-${report.color}-600 text-white`}>
                  <Icon className="text-2xl" />
                </div>
                {isSelected && (
                  <div className={`w-6 h-6 rounded-full bg-${report.color}-500 flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiCalendar />
          Date Range Filter
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateReport}
            disabled={loading || !selectedReport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiTrendingUp />}
            {loading ? 'Generating...' : 'Generate Report'}
          </button>

          {reportData.length > 0 && (
            <>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <FiDownload />
                Export PDF
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <FiDownload />
                Export CSV
              </button>

              <button
                onClick={exportToJSON}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiDownload />
                Export JSON
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Results */}
      {reportData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiFileText />
              Report Results ({reportData.length} records)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  {Object.keys(reportData[0]).map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.slice(0, 100).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {typeof value === 'number' && value > 1000
                          ? value.toLocaleString()
                          : value?.toString() || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reportData.length > 100 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Showing first 100 records. Export to see all {reportData.length} records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && reportData.length === 0 && selectedReport && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <FiFileText className="mx-auto text-6xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {startDate || endDate
              ? 'No records found for the selected date range'
              : 'Click "Generate Report" to view data'}
          </p>
        </div>
      )}
    </div>
  );
}
