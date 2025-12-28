'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiDollarSign, FiShoppingBag, FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi';

interface AgentData {
  agentId: string;
  agentName: string;
  agentIncome: number;
  agentShopCount: number;
  planNames: string;
}

interface Operator {
  operatorId: string;
  operatorName: string;
  operatorEmail: string;
  operatorPhone: string;
  operatorIncome: number;
  totalShops: number;
  agents: AgentData[];
  createdAt: string;
}

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOperators, setExpandedOperators] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/operators', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOperators(data.operators || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOperator = (operatorId: string) => {
    const newExpanded = new Set(expandedOperators);
    if (newExpanded.has(operatorId)) {
      newExpanded.delete(operatorId);
    } else {
      newExpanded.add(operatorId);
    }
    setExpandedOperators(newExpanded);
  };

  const filteredOperators = operators.filter(operator =>
    operator.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.operatorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.operatorId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operator Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View operator details, income, and agent information</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by operator name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Operators List */}
      <div className="space-y-4">
        {filteredOperators.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
            <FiUsers className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchTerm ? 'No operators found matching your search' : 'No operators found'}
            </p>
          </div>
        ) : (
          filteredOperators.map((operator) => (
            <motion.div
              key={operator.operatorId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Operator Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleOperator(operator.operatorId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {operator.operatorName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {operator.operatorName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {operator.operatorId}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {operator.operatorEmail} | {operator.operatorPhone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        ₹{operator.operatorIncome.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Shops</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {operator.totalShops}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Agents</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {operator.agents.length}
                      </p>
                    </div>
                    {expandedOperators.has(operator.operatorId) ? (
                      <FiChevronDown className="text-gray-400 text-xl" />
                    ) : (
                      <FiChevronRight className="text-gray-400 text-xl" />
                    )}
                  </div>
                </div>
              </div>

              {/* Agents Details (Expandable) */}
              {expandedOperators.has(operator.operatorId) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                >
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Agents Working Under This Operator
                    </h4>
                    {operator.agents.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No agents found
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Agent ID
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Agent Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Agent Income
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Shop Count
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Plan Names
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {Array.from(
                              new Map(operator.agents.map(agent => [agent.agentId, agent])).values()
                            ).map((agent) => (
                              <tr
                                key={agent.agentId}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                                  {agent.agentId.substring(0, 12)}...
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                  {agent.agentName}
                                </td>
                                <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                  ₹{agent.agentIncome.toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  <div className="flex items-center gap-1">
                                    <FiShoppingBag className="text-gray-400" />
                                    {agent.agentShopCount}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {agent.planNames}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

