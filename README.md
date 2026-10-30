# ShelfSense – Smart Inventory & Expiry Management Platform

> A production-grade SaaS-style MERN platform designed for retailers, grocery stores, supermarkets, pharmacies, and warehouse operators with intelligent **FEFO (First Expiry, First Out)** stock deduction algorithms, batch management, immutable inventory movements, purchase orders, real-time POS checkout, and role-based access control.

---

## 🌟 Key Features

1. **FEFO (First Expiry, First Out) Inventory Engine**
   - Automatically prioritizes batches nearest to expiration during point-of-sale checkouts.
   - Quarantines and excludes expired inventory lots from sales automatically.
   - Comprehensive batch monitoring: Expired, Expiring in 7 days, 30 days, and 60 days.

2. **Strict Multi-Tenant Isolation**
   - Complete data boundary isolation for every registered business store.
   - Indexed compound keys (`businessId + sku`, `businessId + invoiceNumber`).

3. **Role-Based Access Control (RBAC)**
   - **Owner / Admin**: Full financial analytics, store settings, employee provisioning, audit logs.
   - **Inventory Manager**: Product cataloging, batch lot control, manual stock adjustments, purchase orders.
   - **Cashier / Staff**: High-speed barcode/POS checkout terminal, real-time stock lookup.

4. **Point of Sale (POS) Fast Terminal**
   - Barcode scanning & search.
   - Cart management, discount calculations, and automatic tax computation.
   - Atomic FEFO deduction ledger and print-ready digital receipts.

5. **Vendor Procurement & Receiving**
   - Purchase order lifecycle: `DRAFT` &rarr; `PENDING` &rarr; `RECEIVED`.
   - Single-click goods receipt that automatically instantiates product batches and synchronizes stock.

6. **Immutable Movement Ledger & Security Audit Logs**
   - Tamper-evident ledger of all stock ins, sales deductions, damages, customer returns, and audits.
   - Comprehensive actor tracking with IP addresses, timestamps, and target payloads.

---

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript (Strict), Vite, Tailwind CSS, shadcn/ui aesthetic, React Router v7, TanStack Query v5, Zustand, Recharts, Lucide React.
- **Backend**: Node.js, Express.js, TypeScript (Strict), Mongoose 8, Zod schema validation, JWT Access & Refresh Token rotation, bcryptjs password hashing.
- **Database**: MongoDB (Local or MongoDB Atlas) with embedded `mongodb-memory-server` fallback for zero-friction local development and testing.
- **Testing**: Vitest, Supertest.

---

## 🔑 Demo Credentials (Dev & Demo Mode)

Run the included seed script to load a fully populated retail store (*FreshChoice Supermarket & Mart*) with 22 categorized SKUs, 44 multi-dated batches, sales transactions, suppliers, and notifications:

| Role | Email Address | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | `admin@shelfsense.dev` | `Password@123` | Full administrative, financial & team control |
| **Inventory Manager**| `manager@shelfsense.dev` | `Password@123` | Products, Batches, Adjustments & Procurement |
| **Staff / Cashier** | `cashier@shelfsense.dev` | `Password@123` | POS Checkout Terminal & Product Stock Search |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ or v20+ installed.
- **npm** v9+ installed.

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment variables
cp .env.example .env

# Run database seed (Seeds 22 products, 44 batches, suppliers & demo users)
npm run seed

# Start API server (port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start Vite development server (port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Running Automated Tests

Run the backend integration test suite verifying authentication, RBAC, FEFO deduction math, and multi-tenant isolation:

```bash
cd server
npm run test
```

All 12 test assertions will execute and pass cleanly.

---

## 📁 Repository Structure

```text
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Layout & reusable UI widgets
│   │   ├── pages/              # Dashboard, Products, Batches, POS, Purchases, etc.
│   │   ├── services/           # ApiClient fetch wrapper
│   │   ├── store/              # Zustand authStore
│   │   ├── types/              # Strongly typed TypeScript interfaces
│   │   ├── App.tsx             # Routing & ProtectedRoute RBAC guards
│   │   └── main.tsx
├── server/                     # Express + Mongoose + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment variable management
│   │   ├── database/           # MongoDB connection & comprehensive seed script
│   │   ├── middleware/         # Auth, RBAC, Zod validation, error handling
│   │   ├── modules/            # Modular domain services, controllers, models & routes
│   │   ├── tests/              # Vitest + Supertest integration tests
│   │   ├── types/              # Server-side TypeScript interfaces
│   │   ├── app.ts              # Express application assembly & security headers
│   │   └── server.ts           # HTTP server listener
└── docs/                       # Academic project report and architecture specifications
```

---

## 🚢 Production Deployment

### Frontend (Vercel)
1. Push this repository to GitHub.
2. In Vercel, import the repository and set **Root Directory** to `client`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Configure Environment Variable: `VITE_API_BASE_URL=https://your-shelfsense-api.onrender.com`.

### Backend (Render / Railway / AWS EC2)
1. In Render, select **New Web Service** pointing to `server`.
2. Set Build Command: `npm install && npm run build`.
3. Set Start Command: `npm start`.
4. Set Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=<Your MongoDB Atlas Connection String>`
   - `JWT_ACCESS_SECRET=<Strong Random Secret>`
   - `JWT_REFRESH_SECRET=<Strong Random Secret>`
   - `CLIENT_URL=https://your-shelfsense.vercel.app`
