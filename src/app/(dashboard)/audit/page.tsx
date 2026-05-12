'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AuditLog, PaginatedResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ action: '', from: '', to: '' });

  useEffect(() => {
    fetchLogs();
  }, [page, filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (filter.action) params.append('action', filter.action);
      if (filter.from) params.append('from', filter.from);
      if (filter.to) params.append('to', filter.to);

      const response = await api.get(`/audit?${params.toString()}`);
      const data = response.data as PaginatedResponse<AuditLog>;
      setLogs(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'success';
      case 'LOGOUT': return 'info';
      case 'REGISTER': return 'info';
      case 'CREATE': return 'success';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'danger';
      case 'ROLE_CHANGE': return 'warning';
      case 'PERMISSION_CHANGE': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Audit Logs</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filter.action}
                onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                className="border rounded px-3 py-2"
              >
                <option value="">All</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="REGISTER">Register</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="ROLE_CHANGE">Role Change</option>
                <option value="PERMISSION_CHANGE">Permission Change</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={filter.from}
                onChange={(e) => setFilter({ ...filter, from: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={filter.to}
                onChange={(e) => setFilter({ ...filter, to: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setPage(1); fetchLogs(); }}>Apply Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Activity Logs</CardTitle>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Timestamp</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Action</th>
                      <th className="text-left py-3 px-4">Resource</th>
                      <th className="text-left py-3 px-4">IP Address</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{formatDate(log.timestamp)}</td>
                        <td className="py-3 px-4">{log.userEmail}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getActionBadgeVariant(log.action) as any}>
                            {log.action}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {log.resource ? `${log.resource}/${log.resourceId || ''}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">{log.ipAddress || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                            {log.status || '-'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}