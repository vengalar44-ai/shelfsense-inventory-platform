import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, PackageCheck, Clock, CheckCircle, X } from 'lucide-react';
import { ApiClient } from '../services/api';
import { PurchaseOrder, Supplier, Product } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const PurchasesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { business, user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState<
    { productId: string; quantityOrdered: number; unitCost: number; batchNumber: string; expiryDate: string }[]
  >([]);

  const { data: purchases, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchases'],
    queryFn: () => ApiClient.get<PurchaseOrder[]>('/purchases'),
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['suppliersList'],
    queryFn: () => ApiClient.get<Supplier[]>('/suppliers'),
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['productsList'],
    queryFn: () => ApiClient.get<Product[]>('/products'),
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload: any) => ApiClient.post('/purchases', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setShowCreateModal(false);
      setSupplierId('');
      setOrderItems([]);
    },
  });

  const receiveOrderMutation = useMutation({
    mutationFn: (id: string) => ApiClient.post(`/purchases/${id}/receive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  const addItemRow = () => {
    setOrderItems([
      ...orderItems,
      {
        productId: '',
        quantityOrdered: 20,
        unitCost: 5,
        batchNumber: `BAT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
      },
    ]);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Procurement & Purchase Orders
          </h2>
          <p className="text-xs text-slate-500">
            Order stock from suppliers and generate inventory batches automatically
          </p>
        </div>

        {user?.role !== 'CASHIER' && (
          <button
            onClick={() => {
              setOrderItems([
                {
                  productId: '',
                  quantityOrdered: 25,
                  unitCost: 4.5,
                  batchNumber: `BAT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                  expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
                },
              ]);
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                {user?.role !== 'CASHIER' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading purchase orders...
                  </td>
                </tr>
              ) : purchases?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                purchases?.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {po.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {po.supplierId?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(po.orderDate)}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {po.items?.length} items ({po.items?.reduce((s, i) => s + i.quantityOrdered, 0)}{' '}
                      units)
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(po.totalAmount, business?.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          po.status === 'RECEIVED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    {user?.role !== 'CASHIER' && (
                      <td className="py-3 px-4 text-right">
                        {po.status !== 'RECEIVED' && (
                          <button
                            onClick={() => receiveOrderMutation.mutate(po._id)}
                            disabled={receiveOrderMutation.isPending}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[10px] shadow-sm flex items-center space-x-1 ml-auto"
                          >
                            <PackageCheck className="w-3 h-3" />
                            <span>Receive & Stock</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Create Vendor Purchase Order
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createOrderMutation.mutate({
                  supplierId,
                  items: orderItems,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Supplier / Vendor *
                </label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                >
                  <option value="">Select Supplier</option>
                  {suppliers?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.paymentTerms})
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Products to Procure:
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    + Add Product Line
                  </button>
                </div>

                {orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-4 gap-2"
                  >
                    <div className="col-span-2">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => {
                          const p = products?.find((pr) => pr._id === e.target.value);
                          const updated = [...orderItems];
                          updated[idx]!.productId = e.target.value;
                          updated[idx]!.unitCost = p?.purchasePrice || 0;
                          setOrderItems(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      >
                        <option value="">Select Product</option>
                        {products?.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="number"
                        min={1}
                        placeholder="Quantity"
                        value={item.quantityOrdered}
                        onChange={(e) => {
                          const updated = [...orderItems];
                          updated[idx]!.quantityOrdered = parseInt(e.target.value, 10) || 1;
                          setOrderItems(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Unit Cost"
                        value={item.unitCost}
                        onChange={(e) => {
                          const updated = [...orderItems];
                          updated[idx]!.unitCost = parseFloat(e.target.value) || 0;
                          setOrderItems(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending || !orderItems.length}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
