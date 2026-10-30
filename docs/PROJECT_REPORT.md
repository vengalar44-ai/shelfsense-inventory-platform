# PROJECT REPORT: SHELFSENSE
## Smart Inventory & Expiry Management Platform

**Academic Year:** 2026–2027  
**Department:** Computer Science & Engineering  
**Project Track:** Full-Stack Web Development & Cloud Systems  

---

### ABSTRACT

Perishable stock mismanagement and product expirations represent significant financial losses for retail, grocery, and healthcare businesses worldwide. Traditional inventory software packages treat stock as homogenous quantities, failing to differentiate between lot manufacturing dates and expiration deadlines. Consequently, older inventory languishes on rear shelving while fresh stock is sold prematurely, leading to spoilage, waste, and regulatory liability.

This project presents **ShelfSense**, an intelligent, multi-tenant enterprise Inventory and Expiry Management SaaS platform built on the MERN stack (MongoDB, Express, React, Node.js) with end-to-end strict TypeScript. ShelfSense pioneers an automated **FEFO (First Expiry, First Out)** batch allocation engine that dynamically routes customer sales deductions to earliest-expiring product batches. The system implements granular lot tracking, real-time POS checkout with barcode resolution, vendor procurement workflows, an immutable inventory movement ledger, audit trails, and multi-tenant data isolation. Automated integration tests validate role-based access control, cryptographic authentication, and stock consistency under concurrency.

**KEYWORDS:** Inventory Management, Expiry Tracking, First Expiry First Out (FEFO), Multi-Tenant SaaS, MERN Stack, TypeScript, Role-Based Access Control (RBAC).

---

### 1. INTRODUCTION

Effective inventory management forms the operational backbone of retail enterprises ranging from convenience marts and pharmacies to regional supermarkets. A recurring challenge faced by these sectors is managing goods with finite shelf lives—such as dairy items, bakery goods, pharmaceuticals, beverages, and packaged dry items. When businesses lack granular lot-level visibility, expiring products often remain unnoticed until spoiled, directly degrading gross profit margins.

**ShelfSense** resolves this core issue by elevating inventory tracking from simple aggregate quantity counters to an active, batch-aware intelligence system.

---

### 2. PROBLEM STATEMENT

Existing small-to-medium business inventory software suffers from critical shortcomings:
1. **Homogenous Stock Representation:** Products are recorded only as bulk numeric quantities without batch or lot expiry discrimination.
2. **Lack of FEFO Automation:** Cashiers and dispatchers lack automated recommendations guiding which physical batch to deduct first.
3. **Absence of Expiry Alerts:** Managers are alerted only after products have already passed their expiration date, preventing promotional discounting or supplier returns.
4. **Weak Multi-Tenant Boundary:** Generic systems risk data cross-talk and lack rigorous role-based permission enforcement.

---

### 3. PROPOSED SYSTEM & ARCHITECTURE

ShelfSense resolves these limitations through a modular architecture:

```text
[Client Layer: React + Vite + Tailwind CSS + TanStack Query + Zustand]
                          │ (REST API / JSON / Bearer JWT)
                          ▼
[Server Layer: Node.js + Express + Strict TypeScript + Zod Validation]
  ├── Multi-Tenant & RBAC Middleware
  ├── FEFO Batch Allocation Engine
  ├── Procurement & POS Checkout Controller
  └── Immutable Inventory Movement Ledger
                          │ (Mongoose ODM)
                          ▼
[Database Layer: MongoDB (Batches, Products, Sales, POs, AuditLogs)]
```

#### Key Functional Innovations:
- **FEFO Allocation Engine:** Queries non-expired batches sorted by `expiryDate: ASC` and iteratively fulfills order quantities from the earliest lots.
- **Dynamic Quarantine:** Quarantines expired lots automatically, preventing accidental sales at point-of-sale terminals.
- **Audited Ledger:** Every stock modification (damage, receipt, customer return, sale) writes an immutable record to the `InventoryMovement` collection.

---

### 4. MODULE DESCRIPTIONS

1. **Authentication & Multi-Tenant RBAC:**
   - JWT access tokens (15-min expiry) paired with rotating refresh tokens (7-day lifecycle).
   - Enforces 3 distinct user roles: `OWNER_ADMIN`, `INVENTORY_MANAGER`, and `CASHIER`.
2. **Product Catalog & Categorization:**
   - SKU and Barcode indexing for instant scanner lookups.
   - Categorization and reorder threshold alerting.
3. **Batch & Expiry Management (FEFO Engine):**
   - Lot tracking with manufacturing date, expiry date, purchase cost, and supplier references.
   - Categorized buckets: Expired, $\le 7$ days, $\le 30$ days, $\le 60$ days.
4. **Point of Sale (POS) Terminal:**
   - Fast checkout interface with real-time stock deduction, tax rate computation, and receipt generation.
5. **Procurement & Purchase Orders:**
   - Lifecycle tracking: `DRAFT` &rarr; `PENDING` &rarr; `RECEIVED`.
   - Single-click stock receiving that automatically instantiates new product lots.
6. **Analytics & Financial Reports:**
   - Daily and monthly revenue aggregations, inventory valuation, product velocity rankings, and CSV export.
7. **Security & Audit Logs:**
   - Tamper-evident ledger capturing user identities, action types, IP addresses, and timestamps.

---

### 5. SYSTEM EVALUATION & TEST RESULTS

The system underwent automated integration testing using Vitest and Supertest against an active database:

| Test Suite Module | Tested Functionality | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | Owner & Business Onboarding | 201 Created with Access + Refresh Tokens | **PASSED** |
| **Security** | Duplicate Email Prevention | 400 Bad Request returned | **PASSED** |
| **RBAC** | Cashier restricted from SKU creation | 403 Forbidden enforced by backend | **PASSED** |
| **FEFO Engine** | Multi-batch earliest expiry deduction | Earliest batch depleted first before newer lot | **PASSED** |
| **Stock Consistency** | Over-quantity sales prevention | 400 Bad Request (Insufficient non-expired stock) | **PASSED** |
| **Data Isolation** | Multi-tenant query segregation | Tenant 2 cannot query Tenant 1 records | **PASSED** |

**Summary:** 12 of 12 test assertions passed with 100% success rate.

---

### 6. CONCLUSION & FUTURE ENHANCEMENTS

ShelfSense demonstrates that modern web technologies and domain-driven design can eliminate retail waste while optimizing inventory turnover. By combining First Expiry, First Out (FEFO) logic with intuitive UI/UX and rigorous multi-tenant security, the platform provides small and medium retailers with enterprise-level capability.

**Future Enhancements:**
- Integration with thermal receipt printers via WebUSB/ESC-POS protocols.
- Predictive machine learning forecasting to recommend procurement lot sizes based on seasonal sales velocities.
- Multi-warehouse inter-branch transfer tracking.
