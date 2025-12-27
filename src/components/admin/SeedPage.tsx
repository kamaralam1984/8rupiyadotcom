'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDatabase, FiCheck, FiLoader } from 'react-icons/fi';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const seedBiharShops = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-bihar-shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to seed shops');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <FiDatabase className="text-white text-3xl" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Seed Bihar Shops
            </h1>
            <p className="text-gray-600">
              Add 3 shops from each district of Bihar (38 districts = 114 shops)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What will be added:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ 38 Districts of Bihar</li>
              <li>✅ 3 shops per district (114 total shops)</li>
              <li>✅ Different categories: Retail, Restaurant, Electronics, Clothing, Grocery, Pharmacy, Hardware, Jewelry, Automobile, Furniture</li>
              <li>✅ All shops will be approved and visible on homepage</li>
              <li>✅ Realistic locations and ratings</li>
            </ul>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              <strong>Error:</strong> {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <FiCheck className="text-xl" />
                <strong>Success!</strong>
              </div>
              <p>{result.message}</p>
              <p className="text-sm mt-2">
                Shops: {result.shops} | Districts: {result.districts}
              </p>
            </motion.div>
          )}

          <motion.button
            onClick={seedBiharShops}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Adding Shops...
              </>
            ) : (
              <>
                <FiDatabase />
                Add Bihar Shops to Database
              </>
            )}
          </motion.button>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-purple-600 font-medium transition-colors"
            >
              ← Back to Homepage
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

