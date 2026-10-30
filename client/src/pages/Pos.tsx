import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CheckCircle2,
  Printer,
  Barcode,
  CreditCard,
  Banknote,
  QrCode,
  X,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { Product, Sale } from '../types';
import { formatCurrency } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export const PosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { business, user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'ONLINE'>('CASH');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [taxRate, setTaxRate] = useState(business?.defaultTaxRate || 5);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const { data: products } = useQuery<Product[]>({
    queryKey: ['posProducts', search],
    queryFn: () => {
      const q = search ? `?search=${search}` : '';
      return ApiClient.get<Product[]>(`/products${q}`);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (payload: any) => ApiClient.post<Sale>('/sales/checkout', payload),
    onSuccess: (data) => {
      setCompletedSale(data);
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['posProducts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (err: any) => {
      alert(`Checkout failed: ${err.message}`);
    },
  });

  const addToCart = (product: Product) => {
    if (product.totalStock <= 0) {
      alert(`Product "${product.name}" is out of stock!`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.product._id === product._id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex]!.quantity;
      if (currentQty + 1 > product.totalStock) {
        alert(`Cannot add more than available in-hand stock (${product.totalStock} ${product.unit})`);
        return;
      }
      const newCart = [...cart];
      newCart[existingIndex]!.quantity += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          discount: 0,
        },
      ]);
    }
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const item = cart[index]!;
    if (newQty > item.product.totalStock) {
      alert(`Cannot exceed available stock of ${item.product.totalStock}`);
      return;
    }
    const newCart = [...cart];
    newCart[index]!.quantity = newQty;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountTotal = cart.reduce((sum, item) => sum + item.discount, 0);
  const taxableSubtotal = Math.max(0, subTotal - discountTotal);
  const taxAmount = Number(((taxableSubtotal * taxRate) / 100).toFixed(2));
  const grandTotal = Number((taxableSubtotal + taxAmount).toFixed(2));

  const handleCheckout = () => {
    if (!cart.length) return;
    checkoutMutation.mutate({
      items: cart.map((i) => ({
        productId: i.product._id,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount,
      })),
      taxRate,
      paymentMethod,
      customerName,
      customerPhone,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] font-sans">
      {/* Product Catalog Grid (7 columns) */}
      <div className="lg:col-span-7 flex flex-col space-y-4 h-full overflow-hidden">
        {/* Barcode Search Header */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Scan barcode or type product name/SKU to add..."
            className="w-full pl-9 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <Barcode className="w-5 h-5 absolute right-3 top-2.5 text-slate-400" />
        </div>

        {/* Scrollable Product Cards */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products?.map((p) => {
            const isOutOfStock = p.totalStock <= 0;
            return (
              <button
                key={p._id}
                disabled={isOutOfStock}
                onClick={() => addToCart(p)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition group relative ${
                  isOutOfStock
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono text-slate-400 mb-0.5">{p.sku}</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {p.name}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(p.sellingPrice, business?.currency)}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      p.totalStock <= 5
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {p.totalStock} {p.unit}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout Panel (5 columns) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Current POS Cart ({cart.length})
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-red-500 hover:underline font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Scrollable Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <ShoppingCart className="w-10 h-10 stroke-[1.2] text-slate-300" />
              <div className="text-xs font-medium">Cart is empty</div>
              <div className="text-[11px]">Click items or scan barcodes to begin transaction</div>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={item.product._id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex-1 pr-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatCurrency(item.unitPrice, business?.currency)} &times; {item.quantity} ={' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.unitPrice * item.quantity, business?.currency)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => updateQuantity(idx, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-red-600 flex items-center justify-center ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Payment Execution Drawer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          {/* Customer details mini row */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px]"
            />
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px]"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote },
              { id: 'CARD', label: 'Card', icon: CreditCard },
              { id: 'UPI', label: 'UPI / QR', icon: QrCode },
              { id: 'ONLINE', label: 'Online', icon: Receipt },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                    paymentMethod === method.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Summary Math */}
          <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>{formatCurrency(subTotal, business?.currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Applied Tax ({taxRate}%):</span>
              <span>{formatCurrency(taxAmount, business?.currency)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Grand Total:</span>
              <span className="text-blue-600 dark:text-blue-400">
                {formatCurrency(grandTotal, business?.currency)}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={handleCheckout}
            disabled={!cart.length || checkoutMutation.isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide uppercase transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {checkoutMutation.isPending ? 'Executing FEFO Allocation...' : 'Complete POS Checkout'}
          </button>
        </div>
      </div>

      {/* Sale Receipt Confirmation Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Payment Completed Successfully!
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Invoice #{completedSale.invoiceNumber}
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Store:</span>
                <span className="font-semibold">{business?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span>{completedSale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-mono">{completedSale.paymentMethod}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Batches Allocated (FEFO):
                </div>
                {completedSale.items.map((it, idx) => (
                  <div key={idx} className="text-[11px]">
                    <strong>{it.productName}</strong> ({it.quantity} pcs)
                    <div className="text-[10px] text-blue-600 font-mono pl-2">
                      {it.batchesAllocated?.map((b) => `• Lot: ${b.batchNumber} (${b.quantity} pcs)`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                <span>Total Paid:</span>
                <span className="text-emerald-600">
                  {formatCurrency(completedSale.grandTotal, business?.currency)}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
              >
                New Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
