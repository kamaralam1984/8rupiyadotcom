'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';

const reportTypes = [
  { id: 'shops', name: 'Shops', icon: FiFileText },
  { id: 'payments', name: 'Payments', icon: FiFileText },
  { id: 'commissions', name: 'Commissions', icon: FiFileText },
  { id: 'agents', name: 'Agents', icon: FiFileText },
  { id: 'operators', name: 'Operators', icon: FiFileText },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!selectedType) {
      alert('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: selectedType,
          format,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Export failed. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          // Only log if there's actual error data
          if (errorData && Object.keys(errorData).length > 0) {
            console.error('Export error:', errorData);
          }
        } catch (parseError) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // If all else fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        alert(errorMessage);
        setLoading(false);
        return;
      }

      // Check if response is actually a blob/binary
      const contentType = response.headers.get('content-type');
      if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/vnd.openxmlformats'))) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedType}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Handle JSON error response
        const errorData = await response.json();
        alert(`Export failed: ${errorData.error || 'Please try again'}`);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'An unexpected error occurred';
      console.error('Export failed:', errorMessage, error);
      alert(`Export failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Export data in PDF or Excel format</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => setSelectedType(type.id)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
            }`}
          >
            <type.icon className={`text-3xl mb-3 ${selectedType === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900 dark:text-white">{type.name}</h3>
          </motion.div>
        ))}
      </div>

      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Export {reportTypes.find((t) => t.id === selectedType)?.name}
          </h3>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('pdf')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              <FiFile />
              Download PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('excel')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              <FiDownload />
              Download Excel
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

