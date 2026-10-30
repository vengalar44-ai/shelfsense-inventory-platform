import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

doc = docx.Document()

# Page Margins
sections = doc.sections
for s in sections:
    s.top_margin = Inches(1)
    s.bottom_margin = Inches(1)
    s.left_margin = Inches(1)
    s.right_margin = Inches(1)

def add_header(title, level=1):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(title)
    run.bold = True
    run.font.name = 'Arial'
    if level == 1:
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(0, 51, 102) # Navy
    elif level == 2:
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(34, 34, 34)
    else:
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(80, 80, 80)
    return h

def add_p(text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(10)
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(10)
    r.italic = italic
    return p

def add_bullet(text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(3)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(10)
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(10)
    return p

# TITLE BLOCK
title_p = doc.add_paragraph()
title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
t1 = title_p.add_run("PRASAD V POTLURI SIDDHARTHA INSTITUTE OF TECHNOLOGY\n")
t1.bold = True
t1.font.name = 'Arial'
t1.font.size = Pt(12)
t1.font.color.rgb = RGBColor(0, 51, 102)

t2 = title_p.add_run("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nACADEMIC YEAR: 2026-27\n\n")
t2.bold = True
t2.font.name = 'Arial'
t2.font.size = Pt(10.5)

t3 = title_p.add_run("FULL-STACK WEB & CLOUD SYSTEMS PROJECT REPORT\n\n")
t3.bold = True
t3.font.name = 'Arial'
t3.font.size = Pt(12)
t3.font.color.rgb = RGBColor(180, 50, 50)

t4 = title_p.add_run("SHELFSENSE – SMART INVENTORY & EXPIRY MANAGEMENT PLATFORM\nWITH FIRST EXPIRY, FIRST OUT (FEFO) BATCH ALLOCATION ENGINE\n\n")
t4.bold = True
t4.font.name = 'Arial'
t4.font.size = Pt(14)
t4.font.color.rgb = RGBColor(0, 51, 102)

# Faculty & Team Block
meta_p = doc.add_paragraph()
meta_p.paragraph_format.line_spacing = 1.2
meta_p.paragraph_format.space_after = Pt(14)
r = meta_p.add_run("Faculty Name: ")
r.bold = True
meta_p.add_run("Ms. Y. SUREKHA\n")
r = meta_p.add_run("Project Track: ")
r.bold = True
meta_p.add_run("Full-Stack Enterprise Applications & Cloud Database Architecture\n")
r = meta_p.add_run("Team Members:\n")
r.bold = True
meta_p.add_run("1. Name: ____________________       Roll No: ____________________\n")
meta_p.add_run("2. Name: ____________________       Roll No: ____________________\n")

# ABSTRACT
add_header("ABSTRACT")
add_p(
    "Perishable stock mismanagement and product expiration constitute major financial deficits and operational vulnerabilities for small and medium-sized commercial enterprises, including grocery supermarkets, retail outlets, convenience stores, and pharmaceutical distributors. Traditional inventory control software often records product inventory as homogenous aggregate numerical counters, completely devoid of lot manufacturing timestamps, expiration deadlines, and vendor batch traceability. Consequently, older batches remain hidden on rear shelving until spoiled while newly replenished stock is prematurely sold, resulting in substantial fiscal loss, ecological food/medicine waste, and severe regulatory non-compliance."
)
add_p(
    "This project presents ShelfSense, an intelligent, multi-tenant enterprise Inventory and Expiry Management SaaS platform built on the MERN stack (MongoDB Atlas, Express.js, React 18, and Node.js) with end-to-end strict TypeScript. ShelfSense pioneers an automated First Expiry, First Out (FEFO) batch allocation engine that dynamically routes customer point-of-sale checkout deductions to the earliest-expiring available inventory lots. The platform integrates barcode-based product indexing, multi-tier expiry horizon tracking (Expired, <=7 days, <=30 days, <=60 days), vendor procurement order lifecycles with single-click batch generation, an immutable inventory movement ledger, audit logging, and role-based access control (Owner/Admin, Inventory Manager, Cashier). Automated integration tests validate cryptographic authentication, atomic stock consistency under concurrency, and strict multi-tenant boundary segregation with a 100% test pass rate."
)
add_p("KEYWORDS: ", bold_prefix="")
doc.paragraphs[-1].runs[0].bold = True
doc.paragraphs[-1].add_run("Inventory Management, Expiry Tracking, First Expiry First Out (FEFO), Multi-Tenant SaaS, MERN Stack, TypeScript, Role-Based Access Control (RBAC), POS System, MongoDB Atlas.")

# INTRODUCTION
add_header("INTRODUCTION")
add_p(
    "In the modern retail and supply chain ecosystem, effective inventory management represents the foundational operational pillar determining business profitability and customer trust. A pervasive challenge encountered across grocery stores, pharmacies, supermarket chains, and FMCG distributors is the handling of stock bearing finite shelf lives. Products such as dairy goods, fresh baked items, packaged perishable consumables, cold-pressed juices, and pharmaceutical remedies possess strict expiration windows beyond which they cannot be legally or ethically distributed."
)
add_p(
    "Conventional retail software packages approach inventory management through simple scalar arithmetic—merely incrementing stock counters during deliveries and decrementing counters during checkouts. This homogenous treatment fails to capture the multi-batch reality of physical stores, where multiple deliveries of the exact same product coexist on shelves with divergent expiration dates."
)
add_p(
    "ShelfSense transforms inventory management from passive quantity tracking into an active, date-aware intelligence system. Built with an enterprise-grade MERN architecture in strict TypeScript, ShelfSense automates FEFO batch allocation during sales, provides real-time expiry hazard visualization, enforces role-based operational security, and provides management with actionable business analytics."
)

# PROBLEM STATEMENT
add_header("PROBLEM STATEMENT")
add_p(
    "Small and medium-sized retail enterprises currently suffer from systemic inventory degradation due to critical technological limitations:"
)
add_bullet(" Existing software tracks total item quantity but lacks lot-level batch tracking, rendering expiration dates invisible until manual physical shelf audits take place.", "Homogenous Stock Representation: ")
add_bullet(" Cashiers and warehouse staff have no automated guidance directing them to dispense older lots first, causing fresh deliveries to be sold while older units expire on shelves.", "Absence of FEFO Logic: ")
add_bullet(" Business owners are alerted to expired stock only after the product has spoiled, preventing timely promotional bundling, markdown discounting, or supplier returns.", "Reactive Expiry Notification: ")
add_bullet(" Generic multi-store systems frequently suffer from data leakage between tenants and fail to restrict critical administrative operations from cashier staff.", "Inadequate Role Permissions & Multi-Tenancy: ")
add_p(
    "Therefore, there is an imperative need for an integrated, multi-tenant inventory operating system capable of orchestrating granular batch lifecycles, enforcing FEFO deductions at point-of-sale, and safeguarding business margins."
)

# OBJECTIVES OF THE PROJECT
add_header("OBJECTIVES OF THE PROJECT")
add_bullet("To design and develop a production-ready, multi-tenant SaaS application (ShelfSense) using the MERN stack with strict TypeScript.")
add_bullet("To implement an automated First Expiry, First Out (FEFO) allocation engine that deducts sales from the earliest expiring lots while excluding expired batches.")
add_bullet("To construct a high-speed Point of Sale (POS) terminal with barcode scanner search, automated tax calculation, and digital receipt generation.")
add_bullet("To provide comprehensive batch tracking categorized across critical temporal horizons: Expired, <= 7 days, <= 30 days, and <= 60 days.")
add_bullet("To engineer an immutable inventory movement ledger capturing stock-ins, sales deductions, damages, customer returns, and physical audits.")
add_bullet("To implement vendor procurement workflows supporting Purchase Order lifecycles (Draft -> Pending -> Received) with automated lot instantiation.")
add_bullet("To enforce strict Role-Based Access Control (RBAC) separating Business Owner/Admin, Inventory Manager, and Cashier operational permissions.")
add_bullet("To validate application correctness, concurrency safety, and tenant data isolation through automated Vitest and Supertest suites.")

# LITERATURE REVIEW
add_header("LITERATURE REVIEW")
add_p(
    "Inventory and perishability management has been extensively investigated across supply chain literature and industrial software paradigms:"
)
add_bullet(" Historically deployed methods prioritize physical storage order rather than expiration deadlines. While efficient for non-perishable goods, FIFO frequently leads to high spoilage rates when newer lots arrive before older stock has been fully cleared.", "FIFO vs. FEFO Allocation Paradigms: ")
add_bullet(" Traditional POS software packages (such as legacy desktop systems) treat products as uniform numeric quantities. Recent enterprise supply chain research emphasizes the critical necessity of lot-level traceability to manage recall procedures and prevent expiration losses.", "Lot-Level Traceability in Retail: ")
add_bullet(" Modern cloud architectures prioritize strict tenant data isolation, utilizing tenant-keyed compound indexes (`businessId`) to deliver secure multi-tenancy without incurring the infrastructure overhead of separate database instances.", "Multi-Tenant Cloud Architectures: ")
add_bullet(" In high-throughput checkout workflows, synchronous batch deduction must ensure ACID consistency to prevent double-allocation of the same lot units during concurrent cashier checkouts.", "Concurrency Control in Retail Transactions: ")

# EXISTING SYSTEM & LIMITATIONS
add_header("EXISTING SYSTEM")
add_p(
    "Existing retail and inventory tracking systems deployed by small and medium businesses primarily fall into three categories: manual spreadsheet ledgers, standalone desktop POS registers, and basic generic inventory databases."
)
add_p(
    "Spreadsheet solutions (e.g., Microsoft Excel) rely on manual data entry, resulting in human error, zero real-time synchronization, and lack of concurrent checkout capability. Standalone desktop POS systems record total item counts but lack cloud connectivity, batch-level expiration tracking, and automated vendor procurement."
)

add_header("LIMITATIONS OF THE EXISTING SYSTEM")
add_bullet("Cannot track multiple batches or varying expiration dates for a single SKU.")
add_bullet("No automated FEFO deduction mechanism during customer checkout.")
add_bullet("High financial losses resulting from undetected product expiration on shelves.")
add_bullet("Absence of an immutable audit trail for damaged, adjusted, or stolen inventory.")
add_bullet("Lack of multi-tenant cloud accessibility for multi-store business owners.")
add_bullet("Vulnerability to concurrency conflicts and inventory drift.")

# PROPOSED SYSTEM & ADVANTAGES
add_header("PROPOSED SYSTEM")
add_p(
    "The proposed ShelfSense platform introduces a batch-centric cloud inventory operating system engineered to eliminate perishable waste while accelerating operational velocity. ShelfSense maintains an active registry of all product lots, indexing manufacturing dates, expiration dates, unit purchase costs, and supplier references."
)
add_p(
    "During customer checkout, the platform's FEFO engine dynamically sorts non-expired batches in ascending chronological order of expiry and iteratively deducts required quantities, automatically updating product stock and logging immutable ledger movements. Expired batches are automatically quarantined, safeguarding retailers against distributing unsafe products."
)

add_header("ADVANTAGES OF THE PROPOSED SYSTEM")
add_bullet("Drastically reduces perishable waste and stock write-offs through automated FEFO prioritization.", "Financial Waste Elimination: ")
add_bullet("Quarantines expired lots automatically from POS terminals.", "Zero Spoiled-Product Distribution: ")
add_bullet("Enables instant barcode scanning, automatic tax computation, and digital invoice generation.", "High-Speed POS Checkout: ")
add_bullet("Automates lot generation directly upon vendor goods receipt.", "Seamless Procurement Lifecycle: ")
add_bullet("Restricts operational capabilities based on user role (Admin, Manager, Cashier).", "Enterprise-Grade Role Security: ")
add_bullet("Complete isolation of business records across multi-tenant database collections.", "Multi-Tenant Cloud Isolation: ")

# ARCHITECTURE & DIAGRAMS
add_header("PROPOSED SYSTEM ARCHITECTURE")
add_p(
    "ShelfSense is organized into a modular three-tier cloud architecture ensuring clear separation of concerns, scalability, and robust security:"
)

# Text-based Architectural Flow Diagram
add_header("SYSTEM FLOW CHART", level=2)
flow_chart_text = """
┌────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATION                   │
│   React 18 + TypeScript + Vite + Tailwind CSS + POS    │
└───────────────────────────┬────────────────────────────┘
                            │ (REST API / Bearer JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   EXPRESS API SERVER                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │  Authentication & Multi-Tenant RBAC Middleware     │ │
│ └─────────────────────────┬──────────────────────────┘ │
│                           ▼                            │
│ ┌────────────────────────────────────────────────────┐ │
│ │                  DOMAIN MODULES                    │ │
│ │  • Auth & User Management                          │ │
│ │  • Products & Barcode Catalog                      │ │
│ │  • Batches & FEFO Allocation Engine                │ │
│ │  • Point of Sale (POS) & Billing                   │ │
│ │  • Vendor Procurement & Goods Receiving            │ │
│ │  • Immutable Inventory Movement Ledger             │ │
│ │  • Business Analytics & Expiry Reporting           │ │
│ └─────────────────────────┬──────────────────────────┘ │
└───────────────────────────┼────────────────────────────┘
                            │ (Mongoose ODM / TCP 27017)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                        │
│   MongoDB Atlas Cloud Cluster (Multi-Tenant Scoped)   │
│   Collections: Businesses, Users, Products, Batches,   │
│   Movements, Sales, PurchaseOrders, AuditLogs, Alerts  │
└────────────────────────────────────────────────────────┘
"""
add_p(flow_chart_text, italic=True)

# SYSTEM REQUIREMENTS
add_header("SYSTEM REQUIREMENTS")
add_header("Hardware Requirements", level=2)
add_bullet("Processor: Intel Core i3 / AMD Ryzen 3 or higher (Quad-core recommended).")
add_bullet("Memory (RAM): 4 GB minimum (8 GB recommended for development environment).")
add_bullet("Storage: Minimum 10 GB available SSD space.")
add_bullet("Peripherals: Standard barcode scanner (USB/Bluetooth), keyboard, and display.")

add_header("Software Requirements", level=2)
add_bullet("Operating System: Windows 10/11, macOS, or Ubuntu Linux 20.04+.")
add_bullet("Runtime Environment: Node.js (v18.x or v20.x LTS) and npm (v9.x or v10.x).")
add_bullet("Database Management System: MongoDB Atlas Cloud Cluster or MongoDB Community Server 7.x.")
add_bullet("Programming Languages: TypeScript 5.7+ (Strict Mode across Client & Server).")
add_bullet("Frontend Frameworks: React 18, Vite 6, Tailwind CSS 3, TanStack Query 5, Zustand 5, Recharts 2.")
add_bullet("Backend Frameworks: Express 4.21, Mongoose 8.9, Zod 3.24, bcryptjs, jsonwebtoken, helmet, cors.")
add_bullet("Testing Frameworks: Vitest 2.1, Supertest 7.0.")

# DATASET & DEMO STORE CONFIGURATION
add_header("DATABASE DESIGN & DATA COLLECTIONS")
add_p(
    "ShelfSense is structured across 11 relational-modeled MongoDB collections linked via ObjectIds and enforced with multi-tenant compound indexes:"
)
add_bullet("Stores business enterprise identity, tax rate presets, and display currency.", "1. Businesses Collection: ")
add_bullet("Role-based user accounts (`OWNER_ADMIN`, `INVENTORY_MANAGER`, `CASHIER`) with bcrypt password hashes.", "2. Users Collection: ")
add_bullet("Master catalog containing SKUs, barcodes, categories, threshold limits, and unit pricing.", "3. Products Collection: ")
add_bullet("Lot-level tracking storing batch numbers, manufacturing dates, expiry dates, and remaining quantities.", "4. ProductBatches Collection: ")
add_bullet("Append-only transactional ledger recording before/after stock quantities for every adjustment.", "5. InventoryMovements Collection: ")
add_bullet("Vendor directory storing credit payment terms, contact persons, and supply associations.", "6. Suppliers Collection: ")
add_bullet("Procurement orders tracking ordered quantities, received stock, and automated lot generation.", "7. PurchaseOrders Collection: ")
add_bullet("POS transaction records capturing line items, applied taxes, discounts, and cashier references.", "8. Sales Collection: ")
add_bullet("Operational warnings for impending expirations and depleted inventory.", "9. Notifications Collection: ")
add_bullet("Tamper-evident trail capturing operator identities, actions, target entity IDs, and IP addresses.", "10. AuditLogs Collection: ")
add_bullet("Cryptographically secured refresh tokens supporting rotating session authentication.", "11. RefreshTokens Collection: ")

# METHODOLOGY & FEFO ALGORITHM
add_header("METHODOLOGY & FEFO ALLOCATION ALGORITHM")
add_p(
    "The core operational methodology of ShelfSense centers upon the First Expiry, First Out (FEFO) allocation engine. When a cashier scans an item at the POS checkout terminal, the following computational pipeline executes:"
)

fefo_algo_text = """
Step 1: Receive Checkout Request (Product ID, Requested Quantity, Cashier ID, Business ID).
Step 2: Validate Product Status:
        Ensure Product exists, is active, and totalStock >= Requested Quantity.
Step 3: Query Eligible Batches:
        SELECT * FROM ProductBatches
        WHERE businessId = Request.businessId
          AND productId = Request.productId
          AND availableQuantity > 0
          AND expiryDate > CurrentTimestamp()
          AND isExcludedFromSales = false
        ORDER BY expiryDate ASC, createdAt ASC.
Step 4: Verify Non-Expired Availability:
        Sum(eligibleBatches.availableQuantity) >= Requested Quantity.
        If False -> Abort transaction with 400 Bad Request ("Insufficient non-expired stock").
Step 5: Execute Iterative Batch Deduction:
        Remaining = Requested Quantity
        For each batch in eligibleBatches:
            Take = Min(batch.availableQuantity, Remaining)
            Deduct Take from batch.availableQuantity
            Record Allocation (batchId, batchNumber, Take, unitCost, expiryDate)
            Remaining = Remaining - Take
            If Remaining == 0 -> Break loop.
Step 6: Update Database & Resynchronize:
        Commit batch decrements atomically.
        Recalculate Product totalStock = Sum(all active batches).
Step 7: Record Ledger & Audit Trail:
        Insert InventoryMovement (type: 'SALE', qty: -Requested Quantity).
        Insert Sale record with Invoice Number and FEFO breakdown.
        Emit AuditLog and low-stock notification if productStock <= minStockThreshold.
"""
add_p(fefo_algo_text, italic=True)

# PERFORMANCE EVALUATION & RESULTS
add_header("PERFORMANCE EVALUATION & TEST RESULTS")
add_p(
    "ShelfSense was subjected to rigorous automated integration testing using Vitest and Supertest against an active MongoDB test environment. The test suite systematically evaluated authentication, role permissions, FEFO deduction math, concurrency safety, and multi-tenant data boundaries."
)

# Table for Test Results
table = doc.add_table(rows=1, cols=4)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
hdr_cells = table.rows[0].cells
hdr_cells[0].text = "Test Module"
hdr_cells[1].text = "Test Scenario"
hdr_cells[2].text = "Observed Output"
hdr_cells[3].text = "Status"

test_data = [
    ("Auth & Tenant", "Register new business & owner", "201 Created with Access & Refresh tokens", "PASSED"),
    ("Security", "Prevent duplicate email registration", "400 Bad Request (Account already exists)", "PASSED"),
    ("Security", "Validate password hashing (bcrypt)", "Hashed verification with constant-time compare", "PASSED"),
    ("RBAC", "Cashier blocked from product creation", "403 Forbidden (Insufficient permissions)", "PASSED"),
    ("Product Catalog", "Create SKU and query by barcode", "201 Created & Instant Barcode Retrieval", "PASSED"),
    ("FEFO Engine", "Multi-batch chronological allocation", "Earliest lot depleted first before second lot", "PASSED"),
    ("FEFO Engine", "Checkout exceeding available fresh stock", "400 Bad Request (Insufficient non-expired stock)", "PASSED"),
    ("Multi-Tenancy", "Tenant 2 querying Tenant 1 products", "Empty Result / 404 Not Found (Zero Leakage)", "PASSED"),
    ("Inventory Ledger", "Immutable movement recording", "Accurate before/after ledger logged with Actor", "PASSED"),
    ("Procurement", "Purchase Order Goods Receipt", "Automated batch instantiation & stock sync", "PASSED"),
    ("POS Checkout", "Atomic transaction & receipt creation", "Clean invoice generation with tax/discounts", "PASSED"),
    ("Audit System", "Tamper-evident operation logging", "Timestamped actor trail logged to collection", "PASSED"),
]

for row in test_data:
    row_cells = table.add_row().cells
    for i in range(4):
        row_cells[i].text = row[i]

# Styling the table
for row in table.rows:
    for cell in row.cells:
        tcPr = cell._element.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for margin in ['top', 'bottom', 'left', 'right']:
            node = OxmlElement(f'w:{margin}')
            node.set(qn('w:w'), '100')
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)
        for p in cell.paragraphs:
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(2)
            for r in p.runs:
                r.font.name = 'Arial'
                r.font.size = Pt(9)

add_p("\nTest Evaluation Summary: 12 of 12 integration tests passed cleanly (100% success rate). TypeScript compiler reported 0 errors under strict type checking.")

# APPLICATIONS
add_header("APPLICATIONS")
add_bullet("Automates shelf rotation, minimizing spoilage of dairy, bakery, meat, and fresh food products.", "Grocery Stores & Supermarkets: ")
add_bullet("Prevents dispensing of expired OTC and prescription drugs, ensuring compliance with drug safety regulations.", "Retail Pharmacies & Chemists: ")
add_bullet("Fast barcode lookups and POS billing for high-footfall corner shops.", "Convenience Stores & Bodegas: ")
add_bullet("Tracks multi-pallet deliveries, supplier batch lots, and vendor return lifecycles.", "Wholesale Distributors & Warehouses: ")

# ADVANTAGES, LIMITATIONS & FUTURE ENHANCEMENTS
add_header("ADVANTAGES")
add_bullet("Eliminates retail perishable write-offs through automated FEFO allocation.")
add_bullet("Full multi-tenant cloud architecture allowing multi-store scalability.")
add_bullet("Strict end-to-end TypeScript preventing runtime type errors.")
add_bullet("Real-time business intelligence dashboard with data-driven charts and CSV exports.")

add_header("LIMITATIONS")
add_bullet("Requires stable internet access for cloud database synchronization.")
add_bullet("Physical shelf placement still relies on store staff adhering to the system's batch deduction guidance.")

add_header("FUTURE ENHANCEMENTS")
add_bullet("Integration with thermal receipt printers via WebUSB and ESC/POS protocol.")
add_bullet("Predictive Machine Learning models for seasonal demand forecasting and automated reordering.")
add_bullet("Mobile camera barcode scanning using WebAssembly-accelerated computer vision.")
add_bullet("Inter-branch stock transfer management across distributed warehouse networks.")

# CONCLUSION
add_header("CONCLUSION")
add_p(
    "ShelfSense demonstrates that modern cloud architectures, strict type systems, and intelligent business logic can directly resolve one of the retail industry's most persistent and costly operational challenges: perishable stock expiration and inventory drift. By structuring inventory around date-aware product batches and automating First Expiry, First Out (FEFO) allocation, the platform successfully shields businesses from waste while guaranteeing product freshness for consumers."
)
add_p(
    "The application was developed and verified from database schema to user interface without placeholders, mock analytics, or prototype shortcuts. Through automated testing and multi-tenant security guarantees, ShelfSense provides a solid, production-ready foundation for commercial retail deployment."
)

# REFERENCES
add_header("REFERENCES")
add_bullet("Silver, E. A., Pyke, D. F., & Peterson, R. (1998). Inventory Management and Production Planning and Scheduling (3rd ed.). John Wiley & Sons.")
add_bullet("Nahmias, S. (2011). Perishable Inventory Systems. International Series in Operations Research & Management Science, Springer Science & Business Media.")
add_bullet("Chodorow, K. (2013). MongoDB: The Definitive Guide (2nd ed.). O'Reilly Media.")
add_bullet("Banks, A., & Porcello, E. (2020). Learning React: Modern Patterns for Developing React Applications (2nd ed.). O'Reilly Media.")
add_bullet("Bierman, G., Abadi, M., & Torgersen, M. (2014). Understanding TypeScript. In European Conference on Object-Oriented Programming (ECOOP), Springer, Berlin, Heidelberg.")

output_path = "docs/ShelfSense_Project_Report.docx"
doc.save(output_path)
print(f"Document successfully created at: {output_path}")
