export interface User {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  role: 'OWNER_ADMIN' | 'INVENTORY_MANAGER' | 'CASHIER';
  phone?: string;
  isActive?: boolean;
}

export interface Business {
  id: string;
  _id?: string;
  name: string;
  businessType: string;
  email: string;
  phone: string;
  currency: string;
  defaultTaxRate: number;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  description?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  minStockThreshold: number;
  totalStock: number;
  categoryId?: { _id: string; name: string };
  defaultSupplierId?: { _id: string; name: string };
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductBatch {
  _id: string;
  productId: Product;
  batchNumber: string;
  initialQuantity: number;
  availableQuantity: number;
  manufacturingDate?: string;
  expiryDate: string;
  purchaseCost: number;
  supplierId?: { _id: string; name: string };
  isExcludedFromSales: boolean;
  notes?: string;
}

export interface InventoryMovement {
  _id: string;
  productId: { _id: string; name: string; sku: string; unit: string };
  batchId?: { _id: string; batchNumber: string; expiryDate: string };
  movementType: 'STOCK_IN' | 'STOCK_OUT' | 'SALE' | 'PURCHASE_RECEIPT' | 'DAMAGE' | 'RETURN' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy: { _id: string; fullName: string; role: string };
  createdAt: string;
}

export interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
}

export interface PurchaseOrderItem {
  productId: { _id: string; name: string; sku: string; unit: string };
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
}

export interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierId: { _id: string; name: string; email: string; phone: string };
  items: PurchaseOrderItem[];
  status: 'DRAFT' | 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  orderDate: string;
  receivedDate?: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  batchesAllocated?: any[];
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  items: SaleItem[];
  subTotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'ONLINE' | 'OTHER';
  customerName?: string;
  customerPhone?: string;
  cashierId: { _id: string; fullName: string };
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  expiredBatchesCount: number;
  nearingExpiryBatchesCount: number;
  todaySales: number;
  todayOrders: number;
  monthlyRevenue: number;
  inventoryValue: number;
  totalInventoryUnits: number;
  recentSales: Sale[];
  salesTrend: { _id: string; sales: number; transactions: number }[];
}
