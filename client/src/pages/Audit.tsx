import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { ApiClient } from '../services/api';
import { AuditLogItem } from '../types';
import { formatDate } from '../lib/utils';

export const AuditPage: React.FC = () => {
  const { data: logs, isLoading } = useQuery<AuditLogItem[]>({
    queryKey: ['auditLogs'],
    queryFn: () => ApiClient.get<AuditLogItem[]>('/audit-logs'),
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          System Audit Trail & Security Ledger
        </h2>
        <p className="text-xs text-slate-500">
          Immutable log of all operational adjustments, sales, purchases, and security events
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Executed</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    Loading security audit logs...
                  </td>
                </tr>
              ) : (
                logs?.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {l.userName}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">{l.userRole}</td>
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{l.action}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{l.entityType}</td>
                    <td className="py-3 px-4 text-[10px] text-slate-400 max-w-sm truncate">
                      {JSON.stringify(l.details || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
