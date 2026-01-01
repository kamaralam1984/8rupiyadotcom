'use client';

import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500',
    light: 'bg-blue-100',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-green-500',
    light: 'bg-green-100',
    text: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
  },
  purple: {
    bg: 'bg-purple-500',
    light: 'bg-purple-100',
    text: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
  },
  orange: {
    bg: 'bg-orange-500',
    light: 'bg-orange-100',
    text: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
  },
  red: {
    bg: 'bg-red-500',
    light: 'bg-red-100',
    text: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
  },
  yellow: {
    bg: 'bg-yellow-500',
    light: 'bg-yellow-100',
    text: 'text-yellow-600',
    gradient: 'from-yellow-500 to-yellow-600',
  },
};

export default function StatCard({
  title,
  value,
  change,
  icon,
  color = 'blue',
  loading = false,
}: StatCardProps) {
  const colors = colorClasses[color];
  const isPositive = change && change >= 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>

          {/* Value */}
          <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform">
            {value}
          </h3>

          {/* Change indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <FiTrendingUp className="text-green-500 text-sm" />
              ) : (
                <FiTrendingDown className="text-red-500 text-sm" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}
                {change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full ${colors.light} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <div className={`${colors.text} text-2xl`}>{icon}</div>
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${colors.gradient} w-3/4`}></div>
      </div>
    </div>
  );
}

