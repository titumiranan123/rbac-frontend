'use client';

import { useState } from 'react';
import { Permission } from '@/types';

interface PermissionEditorProps {
  permissions: Permission[];
  grantedPermissions: string[];
  onToggle: (permName: string) => void;
  onSave: () => void;
  canEdit: boolean;
  currentUserRole: string;
  saving?: boolean;
}

const RoleHierarchy: Record<string, number> = {
  ADMIN: 0, MANAGER: 1, AGENT: 2, CUSTOMER: 3,
};

export function PermissionEditor({
  permissions,
  grantedPermissions,
  onToggle,
  onSave,
  canEdit,
  currentUserRole,
  saving = false,
}: PermissionEditorProps) {
  const currentUserLevel = RoleHierarchy[currentUserRole] ?? 999;

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const canGrantPermission = (perm: Permission): boolean => {
    if (!canEdit) return false;
    return perm.level >= currentUserLevel;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-(--color-gray-900)">Permissions</h2>
          <p className="text-sm text-(--color-secondary)">
            {grantedPermissions.length} of {permissions.length} granted
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={!canEdit || saving}
          className="px-6 py-2 bg-(--color-primary) text-white rounded-lg hover:bg-(--color-primary-hover) disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          You don&apos;t have permission to edit permissions
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <div key={resource} className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-(--color-secondary) uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-(--color-primary)/10 text-(--color-primary) rounded-lg flex items-center justify-center text-xs">
                {perms.length}
              </span>
              {resource}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {perms.map((perm) => {
                const isGranted = grantedPermissions.includes(perm.name);
                const isDisabled = !canGrantPermission(perm);
                const canToggle = canEdit && !isDisabled;

                return (
                  <label
                    key={perm.id}
                    className={`
                      relative flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer
                      ${isDisabled
                        ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                        : isGranted
                          ? 'bg-green-50 border-green-200 hover:border-green-300'
                          : 'bg-white border-gray-200 hover:border-(--color-primary)'
                      }
                    `}
                  >
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        type="checkbox"
                        checked={isGranted}
                        onChange={() => canToggle && onToggle(perm.name)}
                        disabled={!canToggle}
                        className="w-5 h-5 rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-(--color-gray-900) text-sm truncate">{perm.name}</div>
                      <div className="text-xs text-(--color-secondary) mt-0.5 line-clamp-2">{perm.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          perm.level === 0 ? 'bg-red-100 text-red-700' :
                          perm.level === 1 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          Level {perm.level}
                        </span>
                        {isDisabled && (
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                            No Access
                          </span>
                        )}
                      </div>
                    </div>
                    {isGranted && canEdit && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-(--color-gray-900) mb-2">Permission Levels</h4>
        <div className="flex flex-wrap gap-4 text-sm text-(--color-secondary)">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span>
            Level 0 - Admin Only
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded"></span>
            Level 1 - Manager+
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded"></span>
            Level 2 - Agent+
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-gray-400 rounded"></span>
            Level 3 - All
          </span>
        </div>
      </div>
    </div>
  );
}