import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ApiClient } from '../services/api';
import { DashboardMetrics } from '../types';
import { formatCurrency } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const DashboardPage: React.FC = () => {
  const { business } = useAuthStore();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: () => ApiClient.get<DashboardMetrics>('/analytics/dashboard'),
  });

  const { data: reports } = useQuery<any>({
    queryKey: ['reportsData'],
    queryFn: () => ApiClient.get<any>('/analytics/reports'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Inventory Valuation',
      value: formatCurrency(metrics?.inventoryValue || 0, business?.currency),
      subtext: `${metrics?.totalInventoryUnits || 0} active units in stock`,
      icon: DollarSign,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      label: "Today's Sales Revenue",
      value: formatCurrency(metrics?.todaySales || 0, business?.currency),
      subtext: `${metrics?.todayOrders || 0} customer orders today`,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'Expiring in 30 Days',
      value: metrics?.nearingExpiryBatchesCount || 0,
      subtext: 'Requires FEFO promotional allocation',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      label: 'Expired Lots Quarantined',
      value: metrics?.expiredBatchesCount || 0,
      subtext: 'Auto-excluded from POS checkout',
      icon: AlertOctagon,
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Alert for Expiry if applicable */}
      {Number(metrics?.nearingExpiryBatchesCount) > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <strong className="font-semibold">Expiry Action Required:</strong> You have{' '}
              <strong>{metrics?.nearingExpiryBatchesCount} batches</strong> nearing expiration within 30 days.
              Check Batches & FEFO tab to apply bundle discounts or return to supplier.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {card.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stock KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Cataloged Products</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {metrics?.totalProducts || 0} Active SKUs
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Low Stock Alerts</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {metrics?.lowStockProducts || 0} Products Below Min
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Out of Stock</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {metrics?.outOfStockProducts || 0} Products Depleted
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Revenue & Sales Trends (Last 7 Days)
              </h2>
              <p className="text-xs text-slate-500">Calculated from verified POS orders</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
              Daily Aggregate
            </span>
          </div>

          <div className="h-64 w-full">
            {metrics?.salesTrend && metrics.salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.salesTrend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Sales']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No recent sales recorded yet this week.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown (1 column) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Inventory by Category
            </h2>
            <p className="text-xs text-slate-500">Product volume distribution</p>
          </div>

          <div className="h-56 w-full my-auto">
            {reports?.categoryDistribution && reports.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reports.categoryDistribution}
                    dataKey="totalStock"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {reports.categoryDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data available.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            {reports?.categoryDistribution?.slice(0, 4).map((c: any, i: number) => (
              <div key={i} className="flex items-center space-x-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></span>
                <span className="truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Sales Receipts
            </h2>
            <p className="text-xs text-slate-500">Real-time checkout records with FEFO deductions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Items Sold</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics?.recentSales?.map((sale) => (
                <tr key={sale._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-blue-600 dark:text-blue-400">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                    {sale.customerName || 'Walk-in'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {sale.items.length} line items
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(sale.grandTotal, business?.currency)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    {new Date(sale.createdAt).toLocaleDateString()}{' '}
                    {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
