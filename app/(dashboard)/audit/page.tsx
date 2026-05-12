'use client';

import { useEffect, useState } from 'react';
import { AuditLog, PaginatedResponse } from '@/types';
import { apiClient } from '@/lib/api-client';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/audit?page=${page}&limit=20`);
        const data = response.data as PaginatedResponse<AuditLog>;
        setLogs(data.data);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        console.error('Failed to fetch logs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  const formatDate = (date: string) => new Date(date).toLocaleString();

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-green-100 text-green-700';
      case 'LOGOUT': return 'bg-blue-100 text-blue-700';
      case 'CREATE': return 'bg-purple-100 text-purple-700';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1F232A] mb-6">Audit Logs</h1>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Timestamp</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Action</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Resource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-[#404857]">{formatDate(log.timestamp)}</td>
                    <td className="px-6 py-4 text-[#1F232A]">{log.userEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#404857]">{log.resource || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-[#404857]">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}