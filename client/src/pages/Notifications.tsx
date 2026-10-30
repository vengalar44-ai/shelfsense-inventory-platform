import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, AlertTriangle, AlertOctagon, Info, CheckCheck } from 'lucide-react';
import { ApiClient } from '../services/api';
import { NotificationItem } from '../types';
import { formatDate } from '../lib/utils';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ notifications: NotificationItem[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: () => ApiClient.get<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications'),
  });

  const markAllMutation = useMutation({
    mutationFn: () => ApiClient.post('/notifications/mark-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            System & Inventory Alerts
          </h2>
          <p className="text-xs text-slate-500">
            Automated alerts for impending expiries, depleted stock, and procurement actions
          </p>
        </div>

        {Number(data?.unreadCount) > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading alerts...</div>
        ) : data?.notifications?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
            No system notifications or alerts currently. Everything looks optimal!
          </div>
        ) : (
          data?.notifications?.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-xl border transition flex items-start space-x-3.5 ${
                notif.isRead
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-sm'
              }`}
            >
              {getSeverityIcon(notif.severity)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
