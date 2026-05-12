'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '@/types';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/common/Badge';
import { Pagination } from '@/components/common/Pagination';

interface AuditTableProps {
  initialPage?: number;
  initialLimit?: number;
}

const actionColors: Record<string, { bg: string; text: string }> = {
  LOGIN: { bg: 'bg-green-100', text: 'text-green-700' },
  LOGOUT: { bg: 'bg-blue-100', text: 'text-blue-700' },
  REGISTER: { bg: 'bg-purple-100', text: 'text-purple-700' },
  CREATE: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  UPDATE: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  DELETE: { bg: 'bg-red-100', text: 'text-red-700' },
  ROLE_CHANGE: { bg: 'bg-orange-100', text: 'text-orange-700' },
  PERMISSION_CHANGE: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  ACCESS_DENIED: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const actions = ['LOGIN', 'LOGOUT', 'REGISTER', 'CREATE', 'UPDATE', 'DELETE', 'ROLE_CHANGE', 'PERMISSION_CHANGE', 'ACCESS_DENIED'];

export function AuditTable({ initialPage = 1, initialLimit = 20 }: AuditTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/audit?page=${page}&limit=${limit}`;
      if (actionFilter) url += `&action=${actionFilter}`;
      if (dateFrom) url += `&from=${dateFrom}`;
      if (dateTo) url += `&to=${dateTo}`;

      const response = await apiClient.get(url);
      setLogs(response.data.data);
      setTotal(response.data.meta.total);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, actionFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const clearFilters = () => {
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-[#1F232A] mb-1">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD5E2B]"
            >
              <option value="">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F232A] mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD5E2B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F232A] mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD5E2B]"
            />
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-[#404857] rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Timestamp</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Action</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Resource</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">IP Address</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#404857]">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#404857]">No audit logs found</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const colors = actionColors[log.action] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#404857]">{formatDate(log.timestamp)}</td>
                      <td className="px-6 py-4 text-[#1F232A] font-medium">{log.userEmail}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#404857]">
                        {log.resource ? (
                          <span className="font-mono">{log.resource}{log.resourceId ? `/${log.resourceId.slice(0, 8)}` : ''}</span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#404857] font-mono">{log.ipAddress || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}