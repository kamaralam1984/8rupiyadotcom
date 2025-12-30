'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiStar,
  FiTrendingUp,
  FiRefreshCw,
} from 'react-icons/fi';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: number;
  priority: number;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  homepageVisible: boolean;
  seoBoost: boolean;
  createdAt: string;
}

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      _id: '1',
      name: 'Starter',
      price: 499,
      duration: 30,
      priority: 1,
      features: ['Basic Listing', 'Contact Details', '1 Photo'],
      isActive: true,
      isFeatured: false,
      homepageVisible: false,
      seoBoost: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Basic',
      price: 999,
      duration: 30,
      priority: 2,
      features: ['Featured Listing', 'Contact Details', '5 Photos', 'Social Links'],
      isActive: true,
      isFeatured: false,
      homepageVisible: true,
      seoBoost: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '3',
      name: 'Pro',
      price: 1999,
      duration: 30,
      priority: 3,
      features: ['Premium Listing', 'Unlimited Photos', 'Video', 'Priority Support', 'Analytics'],
      isActive: true,
      isFeatured: true,
      homepageVisible: true,
      seoBoost: true,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: 30,
    priority: 1,
    features: '',
    isActive: true,
    isFeatured: false,
    homepageVisible: false,
    seoBoost: false,
  });

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: 0,
      duration: 30,
      priority: 1,
      features: '',
      isActive: true,
      isFeatured: false,
      homepageVisible: false,
      seoBoost: false,
    });
    setShowModal(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      priority: plan.priority,
      features: plan.features.join('\n'),
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      homepageVisible: plan.homepageVisible,
      seoBoost: plan.seoBoost,
    });
    setShowModal(true);
  };

  const handleSavePlan = () => {
    const features = formData.features.split('\n').filter(f => f.trim());
    
    if (editingPlan) {
      // Update existing plan
      setPlans(plans.map(p => 
        p._id === editingPlan._id 
          ? { ...p, ...formData, features }
          : p
      ));
    } else {
      // Create new plan
      const newPlan: Plan = {
        _id: Date.now().toString(),
        ...formData,
        features,
        createdAt: new Date().toISOString(),
      };
      setPlans([...plans, newPlan]);
    }
    
    setShowModal(false);
    alert(editingPlan ? 'Plan updated!' : 'Plan created!');
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p._id !== planId));
      alert('Plan deleted!');
    }
  };

  const togglePlanStatus = (planId: string, field: keyof Plan) => {
    setPlans(plans.map(p => 
      p._id === planId 
        ? { ...p, [field]: !p[field as keyof Plan] }
        : p
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plans Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage subscription plans</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoading(!loading)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleCreatePlan}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPlus />
            Create Plan
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 ${
              plan.isFeatured 
                ? 'border-purple-500' 
                : 'border-gray-200 dark:border-gray-700'
            } overflow-hidden`}
          >
            {/* Plan Header */}
            <div className={`p-6 ${
              plan.isFeatured 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                : 'bg-gray-50 dark:bg-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-2xl font-bold ${
                  plan.isFeatured ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {plan.name}
                </h3>
                {plan.isFeatured && (
                  <FiStar className="text-yellow-300 fill-yellow-300 text-xl" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${
                  plan.isFeatured ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  ₹{plan.price}
                </span>
                <span className={`text-sm ${
                  plan.isFeatured ? 'text-white opacity-80' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  /{plan.duration} days
                </span>
              </div>
            </div>

            {/* Plan Features */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiCheck className="text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Plan Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  plan.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
                {plan.homepageVisible && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Homepage
                  </span>
                )}
                {plan.seoBoost && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    SEO Boost
                  </span>
                )}
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                  Priority: {plan.priority}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <FiEdit />
                  Edit
                </button>
                <button
                  onClick={() => togglePlanStatus(plan._id, 'isActive')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    plan.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {plan.isActive ? <FiX /> : <FiCheck />}
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPlan ? 'Edit Plan' : 'Create Plan'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiX />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Pro Plan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features (one per line)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.homepageVisible}
                      onChange={(e) => setFormData({ ...formData, homepageVisible: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Homepage Visible</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.seoBoost}
                      onChange={(e) => setFormData({ ...formData, seoBoost: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">SEO Boost</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePlan}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



