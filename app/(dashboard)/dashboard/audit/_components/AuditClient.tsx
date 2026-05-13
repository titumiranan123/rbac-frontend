"use client";

import { AuditTable } from "@/components/audit/AuditTable";

export default function AuditClient() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">
          Track all system activities and user actions
        </p>
      </div>
      <AuditTable />
    </div>
  );
}
