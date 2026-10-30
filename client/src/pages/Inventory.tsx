import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  AlertTriangle,
  X,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { InventoryMovement, Product, ProductBatch } from '../types';
import { formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [movementFilter, setMovementFilter] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Stock Adjustment Form
  const [adjustData, setAdjustData] = useState({
    productId: '',
    batchId: '',
    quantityChange: 0,
    movementType: 'ADJUSTMENT',
    reason: '',
  });

  const { data: movements, isLoading } = useQuery<InventoryMovement[]>({
    queryKey: ['movements', movementFilter],
    queryFn: () => {
      const endpoint = movementFilter
        ? `/inventory/movements?movementType=${movementFilter}`
        : '/inventory/movements';
      return ApiClient.get<InventoryMovement[]>(endpoint);
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['productsList'],
    queryFn: () => ApiClient.get<Product[]>('/products'),
  });

  const { data: batches } = useQuery<ProductBatch[]>({
    queryKey: ['batchesList', adjustData.productId],
    queryFn: () =>
      adjustData.productId
        ? ApiClient.get<ProductBatch[]>(`/batches?productId=${adjustData.productId}`)
        : Promise.resolve([]),
    enabled: !!adjustData.productId,
  });

  const adjustMutation = useMutation({
    mutationFn: (payload: any) => ApiClient.post('/inventory/adjust', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowAdjustModal(false);
      setAdjustData({
        productId: '',
        batchId: '',
        quantityChange: 0,
        movementType: 'ADJUSTMENT',
        reason: '',
      });
    },
  });

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'SALE':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-semibold border border-blue-200">
            <ArrowUpRight className="w-3 h-3 text-blue-600" />
            <span>Sale Deduction</span>
          </span>
        );
      case 'PURCHASE_RECEIPT':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
            <span>Purchase Receipt</span>
          </span>
        );
      case 'DAMAGE':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-[10px] font-semibold border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>Damaged Goods</span>
          </span>
        );
      case 'RETURN':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-semibold border border-purple-200">
            <RefreshCcw className="w-3 h-3 text-purple-600" />
            <span>Customer Return</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold">
            <span>Adjustment</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Filter Type:</span>
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Movement Types</option>
            <option value="SALE">Sales Deductions</option>
            <option value="PURCHASE_RECEIPT">Purchases Receipts</option>
            <option value="DAMAGE">Damages & Breakage</option>
            <option value="RETURN">Customer Returns</option>
            <option value="ADJUSTMENT">Manual Audits</option>
          </select>
        </div>

        {user?.role !== 'CASHIER' && (
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Stock Adjustment</span>
          </button>
        )}
      </div>

      {/* Movement Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Product SKU</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Quantity Change</th>
                <th className="py-3 px-4">Stock Ledger (Before &rarr; After)</th>
                <th className="py-3 px-4">Batch Reference</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading inventory movement ledger...
                  </td>
                </tr>
              ) : movements?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No inventory movement records found.
                  </td>
                </tr>
              ) : (
                movements?.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{m.productId?.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{m.productId?.sku}</div>
                    </td>
                    <td className="py-3 px-4">{getMovementBadge(m.movementType)}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={m.quantity >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {m.quantity >= 0 ? `+${m.quantity}` : m.quantity} {m.productId?.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {m.previousStock} &rarr; <strong className="text-slate-900 dark:text-white">{m.newStock}</strong>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {m.batchId?.batchNumber || 'General Stock'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {m.performedBy?.fullName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                      {m.reason || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Record Stock Adjustment / Damage
              </h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                adjustMutation.mutate(adjustData);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Product *
                </label>
                <select
                  required
                  value={adjustData.productId}
                  onChange={(e) => setAdjustData({ ...adjustData, productId: e.target.value, batchId: '' })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                >
                  <option value="">Select a Product</option>
                  {products?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Current: {p.totalStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {adjustData.productId && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Specific Batch Lot (Optional)
                  </label>
                  <select
                    value={adjustData.batchId}
                    onChange={(e) => setAdjustData({ ...adjustData, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                  >
                    <option value="">Apply to product directly / Any</option>
                    {batches?.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batchNumber} (Expires: {formatDate(b.expiryDate)}, In-hand: {b.availableQuantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Action Type *
                  </label>
                  <select
                    value={adjustData.movementType}
                    onChange={(e) => setAdjustData({ ...adjustData, movementType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                  >
                    <option value="ADJUSTMENT">Stock Audit Correction</option>
                    <option value="DAMAGE">Broken / Damaged Goods</option>
                    <option value="RETURN">Customer Return Restock</option>
                    <option value="STOCK_IN">Extra Lot Found</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Quantity Change (+ or -) *
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustData.quantityChange}
                    onChange={(e) =>
                      setAdjustData({ ...adjustData, quantityChange: parseInt(e.target.value, 10) || 0 })
                    }
                    placeholder="-5 or +10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Reason / Operational Note *
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g. Physical inventory count discrepancy on Shelf B3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
