import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Plus,
  Filter,
  DollarSign,
  Ban,
  CheckCircle2,
  X,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { ProductBatch, Product, Supplier } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const BatchesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { business, user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    batchNumber: '',
    initialQuantity: 10,
    manufacturingDate: '',
    expiryDate: '',
    purchaseCost: 0,
    supplierId: '',
    notes: '',
  });

  const { data: batches, isLoading } = useQuery<ProductBatch[]>({
    queryKey: ['batches', statusFilter],
    queryFn: () => {
      const endpoint =
        statusFilter === 'all' ? '/batches' : `/batches?status=${statusFilter}`;
      return ApiClient.get<ProductBatch[]>(endpoint);
    },
  });

  const { data: summary } = useQuery<any>({
    queryKey: ['batchesSummary'],
    queryFn: () => ApiClient.get<any>('/batches/expiry-summary'),
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['productsList'],
    queryFn: () => ApiClient.get<Product[]>('/products'),
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['suppliersList'],
    queryFn: () => ApiClient.get<Supplier[]>('/suppliers'),
  });

  const toggleExcludeMutation = useMutation({
    mutationFn: (id: string) => ApiClient.patch(`/batches/${id}/toggle-exclude`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batchesSummary'] });
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (data: any) => ApiClient.post('/batches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batchesSummary'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      batchNumber: '',
      initialQuantity: 10,
      manufacturingDate: '',
      expiryDate: '',
      purchaseCost: 0,
      supplierId: '',
      notes: '',
    });
  };

  const getExpiryBadge = (expiryDateStr: string, isExcluded: boolean) => {
    if (isExcluded) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold border border-slate-300 dark:border-slate-700">
          Quarantined
        </span>
      );
    }
    const now = new Date().getTime();
    const expiry = new Date(expiryDateStr).getTime();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold border border-red-300 dark:border-red-800">
          EXPIRED ({Math.abs(diffDays)}d ago)
        </span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold border border-rose-300 dark:border-rose-800 animate-pulse">
          Expires in {diffDays} days!
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
          Expires in {diffDays} days
        </span>
      );
    } else if (diffDays <= 60) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 text-[10px] font-semibold border border-yellow-300 dark:border-yellow-800">
          Expires in {diffDays} days
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-300 dark:border-emerald-800">
          Fresh ({diffDays}d left)
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Expiry Overview Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Expired Lots</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {summary?.counts?.expired || 0} Batches
            </div>
            <div className="text-[10px] text-red-600 font-medium">
              Loss: {formatCurrency(summary?.expiredLossValue || 0, business?.currency)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Expiring &le; 7 Days</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {summary?.counts?.expiringIn7Days || 0} Batches
            </div>
            <div className="text-[10px] text-slate-400">FEFO priority 1</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Expiring &le; 30 Days</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {summary?.counts?.expiringIn30Days || 0} Batches
            </div>
            <div className="text-[10px] text-slate-400">FEFO priority 2</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Lots Monitored</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {summary?.counts?.totalActiveBatches || 0} Batches
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">Under FEFO Tracking</div>
          </div>
        </div>
      </div>

      {/* Filter and Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Filter By Expiry:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All Batches' },
              { id: 'expiring_7d', label: 'Within 7 Days' },
              { id: 'expiring_30d', label: 'Within 30 Days' },
              { id: 'expiring_60d', label: 'Within 60 Days' },
              { id: 'expired', label: 'Expired' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {user?.role !== 'CASHIER' && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Product Batch</span>
          </button>
        )}
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Batch #</th>
                <th className="py-3 px-4">Associated Product</th>
                <th className="py-3 px-4">Remaining Units</th>
                <th className="py-3 px-4">Manufacture Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">FEFO Status</th>
                <th className="py-3 px-4">Supplier</th>
                {user?.role !== 'CASHIER' && <th className="py-3 px-4 text-right">POS Control</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading inventory batches...
                  </td>
                </tr>
              ) : batches?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No batches found matching filter criteria.
                  </td>
                </tr>
              ) : (
                batches?.map((batch) => (
                  <tr key={batch._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {batch.batchNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {batch.productId?.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {batch.productId?.sku}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {batch.availableQuantity}
                      </span>
                      <span className="text-slate-400"> / {batch.initialQuantity}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(batch.manufacturingDate)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {formatDate(batch.expiryDate)}
                    </td>
                    <td className="py-3 px-4">
                      {getExpiryBadge(batch.expiryDate, batch.isExcludedFromSales)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {batch.supplierId?.name || 'Standard Vendor'}
                    </td>
                    {user?.role !== 'CASHIER' && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleExcludeMutation.mutate(batch._id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                            batch.isExcludedFromSales
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200'
                          }`}
                        >
                          {batch.isExcludedFromSales ? 'Enable in POS' : 'Quarantine'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Product Batch with Expiry
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createBatchMutation.mutate(formData);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Select Product *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => {
                    const prod = products?.find((p) => p._id === e.target.value);
                    setFormData({
                      ...formData,
                      productId: e.target.value,
                      purchaseCost: prod?.purchasePrice || 0,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                >
                  <option value="">Select a Product</option>
                  {products?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Batch / Lot # *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          batchNumber: `LOT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                        })
                      }
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Received Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.initialQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, initialQuantity: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Unit Purchase Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchaseCost}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Supplier
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers?.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBatchMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                >
                  Confirm & Stock Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
