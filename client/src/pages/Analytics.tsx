import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Download,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ApiClient } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const AnalyticsPage: React.FC = () => {
  const { business } = useAuthStore();

  const { data: reports, isLoading } = useQuery<any>({
    queryKey: ['fullReports'],
    queryFn: () => ApiClient.get<any>('/analytics/reports'),
  });

  const exportCSV = () => {
    if (!reports?.topSelling) return;
    const headers = 'Product Name,SKU,Units Sold,Total Revenue\n';
    const rows = reports.topSelling
      .map(
        (item: any) =>
          `"${item.productName}","${item.sku}",${item.totalUnitsSold},${item.totalRevenue}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShelfSense-Performance-Report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Business Intelligence & Reports
          </h2>
          <p className="text-xs text-slate-500">
            Real data-driven product velocities, category shares, and valuation insights
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-2 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Top Velocity Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Top Selling Products (Units Sold)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Aggregated from verified POS checkouts</span>
        </div>

        <div className="h-64 w-full">
          {reports?.topSelling && reports.topSelling.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.topSelling}>
                <XAxis dataKey="productName" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} units`, 'Sold']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="totalUnitsSold" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Awaiting more transaction data to populate velocity charts.
            </div>
          )}
        </div>
      </div>

      {/* Best Sellers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Ranked Fast-Moving SKUs
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Volume Sold</th>
                <th className="py-3 px-4">Total Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports?.topSelling?.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {item.productName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{item.sku}</td>
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                    {item.totalUnitsSold} units
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.totalRevenue, business?.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
