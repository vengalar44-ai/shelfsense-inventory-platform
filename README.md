<div align="center">

# 🏷️ ShelfSense
### Smart Inventory & Expiry Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Checked-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Connected-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Vitest](https://img.shields.io/badge/Tests-12%20Passed%20(100%25)-brightgreen?logo=vitest)](https://vitest.dev/)

**An intelligent, multi-tenant inventory and expiry tracking SaaS designed for grocery stores, supermarkets, pharmacies, and small retail businesses.**

[Features](#-key-features) • [Architecture](#-architecture) • [Demo Accounts](#-demo-accounts) • [Getting Started](#-getting-started) • [API Documentation](#-api-endpoints) • [Testing](#-running-tests) • [Deployment](#-deployment-guide)

</div>

---

## 📌 Overview

Mismanaged perishable stock causes billions in retail waste annually. Standard inventory systems merely record bulk numeric counters without distinguishing when individual batches expire.

**ShelfSense** solves this by treating inventory as granular, date-stamped batches governed by an automated **First Expiry, First Out (FEFO)** allocation engine. During sales checkouts, the system automatically routes deductions to the lots nearest to expiry, prevents the checkout of spoiled items, provides proactive shelf-life alerts, and maintains an immutable movement audit trail.

---

## ✨ Key Features

### 1. ⏱️ FEFO (First Expiry, First Out) Engine
- Automatically prioritizes batches nearest to expiration during point-of-sale checkouts.
- Proactively quarantines expired lots, eliminating accidental sales of spoiled goods.
- Multi-tier expiry monitoring: **Expired**, **Expiring within 7 Days**, **Within 30 Days**, and **Within 60 Days**.

### 2. 🏢 Multi-Tenant Data Isolation
- Strict business-level data boundary enforcement across all queries.
- Compound indexing (`businessId + sku`, `businessId + invoiceNumber`) to ensure cross-tenant zero leakage.

### 3. 👥 Role-Based Access Control (RBAC)
- **Business Owner / Admin:** Full financial analytics, store settings, team member provisioning, and security audit logs.
- **Inventory Manager:** Product SKU registration, lot creation, stock damage/audits, and supplier purchase orders.
- **Cashier / Staff:** Fast barcode/POS checkout terminal and real-time stock lookup.

### 4. 🛒 Point of Sale (POS) Terminal
- Barcode scanning and SKU instant lookup.
- Real-time cart calculations with configurable tax rates and promo discounts.
- Atomic FEFO deduction execution with clean, print-ready digital receipts.

### 5. 📦 Procurement & Vendor Purchase Orders
- End-to-end procurement lifecycle: `DRAFT` ➔ `PENDING` ➔ `RECEIVED` ➔ `CANCELLED`.
- Single-click receiving action that automatically generates inventory batches and synchronizes active stock levels.

### 6. 📜 Immutable Inventory Movements & Audit Logs
- Append-only ledger recording all stock movements: `STOCK_IN`, `SALE`, `PURCHASE_RECEIPT`, `DAMAGE`, `RETURN`, and `ADJUSTMENT`.
- Audit logs capturing actor identity, action type, IP address, timestamp, and entity payload.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript (Strict Mode), Vite, Tailwind CSS, shadcn/ui aesthetic, React Router v7, TanStack Query v5, Zustand, Recharts, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript (Strict Mode), Mongoose 8, Zod schema validation, JWT access & rotating refresh tokens, bcryptjs |
| **Database** | MongoDB Atlas (Multi-Tenant Collections) with embedded `mongodb-memory-server` fallback for zero-friction local testing |
| **Testing** | Vitest, Supertest (12 integration tests covering Auth, RBAC, FEFO engine, stock consistency & isolation) |

---

## 🔑 Demo Accounts

The database comes pre-seeded with a comprehensive demo retail store (*FreshChoice Supermarket & Mart*) loaded with 22 categorized products, 44 multi-dated batches, purchase orders, and sales records:

| Role | Email Address | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | `admin@shelfsense.dev` | `Password@123` | Full administrative, financial & employee control |
| **Inventory Manager** | `manager@shelfsense.dev` | `Password@123` | Products, Batches, Stock Audits & Purchase Orders |
| **Cashier / Staff** | `cashier@shelfsense.dev` | `Password@123` | POS Terminal & Product Stock Search |

*(The web interface also includes 1-click login buttons on the sign-in screen for instant access).*

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- [npm](https://www.npmjs.com/) v9+
- A MongoDB connection string (Local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/shelfsense-inventory-platform.git
cd shelfsense-inventory-platform
```

### 2. Configure Environment Variables
Inside the `server/` directory, create a `.env` file (or copy `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shelfsense?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_super_secret_access_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Inside the `client/` directory:
```env
VITE_API_BASE_URL=/api/v1
```

### 3. Install Dependencies
```bash
# Install Server packages
cd server
npm install

# Install Client packages
cd ../client
npm install
```

### 4. Seed the Database
Populate your database with demo categories, products, batches, and transactions:
```bash
cd server
npm run seed
```

### 5. Run the Application
Open two separate terminal windows:

**Terminal 1 — Backend API Server:**
```bash
cd server
npm run dev
# Server listening on http://localhost:5000
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Running Tests

ShelfSense includes automated integration tests covering cryptographic authentication, role access barriers, FEFO deduction algorithms, and data isolation:

```bash
cd server
npm run test
```

### Test Results
```text
 ✓ src/tests/integration.test.ts (12 tests) 11705ms
   ✓ Module 1: Authentication & RBAC > should register a new business tenant and owner admin
   ✓ Module 1: Authentication & RBAC > should prevent duplicate registration with the same email
   ✓ Module 1: Authentication & RBAC > should authenticate user and return tokens upon valid login
   ✓ Module 1: Authentication & RBAC > should reject login with incorrect credentials
   ✓ Module 1: Authentication & RBAC > should create team members with specific roles (Manager and Cashier)
   ✓ Module 1: Authentication & RBAC > should enforce role-based access control (Cashier cannot create products)
   ✓ Module 2: Products & Categories > should create a category and a product under business tenant
   ✓ Module 2: Products & Categories > should query product by barcode
   ✓ Module 3: Batches & FEFO > should add multiple batches with different expiry dates and update totalStock
   ✓ Module 3: Batches & FEFO > should execute FEFO deduction during checkout
   ✓ Module 3: Batches & FEFO > should reject checkout if requested quantity exceeds available non-expired stock
   ✓ Module 4: Multi-Tenant Data Isolation > should strictly isolate data between distinct businesses

 Test Files  1 passed (1)
      Tests  12 passed (12)
```

---

## 📡 API Endpoints

All authenticated requests require a header: `Authorization: Bearer <access_token>`.

### Authentication
- `POST /api/v1/auth/register` — Onboard new business and primary owner account.
- `POST /api/v1/auth/login` — Authenticate and receive JWT + Refresh Token.
- `POST /api/v1/auth/refresh` — Issue a new access token via refresh token rotation.
- `GET /api/v1/auth/me` — Retrieve active profile and business context.

### Products & Batches (FEFO)
- `GET /api/v1/products` — Filter products by category, status, search, and pagination.
- `POST /api/v1/products` — Create new SKU (Requires Manager or Admin).
- `GET /api/v1/batches` — Fetch batches filtered by expiry status (`expiring_7d`, `expiring_30d`, `expired`).
- `GET /api/v1/batches/expiry-summary` — Aggregated expiry KPI counters and estimated loss value.
- `POST /api/v1/batches` — Register a new product batch with expiry dates.
- `PATCH /api/v1/batches/:id/toggle-exclude` — Quarantine batch from POS sales.

### POS & Inventory
- `POST /api/v1/sales/checkout` — Execute atomic FEFO batch deductions and record sale receipt.
- `GET /api/v1/sales` — List historical invoices.
- `GET /api/v1/inventory/movements` — Query immutable stock movement ledger.
- `POST /api/v1/inventory/adjust` — Record manual inventory counts, breakages, or damages.

### Purchases & Suppliers
- `GET /api/v1/purchases` — View purchase orders.
- `POST /api/v1/purchases` — Issue a new purchase order.
- `POST /api/v1/purchases/:id/receive` — Receive goods, create batches, and update inventory.
- `GET /api/v1/suppliers` — Supplier directory and payment terms.

### Analytics & Administration
- `GET /api/v1/analytics/dashboard` — Live revenue, valuations, low-stock alerts, and sales trend data.
- `GET /api/v1/analytics/reports` — Best-selling SKUs and category share breakdown.
- `GET /api/v1/audit-logs` — Tamper-evident operational audit trail (Admin only).
- `GET /api/v1/users` — Employee list and RBAC administration (Admin only).

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
1. Push your repository to GitHub.
2. In Vercel, import the repository and specify the **Root Directory** as `client`.
3. Set the Framework Preset to **Vite**.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Add Environment Variable:
   - `VITE_API_BASE_URL=https://your-shelfsense-api.onrender.com/api/v1`
6. Click **Deploy**.

### Backend Deployment (Render / Railway)
1. Create a **New Web Service** pointing to the `server` directory.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<Your MongoDB Atlas SRV URI>`
   - `JWT_ACCESS_SECRET=<Strong Random Key>`
   - `JWT_REFRESH_SECRET=<Strong Random Key>`
   - `CLIENT_URL=https://your-shelfsense.vercel.app`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
