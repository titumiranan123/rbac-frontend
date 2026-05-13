'use client';

import { useState, useEffect } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: { value: number; positive: boolean };
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red';
  loading?: boolean;
  onRefresh?: () => void;
}

const colorClasses = {
  orange: { bg: 'bg-(--color-primary)]/10', icon: 'text-(--color-primary)]', border: 'border-(--color-primary)]/20' },
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200' },
  red: { bg: 'bg-red-100', icon: 'text-red-600', border: 'border-red-200' },
};

export function StatsCard({ title, value, icon, trend, color = 'orange', loading = false, onRefresh }: StatsCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-(--color-secondary)]">{title}</span>
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <svg className={`w-6 h-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
          </svg>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-(--color-gray-900)]">{value}</div>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <svg className={`w-4 h-4 ${trend.positive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return <StatsCard title="" value={0} icon="" loading={true} />;
}