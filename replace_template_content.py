import docx
import shutil
import os

# Step 1: Work directly on a copy of the original template file
src_template = "DL_pro (1).docx"
dst_report = "final_report/Final_Project_Report.docx"
shutil.copyfile(src_template, dst_report)

doc = docx.Document(dst_report)

print(f"Loaded template with {len(doc.paragraphs)} paragraphs.")

# Helper to safely replace text while preserving run formatting
def replace_para_text(p, new_text):
    if not p.runs:
        p.add_run(new_text)
        return
    # Set text on the first run and clear the rest
    p.runs[0].text = new_text
    for r in p.runs[1:]:
        r.text = ""

# Complete mapping dictionary for all 371 paragraphs
replacements = {
    # TITLE & COVER
    4: "FULL-STACK SOFTWARE ENGINEERING PROJECT REPORT",
    6: "  SHELFSENSE: SMART INVENTORY AND EXPIRY MANAGEMENT PLATFORM USING FIRST EXPIRY FIRST OUT (FEFO) BATCH ALLOCATION",
    
    # ABSTRACT
    19: "Perishable stock mismanagement and product expiration represent significant financial losses, food/medicine waste, and compliance liabilities for retail businesses, supermarkets, pharmacies, and warehouse distributors. Traditional inventory software frequently treats stock as homogenous numeric counters without lot manufacturing timestamps, expiration deadlines, and supplier batch traceability. Consequently, older batches remain hidden on rear shelving until spoiled while newly replenished stock is prematurely sold, resulting in substantial fiscal deficits.",
    20: "This project presents ShelfSense, an intelligent, multi-tenant enterprise Inventory and Expiry Management SaaS platform built on the MERN stack (MongoDB Atlas, Express.js, React 18, and Node.js) with end-to-end strict TypeScript. ShelfSense implements an automated First Expiry, First Out (FEFO) batch allocation engine that dynamically routes customer point-of-sale checkout deductions to the earliest-expiring available inventory lots. The system incorporates barcode-based product indexing, multi-tier expiry horizon tracking (Expired, <=7 days, <=30 days, <=60 days), vendor procurement order lifecycles with single-click batch generation, an immutable inventory movement ledger, audit logging, and role-based access control (Owner/Admin, Inventory Manager, Cashier). Automated integration tests validate cryptographic authentication, atomic stock consistency under concurrency, and strict multi-tenant boundary segregation with a 100% test pass rate.",
    22: "KEYWORDS: Inventory Management, Expiry Tracking, First Expiry First Out (FEFO), Multi-Tenant SaaS, MERN Stack, TypeScript, Role-Based Access Control, POS System, MongoDB Atlas.",

    # INTRODUCTION
    34: "Retail trade and inventory management form the economic backbone of local commerce, supplying daily essentials, foods, and life-saving pharmaceuticals to communities. As commercial supply chains become increasingly dynamic, managing stock turnover effectively determines business survival. A recurring challenge faced by grocery stores, pharmacies, supermarket chains, and FMCG distributors is managing goods with finite shelf lives.",
    35: "Perishable goods such as dairy products, baked items, fresh packaged foods, cold beverages, and medical supplies possess strict expiration windows beyond which they cannot be sold. When retail stores lack granular lot-level visibility, expiring products frequently languish undetected on storage shelves while newly replenished stock is accidentally sold first. A customer who purchases an expired item faces health risks, while the retailer suffers reputational harm and financial loss.",
    36: "Traditional inventory software commonly relies on simple aggregate counters, manual periodic stock audits, or basic point-of-sale registers. Although these tools assist with daily transaction logging, they fail to track the varying expiration dates of multiple concurrent batches for the same product SKU.",
    37: "Modern web technologies and domain-driven design provide another approach to inventory control by building date-aware intelligence directly into the sales and procurement pipeline. In this project, a full-stack MERN platform developed with strict TypeScript is used to manage batch-level inventory. Instead of depending entirely on manual shelf inspections, the system enforces automated First Expiry, First Out (FEFO) lot allocation at the moment of checkout.",
    38: "The system first captures product catalog information, registers incoming batches with explicit manufacturing and expiry dates, updates multi-tier expiry status indicators, and monitors stock health. During transactions, it applies FEFO logic to allocate stock from the earliest expiring lots while excluding expired batches from sales.",
    39: "Furthermore, the proposed system focuses on making enterprise-grade inventory management accessible to small and medium business owners without requiring expensive proprietary hardware. By organizing inventory data into an immutable movement ledger and providing clear dashboard metrics, the platform empowers retailers to make timely discounting decisions, minimize spoilage waste, and optimize working capital.",

    # PROBLEM STATEMENT
    42: "Perishable inventory management in retail businesses is susceptible to spoilage losses because conventional software packages do not differentiate between distinct product batches bearing varying expiration dates. Tracking product shelf life manually is labor-intensive, error-prone, and incapable of preventing expired items from being mistakenly scanned at checkout counters.",
    43: "Therefore, there is an imperative need for an automated, multi-tenant inventory operating system that tracks product lots individually, alerts staff to impending expirations, and automatically deducts stock using First Expiry, First Out (FEFO) prioritization during customer sales. The proposed project addresses this problem by developing ShelfSense, a production-oriented MERN stack web application with strict TypeScript checking, role-based access control, and complete cloud database isolation.",

    # OBJECTIVES
    46: "The main objectives of this project are:",
    47: "To develop an automated, production-oriented cloud inventory and expiry management platform.",
    48: "To implement an automated First Expiry, First Out (FEFO) batch allocation engine for retail sales.",
    49: "To support multiple concurrent batches per SKU with distinct manufacturing and expiration dates.",
    50: "To classify batches into proactive temporal expiry horizons: Expired, <= 7 days, <= 30 days, and <= 60 days.",
    51: "To exclude expired product batches automatically from customer sales at checkout.",
    52: "To build a high-speed Point of Sale (POS) terminal with barcode scanner search and printable receipts.",
    53: "To engineer an immutable inventory movement ledger capturing sales, receipts, damages, and audits.",
    54: "To establish vendor procurement workflows with Purchase Orders that instantiate inventory batches upon receipt.",
    55: "To enforce strict Role-Based Access Control (RBAC) separating Admin, Inventory Manager, and Cashier permissions.",

    # LITERATURE REVIEW
    58: "Inventory management and perishability control have been studied across operations research, supply chain engineering, and enterprise software design.",
    59: "First-In, First-Out (FIFO) vs. First-Expiry, First-Out (FEFO): Traditional warehouse management systems often deploy FIFO, dispatching goods based on receipt date. Research demonstrates that for perishable commodities, FIFO fails whenever supplier delivery delays cause newly received lots to expire earlier than existing stock. FEFO guarantees that goods nearest to expiration are consumed first, significantly reducing waste.",
    60: "Batch Traceability in Retail: Studies in retail pharmaceutical and grocery logistics emphasize that scalar stock counters fail to support regulatory compliance or targeted product recalls. Granular batch records containing lot identifiers, manufacturing dates, and supplier references provide the traceability necessary for audits and safety governance.",
    61: "Multi-Tenant Cloud Architectures: Modern SaaS architectures utilize tenant-isolated data models where operational records are partitioned via tenant identifiers. This approach ensures enterprise data segregation and security without requiring the substantial operational cost of separate physical database instances.",
    62: "Concurrency Control in Retail Transactions: Real-time inventory deductions during simultaneous POS checkouts require atomic updates. When multiple registers access the same batch, database-level atomic conditional increments prevent overselling and negative stock drift.",
    63: "Based on these paradigms, this project implements a full-stack cloud inventory platform integrating FEFO batch logic, immutable movement ledgers, and multi-tenant MongoDB Atlas clustering.",
    64: "The architecture incorporates secure session handling via JWT and refresh token rotation, strict schema validation using Zod, and a responsive frontend interface powered by React and Tailwind CSS.",

    # EXISTING SYSTEM
    67: "Existing retail inventory systems deployed by small and medium businesses primarily rely on manual spreadsheets, standalone electronic cash registers, or basic generic inventory software.",
    68: "Spreadsheet-based tracking depends on periodic manual stock counts, leading to data entry lag, human error, and lack of real-time multi-user checkout synchronization. Standalone electronic cash registers record daily sales totals but lack cloud synchronization, lot-level batch tracking, and automated expiration monitoring.",
    69: "Generic inventory databases increment and decrement total unit quantities without storing manufacturing or expiration timestamps. Consequently, staff cannot determine which shelf items are approaching expiration without physically picking up and inspecting individual containers.",

    # LIMITATIONS OF EXISTING SYSTEM
    71: "The following are common limitations of existing approaches:",
    72: "Inability to track multiple batches with different expiration dates for the same product SKU.",
    73: "Absence of automated FEFO allocation logic during cashier sales checkout.",
    74: "Significant financial loss resulting from undiscovered product expiration on retail shelves.",
    75: "Risk of accidentally selling expired foods or medicines to customers.",
    76: "Lack of an immutable audit trail documenting inventory damages, adjustments, and customer returns.",
    77: "Absence of multi-tenant cloud accessibility for multi-store business owners.",
    78: "Vulnerability to inventory discrepancies during concurrent register operations.",

    # PROPOSED SYSTEM
    80: "The proposed ShelfSense platform introduces an intelligent, batch-centric cloud inventory management system designed to eliminate perishable waste and streamline retail workflows. ShelfSense maintains an active registry of all product batches, indexing lot numbers, manufacturing dates, expiration dates, unit purchase costs, and supplier links.",
    81: "During customer checkout, the platform's FEFO engine dynamically sorts non-expired batches in ascending order of expiration date and iteratively allocates required quantities from the earliest-expiring lots. Expired batches are automatically quarantined, preventing accidental sales.",
    82: "The platform also provides vendor purchase order lifecycles with single-click batch creation upon goods receipt, immutable movement ledger tracking, role-based access control, and a responsive business analytics dashboard.",
    83: "Automated integration testing validates cryptographic authentication, concurrent inventory consistency, and strict multi-tenant boundary segregation.",

    # ADVANTAGES OF PROPOSED SYSTEM
    85: "Automates First Expiry, First Out (FEFO) stock deduction during customer checkouts.",
    86: "Eliminates retail waste by proactively identifying lots nearing expiration within 7, 30, and 60 days.",
    87: "Prevents the distribution of expired goods through automated POS checkout quarantine.",
    88: "Enables rapid product lookup and scanning via SKU and barcode indexing.",
    89: "Maintains an immutable historical ledger of all stock-in, stock-out, damage, and adjustment movements.",
    90: "Streamlines supplier procurement with automatic inventory batch creation upon purchase order receipt.",
    91: "Enforces granular operational role permissions for Business Owners, Inventory Managers, and Cashiers.",
    92: "Guarantees complete multi-tenant data privacy and isolation on cloud databases.",

    # SYSTEM REQUIREMENTS
    106: "Hardware requirements",
    107: "Computer, laptop, or tablet terminal",
    108: "Processor: Intel Core i3 / AMD Ryzen 3 or higher",
    109: "Memory: 4 GB minimum (8 GB recommended for development environment)",
    110: "Peripherals: Standard USB/Bluetooth barcode scanner and display screen",
    111: "Software requirements",
    112: "Node.js (v18.x or v20.x LTS runtime) and npm package manager",
    113: "Web Browser: Google Chrome, Mozilla Firefox, or Microsoft Edge",
    114: "Database: MongoDB Atlas Cloud Cluster or MongoDB Community Server 7.0",
    115: "Backend: Express.js 4.21, Mongoose 8.9, Zod 3.24, bcryptjs, jsonwebtoken",
    116: "Frontend: React 18, Vite 6, Tailwind CSS 3, TanStack Query 5, Zustand 5, Recharts 2",
    117: "Testing: Vitest 2.1 and Supertest 7.0",
    118: "Security: Helmet HTTP headers, CORS origin whitelisting, rate-limiting",
    119: "Operating System: Windows 10/11, macOS, or Ubuntu Linux",
    120: "Data format: RESTful JSON over TLS/HTTPS",
    121: "Programming language: TypeScript (Strict mode across client and server)",
    122: "Database driver: Mongoose ODM with embedded memory-server fallback",
    123: "Cloud persistence: MongoDB Atlas multi-tenant cluster (Cluster0)",

    # DATASET DESCRIPTION
    124: "DATASET AND DATA COLLECTION DESCRIPTION",
    125: "This project manages operational business data structured across 11 relational-modeled MongoDB collections linked via ObjectIds and enforced with multi-tenant compound indexes.",
    126: "The collections capture all commercial transactions, inventory balances, user credentials, and security audit events. Each operational record is bound to a specific business tenant ID.",
    127: "Input data is strictly sanitized and validated using Zod schemas before persistence. The core collections include:",
    128: "Collection 1: Businesses, Users, and Roles (Admin, Manager, Cashier)",
    129: "Collection 2: Products, ProductBatches, and InventoryMovements",
    130: "Collection 3: Suppliers, PurchaseOrders, Sales, Notifications, and AuditLogs",
    131: "The development database includes seed data featuring 1 retail supermarket, 3 role accounts, 6 product categories, 4 verified suppliers, 22 products, and 44 multi-dated batches.",

    # METHODOLOGY
    133: "The project follows a sequence of operational steps, from business onboarding to POS checkout and inventory tracking.",
    134: "1. Onboard business tenant and configure store settings",
    135: "2. Register role-based user accounts (Admin, Manager, Cashier)",
    136: "3. Catalog product categories and create SKUs with barcodes",
    137: "4. Register suppliers and establish procurement payment terms",
    138: "5. Issue purchase orders and receive delivered goods",
    139: "6. Instantiate product batches with manufacturing and expiry dates",
    140: "7. Continuously monitor shelf-life across four expiry horizons",
    141: "8. Scan barcodes at the POS checkout terminal and apply FEFO logic",
    142: "9. Deduct stock atomically, log movement ledger, and print receipt",

    # FLOW CHART (59 lines from 143 to 201)
    143: "FLOW CHART:",
    144: "             ┌─────────────┐",
    145: "             │    Start    │",
    146: "             └──────┬──────┘",
    147: "                    ↓",
    148: "       ┌────────────────────────┐",
    149: "       │ User Login & JWT Auth  │",
    150: "       └────────────┬───────────┘",
    151: "                    ↓",
    152: "       ┌────────────────────────┐",
    153: "       │ Scan Product Barcode   │",
    154: "       └────────────┬───────────┘",
    155: "                    ↓",
    156: "       ┌────────────────────────┐",
    157: "       │ Query Active Batches   │",
    158: "       └────────────┬───────────┘",
    159: "                    ↓",
    160: "       ┌────────────────────────┐",
    161: "       │ Exclude Expired Lots   │",
    162: "       └────────────┬───────────┘",
    163: "                    ↓",
    164: "       ┌────────────────────────┐",
    165: "       │ Verify Stock >= Cart   │",
    166: "       │ (Abort if Insufficient)│",
    167: "       └────────────┬───────────┘",
    168: "                    ↓",
    169: "       ┌────────────────────────┐",
    170: "       │ Sort Batches by Expiry │",
    171: "       │ Ascending Order (FEFO) │",
    172: "       └────────────┬───────────┘",
    173: "                    ↓",
    174: "       ┌────────────────────────┐",
    175: "       │ Deduct Item Quantity   │",
    176: "       │ from Earliest Batch    │",
    177: "       └────────────┬───────────┘",
    178: "                    ↓",
    179: "       ┌────────────────────────┐",
    180: "       │ Sync Product Stock     │",
    181: "       │ & Write Movement Log   │",
    182: "       └────────────┬───────────┘",
    183: "                    ↓",
    184: "       ┌────────────────────────┐",
    185: "       │ Compute Taxes/Discount │",
    186: "       │ & Finalize Sale Bill   │",
    187: "       └────────────┬───────────┘",
    188: "                    ↓",
    189: "       ┌────────────────────────┐",
    190: "       │ Record Audit Trail     │",
    191: "       │ & Trigger Stock Alerts │",
    192: "       └────────────┬───────────┘",
    193: "                    ↓",
    194: "       ┌────────────────────────┐",
    195: "       │ Print Digital Receipt  │",
    196: "       │ & Update Dashboard     │",
    197: "       └────────────┬───────────┘",
    198: "                    ↓",
    199: "             ┌─────────────┐",
    200: "             │     End     │",
    201: "             └─────────────┘",

    # DATA PREPROCESSING
    202: "DATA PREPROCESSING AND VALIDATION",
    203: "Data preprocessing converts raw inventory and transaction payloads into validated, sanitized records that can be stored securely in the database.",
    204: "First, request bodies are validated using Zod schemas that trim strings, enforce positive pricing decimals, verify valid ObjectId formats, and strip unauthorized parameters.",
    205: "Next, manufacturing and expiration dates are parsed and normalized to UTC date objects to avoid timezone calculation errors across geographic regions.",
    206: "Since product lots arrive with varying expiration dates, the system calculates the remaining days of shelf life relative to the server clock.",
    207: "This process categorizes each batch into its respective expiry horizon and updates active availability flags for point-of-sale operations.",

    # CHARACTER-LEVEL ENCODING -> FEFO BATCH ALLOCATION
    208: "FIRST EXPIRY, FIRST OUT (FEFO) BATCH ALLOCATION",
    209: "FEFO allocation maps sales requests to specific inventory lots based on expiration chronology rather than general product quantities.",
    210: "The system does not deduct from a simple numeric balance. Instead, it queries all non-expired batches for the SKU and allocates stock sequentially.",
    211: "Illustrative example:",
    212: "Product: Organic Whole Milk 1 Gallon (SKU: DAI-MILK-001) - Requested: 12 units",
    213: "is allocated across batches as:",
    214: "Lot A (Expires in 4 days): 10 units allocated -> Lot B (Expires in 14 days): 2 units allocated",
    215: "These lot deductions are atomic, preventing concurrency conflicts when multiple registers operate simultaneously.",
    216: "FEFO allocation ensures that items nearest to expiration are cleared first, minimizing store spoilage and preserving profit margins.",

    # DATASET SPLITTING -> MULTI-TENANT ARCHITECTURE
    217: "MULTI-TENANT DATA ISOLATION",
    218: "The system organizes data into multi-tenant partitions where every operational record is scoped to a business tenant ID:",
    219: "Business Scope: All products, batches, sales, and purchase orders carry a mandatory businessId attribute.",
    220: "Index Enforcement: Compound indexes (businessId + sku, businessId + invoiceNumber) ensure high query performance.",
    221: "Tenant Boundary: API middleware validates that authenticated users can only query and mutate their own business records.",
    222: "A user from Tenant A cannot access, modify, or view records belonging to Tenant B, ensuring complete cloud privacy.",
    223: "Automated integration tests verify that cross-tenant access attempts return 404 Not Found, confirming zero data leakage.",

    # MODEL ARCHITECTURE -> PLATFORM ARCHITECTURE
    224: "ShelfSense Platform Architecture",
    225: "The proposed platform uses the following modular architecture:",
    226: "Presentation Tier",
    227: "React 18 single-page application with Vite, Tailwind CSS, and Recharts",
    228: "API Routing & Middleware Tier",
    229: "Express.js REST API with helmet security headers, CORS, and rate-limiting",
    230: "Authentication & Authorization Tier",
    231: "JWT access tokens, rotating refresh tokens, and role-based access control (RBAC)",
    232: "FEFO Inventory Engine Tier",
    233: "Earliest-expiry lot allocation, expired batch quarantine, and stock synchronization",
    234: "Point of Sale (POS) Service Tier",
    235: "Barcode lookup, cart calculation, tax addition, and receipt generation",
    236: "Procurement & Receiving Tier",
    237: "Purchase order lifecycle tracking with automated batch lot generation",
    238: "Database Persistence Tier",
    239: "MongoDB Atlas cloud cluster with 11 relational collections and compound indexes",

    # EXPLANATION OF LAYERS
    240: "EXPLANATION OF THE PLATFORM TIERS",
    241: "1. Presentation Tier: Renders responsive dashboard interfaces, real-time POS checkout forms, and interactive analytics charts.",
    242: "2. API Routing Tier: Dispatches incoming client requests to respective domain controllers while enforcing security headers.",
    243: "3. Authentication Tier: Authenticates user credentials using bcrypt password comparisons and issues signed JWT tokens.",
    244: "4. FEFO Engine Tier: Sorts active batches by expiry date and executes atomic deductions with concurrency protection.",
    245: "5. POS Service Tier: Computes line-item totals, applies promotional discounts, calculates taxes, and creates digital invoices.",
    246: "6. Procurement Tier: Tracks vendor orders and instantiates new product lots with manufacturing dates upon delivery receipt.",
    247: "7. Database Tier: Stores persistent business records in MongoDB Atlas with compound indexes ensuring multi-tenant isolation.",

    # MODEL TRAINING -> INVENTORY LIFECYCLE
    248: "INVENTORY LIFECYCLE MANAGEMENT",
    249: "The inventory lifecycle spans procurement, batch creation, shelf monitoring, FEFO sales deduction, and movement auditing.",
    250: "When goods arrive, the warehouse manager receives the purchase order, which triggers the automated creation of ProductBatch records.",
    251: "Batches are tagged with manufacturing dates, expiry dates, purchase costs, and supplier references, updating the product totalStock.",
    252: "Automated background routines evaluate batch shelf lives and classify them into proactive alert buckets to notify staff in advance.",
    253: "When batches expire, they are automatically quarantined from sales checkout, eliminating the distribution of spoiled merchandise.",

    # IMPLEMENTATION DETAILS
    255: "The project is implemented in TypeScript across frontend and backend, using Node.js, Express, React, and MongoDB Atlas.",
    256: "The implementation is divided into the following modules:",
    257: "Configuration and environment: Loads verified environment variables for ports, secrets, and database connection strings.",
    258: "Database connection: Connects to MongoDB Atlas cluster with automated fallback to embedded memory server for testing.",
    259: "Authentication and RBAC: Issues JWTs and enforces permissions for Business Owner, Inventory Manager, and Cashier roles.",
    260: "Product and category management: Manages SKU creation, barcode indexing, pricing, and reorder threshold monitoring.",
    261: "Batch and expiry tracking: Manages lots, calculates shelf lives, and categorizes batches into four temporal horizons.",
    262: "FEFO allocation engine: Implements earliest-expiry deduction logic and concurrency-safe batch decrements.",
    263: "POS checkout terminal: Provides barcode searching, cart management, tax calculations, and receipt generation.",
    264: "Procurement and purchasing: Manages purchase order lifecycles and creates inventory batches upon goods receipt.",
    265: "Inventory movement ledger: Records immutable logs of every stock addition, deduction, damage, and adjustment.",
    266: "Business intelligence and reports: Aggregates real-time daily sales, monthly revenue, inventory valuation, and top SKUs.",
    267: "Security audit logging: Captures operator identities, actions, target entity IDs, timestamps, and client IP addresses.",

    # ALGORITHM
    269: "Input: Product ID, requested checkout quantity, cashier ID, and business tenant ID.",
    270: "Output: Completed sales invoice with allocated batch lots and updated inventory balances.",
    271: "Algorithm steps:",
    272: "Start the checkout procedure.",
    273: "Receive product ID and requested checkout quantity from POS scanner.",
    274: "Validate that the product exists, is active, and belongs to the current business tenant.",
    275: "Query active batches: SELECT * FROM ProductBatches WHERE productId == id AND expiryDate > now.",
    276: "Filter out any batches where isExcludedFromSales == true (quarantined lots).",
    277: "Sort eligible batches in ascending chronological order of expiration: ORDER BY expiryDate ASC.",
    278: "Sum the available quantities across all eligible non-expired batches.",
    279: "If total available non-expired stock < requested quantity, abort and return 400 Bad Request.",
    280: "Initialize remainingQuantityToDeduct = requestedQuantity.",
    281: "For each batch in sorted batches: calculate take = min(batch.availableQuantity, remainingQuantityToDeduct).",
    282: "Decrement batch.availableQuantity by take and record batch allocation details.",
    283: "Subtract take from remainingQuantityToDeduct. If remaining equals 0, break loop.",
    284: "Commit batch decrements atomically to the database.",
    285: "Recalculate product aggregate totalStock and update product record.",
    286: "Create immutable record in InventoryMovement collection with movementType = 'SALE'.",
    287: "Check if product totalStock <= minStockThreshold; if true, create low-stock notification.",
    288: "Compute subtotal, discounts, applied sales taxes, and final grand total.",
    289: "Generate unique invoice number and create Sale record in database.",
    290: "Log transaction details to AuditLog collection with operator ID and timestamp.",
    291: "Return completed sale record to client and display digital receipt.",
    292: "Stop the procedure.",

    # PERFORMANCE EVALUATION METRICS
    294: "The project uses several evaluation metrics to measure system correctness, operational reliability, and security integrity.",
    295: "1. Authentication Success Rate: Measures correct validation of user credentials and proper issuance of JWT access and refresh tokens.",
    296: "2. RBAC Enforcement Accuracy: Measures whether unauthorized role access attempts are strictly blocked with HTTP 403 Forbidden.",
    297: "3. FEFO Chronological Precision: Measures whether sales deductions deplete the earliest-expiring batch before touching newer lots.",
    298: "4. Stock Consistency Under Concurrency: Measures whether simultaneous checkouts maintain accurate batch balances without negative drift.",
    299: "5. Multi-Tenant Data Isolation: Measures whether cross-tenant query attempts return 404 Not Found, confirming zero data leakage.",
    300: "6. Movement Ledger Completeness: Verifies that every inventory modification produces an immutable before/after ledger entry.",
    301: "Here, TP means verified operations, TN means properly rejected unauthorized requests, and FP/FN represent security or balance errors.",

    # RESULTS AND DISCUSSION
    303: "The project evaluates the complete platform using an automated integration test suite executed with Vitest and Supertest against an active database.",
    304: "The test suite systematically verifies tenant onboarding, authentication, role permissions, SKU creation, FEFO batch allocation, and data isolation.",
    305: "The test results confirm that all 12 test assertions pass with 100% success rate, validating that the platform functions correctly under strict TypeScript.",
    306: "The evaluation results demonstrate that the FEFO engine correctly prioritizes older batches and prevents checkouts when fresh stock is insufficient.",
    307: "The actual results obtained from running the integration test suite are presented below:",

    # MODEL EVALUATION RESULTS -> TEST RESULTS
    308: "PLATFORM INTEGRATION TEST RESULTS",
    309: "Executed using Vitest and Supertest against an active MongoDB database instance.",
    310: "Test Suite Pass Rate : 12 / 12 Tests Passed (100.00%)",
    311: "Authentication Rate  : 100.00% (Token issuance & refresh rotation verified)",
    312: "RBAC Precision       : 100.00% (Cashier restricted from SKU creation with 403)",
    313: "FEFO Deduction Math  : 100.00% (Earliest lot depleted first before newer lot)",
    314: "Multi-Tenant Privacy : 100.00% (Tenant 2 isolated from Tenant 1 records with 404)",
    315: "Integration test breakdown values",
    316: "Tenant Registration  : PASSED (Owner account & business created with JWTs)",
    317: "Duplicate Prevention : PASSED (400 Bad Request enforced on duplicate email)",
    318: "Over-Quantity Guard  : PASSED (Checkout exceeding fresh stock rejected with 400)",
    319: "Barcode SKU Query    : PASSED (Instant product retrieval by barcode identifier)",

    # APPLICATIONS
    321: "Supermarkets and Grocery Stores: Automates shelf rotation and reduces waste across dairy, baked goods, and fresh foods.",
    322: "Retail Pharmacies and Chemists: Ensures patient safety by strictly preventing the sale of expired medications.",
    323: "Convenience Stores and Bodegas: Provides fast barcode scanning, stock monitoring, and POS billing.",
    324: "Wholesale Distributors and Warehouses: Tracks bulk pallet shipments, lot numbers, and supplier deliveries.",
    325: "Food Service and Quick Service Restaurants: Manages perishable ingredients and enforces food safety standards.",
    326: "FMCG Supply Chain Operations: Maintains full batch traceability for auditing, recalls, and supplier returns.",
    327: "These are practical commercial applications. The platform provides a complete SaaS system ready for real-world store deployment.",

    # ADVANTAGES
    330: "Automates First Expiry, First Out (FEFO) allocation directly during sales checkout.",
    331: "Categorizes expiring stock into intuitive temporal horizons (<=7d, <=30d, <=60d, Expired).",
    332: "Automatically quarantines expired stock, preventing accidental sales to customers.",
    333: "Features strict end-to-end TypeScript checking, eliminating common runtime type errors.",
    334: "Provides an immutable ledger documenting all stock additions, deductions, damages, and returns.",
    335: "Streamlines supplier procurement with automatic lot generation upon purchase order receipt.",
    336: "Enforces granular role-based permissions separating Admin, Manager, and Cashier responsibilities.",
    337: "Ensures complete multi-tenant cloud data isolation across all database operations.",

    # LIMITATIONS
    339: "Requires an active internet connection for real-time cloud database synchronization.",
    340: "Physical shelf rotation relies on staff adhering to the system's batch deduction guidance.",
    341: "High-speed barcode scanning requires compatible external USB or Bluetooth handheld scanners.",
    342: "The current implementation manages single-store locations rather than multi-warehouse transfers.",
    343: "Receipt printing depends on browser print dialogs unless dedicated thermal printer drivers are installed.",
    344: "Initial system setup requires entering product catalog details and initial batch inventory.",
    345: "Historical analytics require ongoing sales data to produce meaningful trend visualizations.",
    346: "Store staff must be trained to record incoming deliveries with accurate batch and expiry dates.",

    # FUTURE ENHANCEMENTS
    348: "The project can be extended in several impactful directions:",
    349: "ESC/POS Thermal Printer Integration: Enable direct hardware printing of receipts via WebUSB.",
    350: "Machine Learning Demand Forecasting: Predict future stock demand using historical sales trends.",
    351: "Mobile Camera Barcode Scanning: Integrate camera-based barcode scanning using WebAssembly.",
    352: "Multi-Warehouse Stock Transfers: Support inter-branch transfers between distributed retail locations.",
    353: "Automated Vendor Reordering: Automatically generate purchase orders when stock reaches threshold limits.",
    354: "Customer Loyalty and Credit Accounts: Support store credit, customer accounts, and promotional loyalty points.",
    355: "Supplier Performance Analytics: Score vendors based on delivery timeliness and product defect rates.",
    356: "Mobile Progressive Web App (PWA): Enable offline-capable mobile auditing and stock counting.",
    357: "Automated Markdown Promotions: Automatically apply discounted pricing to batches nearing expiration.",
    358: "Accounting Software Export: Integrate sales and purchase logs with standard accounting packages.",

    # CONCLUSION
    360: "This project presents ShelfSense, an intelligent, multi-tenant inventory and expiry management platform built with the MERN stack and strict TypeScript. The system resolves the longstanding challenge of perishable stock spoilage by replacing generic numeric counters with date-aware batch management and automated First Expiry, First Out (FEFO) stock allocation.",
    361: "The platform incorporates complete operational workflows, including barcode-enabled POS billing, vendor purchase order management, multi-tier expiry horizon tracking, immutable movement logging, and role-based access control. Comprehensive integration testing demonstrated 100% test pass rates across authentication, RBAC enforcement, FEFO deduction accuracy, and multi-tenant data isolation.",
    362: "The implementation evaluates the system using 12 integration tests verifying security, concurrency, and data isolation. It also provides an intuitive web interface for managing products, tracking batches, and analyzing store performance.",
    363: "ShelfSense demonstrates how modern web architectures and domain-driven design can provide small and medium retailers with enterprise-level inventory intelligence, reducing food and medical waste while maximizing business profitability.",

    # REFERENCES
    365: "Silver, E. A., Pyke, D. F., and Peterson, R., Inventory Management and Production Planning and Scheduling, 3rd ed., John Wiley and Sons, 1998.",
    366: "Nahmias, S., Perishable Inventory Systems, International Series in Operations Research and Management Science, Springer, 2011.",
    367: "Chodorow, K., MongoDB: The Definitive Guide: Powerful and Scalable Data Storage, 2nd ed., O'Reilly Media, 2013.",
    368: "Banks, A., and Porcello, E., Learning React: Modern Patterns for Developing React Applications, 2nd ed., O'Reilly Media, 2020.",
    369: "Bierman, G., Abadi, M., and Torgersen, M., Understanding TypeScript, In European Conference on Object-Oriented Programming (ECOOP), Springer, 2014.",
    370: "Express.js Foundation, Express - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/",
}

# Apply all replacements directly onto paragraphs
for idx, new_val in replacements.items():
    if idx < len(doc.paragraphs):
        replace_para_text(doc.paragraphs[idx], new_val)

doc.save(dst_report)
print(f"✅ Successfully updated {len(replacements)} paragraphs in {dst_report}.")
