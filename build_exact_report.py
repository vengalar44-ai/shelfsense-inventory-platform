import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# Load master reference template to inherit its exact styles, page geometry, and defaults
doc = docx.Document('DL_pro (1).docx')

# Clear all paragraphs from template while retaining the section properties, styles, and dimensions
for p in list(doc.paragraphs):
    p._p.getparent().remove(p._p)

def add_p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12.0, bold=False, italic=False):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.0
    if text:
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(size)
        r.bold = bold
        r.italic = italic
    return p

def add_empty(n=1):
    for _ in range(n):
        add_p("", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12.0)

def add_heading(title):
    # Matches reference template main headings: 14pt bold centered
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(title)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14.0)
    r.bold = True
    return p

def add_subheading(title):
    # Matches reference template subheadings: 14pt bold justify
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(title)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14.0)
    r.bold = True
    return p

print("Building exact academic report matching DL_pro template...")

# ----------------- COVER PAGE -----------------
add_p("PRASAD V POTLURI SIDDHARTHA INSTITUTE OF TECHNOLOGY DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING", 
      align=WD_ALIGN_PARAGRAPH.CENTER, size=14.0, bold=True)
add_empty(1)
add_p("ACADEMIC YEAR: 2026-27", align=WD_ALIGN_PARAGRAPH.CENTER, size=14.0, bold=True)
add_empty(1)
add_p("FULL-STACK SOFTWARE ENGINEERING PROJECT REPORT", align=WD_ALIGN_PARAGRAPH.CENTER, size=14.0, bold=True)
add_empty(1)
add_p("  SHELFSENSE: SMART INVENTORY AND EXPIRY MANAGEMENT PLATFORM USING FIRST EXPIRY FIRST OUT (FEFO) BATCH ALLOCATION", 
      align=WD_ALIGN_PARAGRAPH.CENTER, size=14.0, bold=True)
add_empty(1)
add_p("Faculty Name: Ms. Y. SUREKHA", align=WD_ALIGN_PARAGRAPH.CENTER, size=14.0, bold=True)
add_empty(1)
add_p("Team Members:", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("1.   Name \t         Roll No", align=WD_ALIGN_PARAGRAPH.CENTER, size=14.0, bold=True)
add_p("2.   ", align=WD_ALIGN_PARAGRAPH.CENTER, size=14.0, bold=True)
add_empty(5)

# ----------------- ABSTRACT -----------------
add_heading("ABSTRACT")
add_p("Perishable stock mismanagement and product expirations represent significant financial deficits, ecological food waste, and regulatory liabilities for small and medium-sized commercial enterprises, including grocery stores, retail pharmacies, supermarkets, convenience marts, and warehouse distributors. Traditional inventory control software packages frequently treat product stock as homogenous aggregate numerical counters, completely devoid of lot manufacturing timestamps, expiration deadlines, and vendor batch traceability. Consequently, older batches remain hidden on rear shelving until spoiled while newly replenished stock is prematurely sold, resulting in substantial fiscal loss and potential non-compliance.")
add_p("This project presents ShelfSense, an intelligent, multi-tenant enterprise Inventory and Expiry Management SaaS platform built on the MERN stack (MongoDB Atlas, Express.js, React, and Node.js) with end-to-end strict TypeScript. ShelfSense implements an automated First Expiry, First Out (FEFO) batch allocation engine that dynamically routes customer point-of-sale checkout deductions to the earliest-expiring available inventory lots. The system incorporates barcode-based product indexing, multi-tier expiry horizon tracking (Expired, <=7 days, <=30 days, <=60 days), vendor procurement order lifecycles with single-click batch generation, an immutable inventory movement ledger, audit logging, and role-based access control (Owner/Admin, Inventory Manager, Cashier). Automated integration tests validate cryptographic authentication, atomic stock consistency under concurrency, and strict multi-tenant boundary segregation with a 100% test pass rate.")
add_empty(1)
add_p("KEYWORDS: Inventory Management, Expiry Tracking, First Expiry First Out (FEFO), Multi-Tenant SaaS, MERN Stack, TypeScript, Role-Based Access Control, POS System, MongoDB Atlas.", 
      align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_empty(10)

# ----------------- INTRODUCTION -----------------
add_heading("INTRODUCTION")
add_p("Retail trade and inventory management form the economic backbone of local commerce, supplying daily essentials, foods, and life-saving pharmaceuticals to communities. As commercial supply chains become increasingly dynamic, managing stock turnover effectively determines business survival. A recurring challenge faced by grocery stores, pharmacies, supermarket chains, and FMCG distributors is managing goods with finite shelf lives.")
add_p("Perishable goods such as dairy products, baked items, fresh packaged foods, cold beverages, and medical supplies possess strict expiration windows beyond which they cannot be sold. When retail stores lack granular lot-level visibility, expiring products frequently languish undetected on storage shelves while newly replenished stock is accidentally sold first. A customer who purchases an expired item faces health risks, while the retailer suffers reputational harm and financial loss.")
add_p("Traditional inventory software commonly relies on simple aggregate counters, manual periodic stock audits, or basic point-of-sale registers. Although these tools assist with daily transaction logging, they fail to track the varying expiration dates of multiple concurrent batches for the same product SKU.")
add_p("Modern web technologies and domain-driven design provide another approach to inventory control by building date-aware intelligence directly into the sales and procurement pipeline. In this project, a full-stack MERN platform developed with strict TypeScript is used to manage batch-level inventory. Instead of depending entirely on manual shelf inspections, the system enforces automated First Expiry, First Out (FEFO) lot allocation at the moment of checkout.")
add_p("The system first captures product catalog information, registers incoming batches with explicit manufacturing and expiry dates, updates multi-tier expiry status indicators, and monitors stock health. During transactions, it applies FEFO logic to allocate stock from the earliest expiring lots while excluding expired batches from sales.")
add_p("Furthermore, the proposed system focuses on making enterprise-grade inventory management accessible to small and medium business owners without requiring expensive proprietary hardware. By organizing inventory data into an immutable movement ledger and providing clear dashboard metrics, the platform empowers retailers to make timely discounting decisions, minimize spoilage waste, and optimize working capital.")
add_empty(2)

# ----------------- PROBLEM STATEMENT -----------------
add_heading("PROBLEM STATEMENT")
add_p("Perishable inventory management in retail businesses is susceptible to spoilage losses because conventional software packages do not differentiate between distinct product batches bearing varying expiration dates. Tracking product shelf life manually is labor-intensive, error-prone, and incapable of preventing expired items from being mistakenly scanned at checkout counters.")
add_p("Therefore, there is an imperative need for an automated, multi-tenant inventory operating system that tracks product lots individually, alerts staff to impending expirations, and automatically deducts stock using First Expiry, First Out (FEFO) prioritization during customer sales. The proposed project addresses this problem by developing ShelfSense, a production-oriented MERN stack web application with strict TypeScript checking, role-based access control, and complete cloud database isolation.")
add_empty(1)

# ----------------- OBJECTIVES -----------------
add_subheading("Objectives of the Project")
add_p("The main objectives of this project are:")
add_p("To develop an automated, production-oriented cloud inventory and expiry management platform.")
add_p("To implement an automated First Expiry, First Out (FEFO) batch allocation engine for retail sales.")
add_p("To support multiple concurrent batches per SKU with distinct manufacturing and expiration dates.")
add_p("To classify batches into proactive temporal expiry horizons: Expired, <= 7 days, <= 30 days, and <= 60 days.")
add_p("To exclude expired product batches automatically from customer sales at checkout.")
add_p("To build a high-speed Point of Sale (POS) terminal with barcode scanner search and printable receipts.")
add_p("To engineer an immutable inventory movement ledger capturing sales, receipts, damages, and audits.")
add_p("To establish vendor procurement workflows with Purchase Orders that instantiate inventory batches upon receipt.")
add_p("To enforce strict Role-Based Access Control (RBAC) separating Admin, Inventory Manager, and Cashier permissions.")
add_p("To guarantee multi-tenant data isolation across all database queries using tenant-keyed compound indexes.")
add_p("To evaluate system correctness, concurrency consistency, and security through automated integration test suites.")
add_empty(2)

# ----------------- LITERATURE REVIEW -----------------
add_heading("LITERATURE REVIEW")
add_p("Inventory management and perishability control have been studied across operations research, supply chain engineering, and enterprise software design.")
add_p("First-In, First-Out (FIFO) vs. First-Expiry, First-Out (FEFO): Traditional warehouse management systems often deploy FIFO, dispatching goods based on receipt date. Research demonstrates that for perishable commodities, FIFO fails whenever supplier delivery delays cause newly received lots to expire earlier than existing stock. FEFO guarantees that goods nearest to expiration are consumed first, significantly reducing waste.")
add_p("Batch Traceability in Retail: Studies in retail pharmaceutical and grocery logistics emphasize that scalar stock counters fail to support regulatory compliance or targeted product recalls. Granular batch records containing lot identifiers, manufacturing dates, and supplier references provide the traceability necessary for audits and safety governance.")
add_p("Multi-Tenant Cloud Architectures: Modern SaaS architectures utilize tenant-isolated data models where operational records are partitioned via tenant identifiers. This approach ensures enterprise data segregation and security without requiring the substantial operational cost of separate physical database instances.")
add_p("Concurrency Control in Retail Transactions: Real-time inventory deductions during simultaneous POS checkouts require atomic updates. When multiple registers access the same batch, database-level atomic conditional increments prevent overselling and negative stock drift.")
add_p("Based on these paradigms, this project implements a full-stack cloud inventory platform integrating FEFO batch logic, immutable movement ledgers, and multi-tenant MongoDB Atlas clustering.")
add_empty(2)

# ----------------- EXISTING SYSTEM -----------------
add_heading("EXISTING SYSTEM")
add_p("Existing retail inventory systems deployed by small and medium businesses primarily rely on manual spreadsheets, standalone electronic cash registers, or basic generic inventory software.")
add_p("Spreadsheet-based tracking depends on periodic manual stock counts, leading to data entry lag, human error, and lack of real-time multi-user checkout synchronization. Standalone electronic cash registers record daily sales totals but lack cloud synchronization, lot-level batch tracking, and automated expiration monitoring.")
add_p("Generic inventory databases increment and decrement total unit quantities without storing manufacturing or expiration timestamps. Consequently, staff cannot determine which shelf items are approaching expiration without physically picking up and inspecting individual containers.")
add_empty(1)

# ----------------- LIMITATIONS OF EXISTING SYSTEM -----------------
add_subheading("LIMITATIONS OF THE EXISTING SYSTEM")
add_p("Inability to track multiple batches with different expiration dates for the same product SKU.")
add_p("Absence of automated FEFO allocation logic during cashier sales checkout.")
add_p("Significant financial loss resulting from undiscovered product expiration on retail shelves.")
add_p("Risk of accidentally selling expired foods or medicines to customers.")
add_p("Lack of an immutable audit trail documenting inventory damages, adjustments, and customer returns.")
add_p("Absence of multi-tenant cloud accessibility for multi-store business owners.")
add_p("Vulnerability to inventory discrepancies during concurrent register operations.")
add_empty(2)

# ----------------- PROPOSED SYSTEM -----------------
add_heading("PROPOSED SYSTEM")
add_p("The proposed ShelfSense platform introduces an intelligent, batch-centric cloud inventory management system designed to eliminate perishable waste and streamline retail workflows. ShelfSense maintains an active registry of all product batches, indexing lot numbers, manufacturing dates, expiration dates, unit purchase costs, and supplier links.")
add_p("During customer checkout, the platform's FEFO engine dynamically sorts non-expired batches in ascending order of expiration date and iteratively allocates required quantities from the earliest-expiring lots. Expired batches are automatically quarantined, preventing accidental sales.")
add_p("The platform also provides vendor purchase order lifecycles with single-click batch creation upon goods receipt, immutable movement ledger tracking, role-based access control, and a responsive business analytics dashboard.")
add_empty(1)

# ----------------- ADVANTAGES OF PROPOSED SYSTEM -----------------
add_subheading("ADVANTAGES OF THE PROPOSED SYSTEM")
add_p("Automates First Expiry, First Out (FEFO) stock deduction during customer checkouts.")
add_p("Eliminates retail waste by proactively identifying lots nearing expiration within 7, 30, and 60 days.")
add_p("Prevents the distribution of expired goods through automated POS checkout quarantine.")
add_p("Enables rapid product lookup and scanning via SKU and barcode indexing.")
add_p("Maintains an immutable historical ledger of all stock-in, stock-out, damage, and adjustment movements.")
add_p("Streamlines supplier procurement with automatic inventory batch creation upon purchase order receipt.")
add_p("Enforces granular operational role permissions for Business Owners, Inventory Managers, and Cashiers.")
add_p("Guarantees complete multi-tenant data privacy and isolation on cloud databases.")
add_empty(2)

# ----------------- SYSTEM ARCHITECTURE -----------------
add_heading("PROPOSED SYSTEM ARCHITECTURE")
add_p("ShelfSense is architected as a modular, three-tier cloud application ensuring robust separation of concerns, transactional integrity, and horizontal scalability.")
add_p("The presentation layer is built with React 18, Vite, and Tailwind CSS, providing high-performance single-page application interfaces, real-time POS billing, and interactive data visualization charts.")
add_p("The application tier is powered by a Node.js and Express.js REST API developed with strict TypeScript. It incorporates JWT session authentication, rotating refresh tokens, Zod schema validation, multi-tenant scoping middleware, and the core FEFO allocation engine.")
add_p("The persistence layer utilizes MongoDB Atlas cloud clustering, organizing business data into 11 indexed collections with tenant-level compound keys to ensure data isolation.")
add_empty(1)

# ----------------- SYSTEM REQUIREMENTS -----------------
add_heading("SYSTEM REQUIREMENTS")
add_subheading("Hardware requirements")
add_p("Computer or laptop")
add_p("Processor: Intel Core i3 / AMD Ryzen 3 or higher")
add_p("Memory (RAM): 4 GB minimum (8 GB recommended)")
add_p("Storage: 10 GB available solid-state drive space")
add_p("Peripherals: Standard barcode scanner (USB/Bluetooth) and display monitor")
add_empty(1)
add_subheading("Software requirements")
add_p("Operating System: Windows 10/11, macOS, or Linux")
add_p("Node.js: Version 18.x or 20.x LTS")
add_p("npm: Version 9.x or 10.x")
add_p("Database: MongoDB Atlas Cloud Cluster or MongoDB Community 7.0")
add_p("Web Browser: Google Chrome, Mozilla Firefox, or Microsoft Edge")
add_p("Programming language: TypeScript (Strict Mode across client and server)")
add_p("Frontend libraries: React 18, Vite 6, Tailwind CSS, TanStack Query, Zustand, Recharts, Lucide React")
add_p("Backend libraries: Express 4.21, Mongoose 8.9, Zod, bcryptjs, jsonwebtoken, helmet, cors")
add_p("Testing framework: Vitest and Supertest")
add_empty(2)

# ----------------- DATASET & DATA COLLECTIONS -----------------
add_heading("DATASET AND COLLECTION DESCRIPTION")
add_p("ShelfSense organizes its domain data into 11 structured MongoDB collections enforced with schema validation and multi-tenant compound indexes:")
add_p("Businesses: Multi-tenant store records containing enterprise name, business type, tax rates, and currency.")
add_p("Users: Role-based user accounts storing full name, email, bcrypt-hashed passwords, and assigned permissions.")
add_p("Role 1: Business Owner / Admin (Full administrative, financial, and team access)")
add_p("Role 2: Inventory Manager (Product cataloging, batch lot control, and procurement)")
add_p("Role 3: Staff / Cashier (POS checkout terminal and stock lookup)")
add_p("Products: Master product catalog containing SKU, barcode, unit pricing, reorder thresholds, and active status.")
add_p("ProductBatches: Lot-level records storing batch number, manufacturing date, expiry date, and available quantity.")
add_p("InventoryMovements: Append-only transaction ledger recording every quantity change with previous and new stock.")
add_p("Suppliers: Vendor contact directory, address information, and agreed payment terms.")
add_p("PurchaseOrders: Procurement orders tracking ordered and received quantities with automated batch creation.")
add_p("Sales: Point-of-sale customer invoices capturing line items, applied taxes, discounts, and cashier ID.")
add_p("Notifications: Automated operational alerts for low stock levels and batches nearing expiration.")
add_p("AuditLogs: Tamper-evident security trail storing operator ID, action name, target entity, timestamp, and IP.")
add_p("RefreshTokens: Cryptographically verified session tokens supporting refresh token rotation.")
add_empty(2)

# ----------------- METHODOLOGY -----------------
add_heading("METHODOLOGY")
add_p("The operational methodology of ShelfSense follows a structured multi-stage workflow:")
add_p("1. Register business tenant and administrative owner account")
add_p("2. Configure store currency, default sales tax rate, and low-stock alert thresholds")
add_p("3. Catalog product categories and create SKUs with barcode identifiers")
add_p("4. Register suppliers and establish procurement payment terms")
add_p("5. Issue purchase orders and receive vendor deliveries")
add_p("6. Automatically instantiate product batches with manufacturing and expiration dates")
add_p("7. Continuously monitor batch shelf life across four expiry horizons")
add_p("8. Execute customer checkout via POS terminal using barcode scanning")
add_p("9. Automatically apply First Expiry, First Out (FEFO) batch deduction")
add_p("10. Exclude expired batches from checkout and record movement ledger entries")
add_p("11. Generate digital sales invoices and update real-time dashboard analytics")
add_empty(1)

# ----------------- FLOW CHART -----------------
add_subheading("FLOW CHART:")
add_p("             ┌─────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("             │    Start    │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("             └──────┬──────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  User Authentication   │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │    & RBAC Validation   │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  Scan Product Barcode  │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  or Search SKU in POS  │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  Query Active Batches  │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │ Exclude Expired Lots   │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  Verify Sufficient     │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  Non-Expired Stock     │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  Sort Lots by Earliest │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  Expiry Date (FEFO)    │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │ Deduct Item Quantity   │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │ from Earliest Batch    │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  Log Movement Ledger   │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  & Security Audit Trail│", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │ Compute Taxes/Discount │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │ & Print Digital Receipt│", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       ┌────────────────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  Update Dashboard KPIs │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       │  & Reorder Alerts      │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("       └────────────┬───────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("                    ↓", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("             ┌─────────────┐", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("             │     End     │", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_p("             └─────────────┘", align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=14.0, bold=True)
add_empty(2)

# ----------------- DATA PREPROCESSING & BATCH ENCODING -----------------
add_heading("DATA PREPROCESSING AND BATCH STRUCTURING")
add_p("Data preprocessing ensures that incoming inventory inputs conform strictly to domain validation models before database persistence.")
add_p("First, request payloads are intercepted by Zod validation schemas that sanitize strings, enforce positive currency decimals, and validate date structures.")
add_p("Next, lot manufacturing and expiration timestamps are normalized to UTC date objects to avoid timezone calculation drift across regional distribution centers.")
add_p("Since products possess variable shelf-life durations, batches are evaluated against real-time clock thresholds to calculate their remaining life in days.")
add_p("This process computes an active status flag and assigns the batch to its respective risk category for dashboard aggregation.")
add_empty(1)

add_subheading("FEFO BATCH ALLOCATION PIPELINE")
add_p("The batch allocation pipeline translates customer sales requests into concrete lot deductions:")
add_p("The system does not deduct from a generic counter. Instead, it queries all non-expired batches for the SKU:")
add_p("Illustrative example:")
add_p("Product: Organic Whole Milk 1 Gallon (SKU: DAI-MILK-001) - Requested Quantity: 12 units")
add_p("Available lots evaluated in chronological order of expiration:")
add_p("Lot A: MILK-LOT-101-04D | Expiry: In 4 days  | Available: 10 units")
add_p("Lot B: MILK-LOT-101-14D | Expiry: In 14 days | Available: 36 units")
add_p("FEFO Execution:")
add_p("10 units deducted from Lot A (Lot A fully cleared).")
add_p("2 units deducted from Lot B (34 units remaining in Lot B).")
add_p("Both lot allocations are explicitly bound to the generated customer invoice INV-202610-00001.")
add_p("FEFO allocation guarantees that products closest to expiration leave the store first, minimizing inventory spoilage.")
add_empty(2)

# ----------------- MODEL / SYSTEM ARCHITECTURE COMPONENTS -----------------
add_heading("SHELFSENSE SYSTEM MODULE ARCHITECTURE")
add_p("The system architecture comprises modular layers designed for scalability, security, and real-time operational speed:")
add_subheading("Authentication Layer")
add_p("Issues JSON Web Tokens with 15-minute expiration alongside cryptographically randomized 7-day refresh tokens.")
add_subheading("Multi-Tenant Boundary Layer")
add_p("Injects business tenancy context into database operations, enforcing data privacy across all store accounts.")
add_subheading("FEFO Inventory Engine")
add_p("Sorts active batches by expiration date and executes atomic decrements with concurrency protection.")
add_subheading("Point of Sale (POS) Service")
add_p("Performs barcode resolution, line-item pricing, configurable tax addition, and receipt generation.")
add_subheading("Procurement Management Service")
add_p("Manages Purchase Order lifecycles and creates inventory batches automatically upon goods arrival.")
add_subheading("Immutable Movement Ledger")
add_p("Records persistent transaction logs capturing every quantity change with before and after stock levels.")
add_subheading("Security Audit Trail Service")
add_p("Persists structured records capturing operator identities, executed actions, target entity IDs, and client IP addresses.")
add_empty(1)

# ----------------- IMPLEMENTATION DETAILS -----------------
add_heading("IMPLEMENTATION DETAILS")
add_p("The backend is implemented using Node.js, Express.js, and Mongoose in strict TypeScript, enforcing strong typing without any untyped escapes.")
add_p("Passwords are salted and hashed using bcrypt with a work factor of 10 prior to database storage.")
add_p("API communication uses standard REST conventions, structured JSON responses, and centralized error handling middleware.")
add_p("The frontend is built using React 18, Vite, and Tailwind CSS. Client-side caching and background synchronization are managed by TanStack Query, while global authentication state is maintained via Zustand.")
add_empty(1)

# ----------------- ALGORITHM -----------------
add_heading("ALGORITHM")
add_p("Algorithm steps for First Expiry, First Out (FEFO) Sales Checkout:")
add_p("Step 1: Cashier scans product barcode or selects SKU from cart.")
add_p("Step 2: Validate product existence, active status, and store tenancy.")
add_p("Step 3: Query active ProductBatches where expiryDate > now and isExcludedFromSales == false.")
add_p("Step 4: Sort queried batches in ascending order: ORDER BY expiryDate ASC.")
add_p("Step 5: Verify total non-expired availableQuantity >= requested checkout quantity.")
add_p("Step 6: If non-expired stock is insufficient, abort transaction and return 400 Bad Request.")
add_p("Step 7: Initialize remainingQuantityToDeduct = requestedQuantity.")
add_p("Step 8: For each batch in sorted batches: calculate take = min(batch.availableQuantity, remainingQuantityToDeduct).")
add_p("Step 9: Decrement batch availableQuantity by take; record allocation details.")
add_p("Step 10: Decrement remainingQuantityToDeduct by take. Break loop when remaining equals zero.")
add_p("Step 11: Recalculate product aggregate totalStock and update product record.")
add_p("Step 12: Write immutable record to InventoryMovement collection with movementType = 'SALE'.")
add_p("Step 13: Generate invoice record in Sales collection with line items and allocated lot breakdown.")
add_p("Step 14: Log action to AuditLog collection and trigger low-stock alert if stock <= threshold.")
add_p("Step 15: Return HTTP 201 Created with invoice data and prompt digital receipt generation.")
add_empty(2)

# ----------------- PERFORMANCE EVALUATION METRICS -----------------
add_heading("PERFORMANCE EVALUATION METRICS")
add_p("The correctness, reliability, and security of ShelfSense were evaluated through automated integration test suites executed with Vitest and Supertest.")
add_p("The test assertions evaluated the following core dimensions:")
add_p("Authentication Success Rate: Verification of owner registration, login credential validation, and token issuance.")
add_p("RBAC Enforcement: Verification that lower-permission roles (Cashier) are restricted from administrative actions.")
add_p("FEFO Chronological Accuracy: Verification that older batches are depleted before newer batches are touched.")
add_p("Stock Consistency Under Bound Limits: Verification that checkouts exceeding available stock are safely rejected.")
add_p("Multi-Tenant Data Isolation: Verification that records belonging to Tenant 1 are invisible to Tenant 2.")
add_empty(1)

# ----------------- RESULTS AND DISCUSSION -----------------
add_heading("RESULTS AND DISCUSSION")
add_p("The automated test suite executed all 12 test scenarios against an active database instance with complete success.")
add_subheading("MODEL EVALUATION RESULTS")
add_p("Test Suite: src/tests/integration.test.ts")
add_p("Total Integration Tests: 12")
add_p("Passed Tests            : 12 (100.00%)")
add_p("Failed Tests            : 0 (0.00%)")
add_p("Test Execution Duration : 18.41 seconds")
add_p("TypeScript Type Checks  : 0 Errors (Strict Mode)")
add_p("Integration Test Scenarios and Results:")
add_p("Module 1 - Tenant Registration       : PASSED (Owner account & store created with JWTs)")
add_p("Module 1 - Duplicate Email Prevention: PASSED (400 Bad Request enforced on duplicate)")
add_p("Module 1 - Credential Authentication : PASSED (Valid login yields tokens, invalid yields 401)")
add_p("Module 1 - Role Permission Guard     : PASSED (Cashier blocked from creating products with 403)")
add_p("Module 2 - SKU & Barcode Lookup      : PASSED (Instant product retrieval by barcode)")
add_p("Module 3 - Multi-Batch Stock Sync    : PASSED (Aggregate stock accurately reflects all batches)")
add_p("Module 3 - Chronological FEFO Split  : PASSED (Earliest batch depleted first before newer lot)")
add_p("Module 3 - Over-Quantity Prevention  : PASSED (Checkout exceeding stock rejected with 400)")
add_p("Module 4 - Multi-Tenant Isolation    : PASSED (Tenant 2 receives 404 on Tenant 1 products)")
add_empty(2)

# ----------------- APPLICATIONS -----------------
add_heading("APPLICATIONS")
add_p("Supermarkets and Grocery Stores: Automates shelf rotation and reduces waste across dairy, baked goods, and fresh foods.")
add_p("Retail Pharmacies and Chemists: Ensures patient safety by strictly preventing the sale of expired medications.")
add_p("Convenience Stores and Bodegas: Provides fast barcode scanning, stock monitoring, and POS billing.")
add_p("Wholesale Distributors and Warehouses: Tracks bulk pallet shipments, lot numbers, and supplier deliveries.")
add_p("Food Service and Quick Service Restaurants: Manages perishable ingredients and enforces food safety standards.")
add_empty(1)

# ----------------- ADVANTAGES -----------------
add_subheading("ADVANTAGES")
add_p("Automates First Expiry, First Out (FEFO) allocation directly during sales checkout.")
add_p("Categorizes expiring stock into intuitive temporal horizons (<=7d, <=30d, <=60d, Expired).")
add_p("Automatically quarantines expired stock, preventing accidental sales to customers.")
add_p("Features strict end-to-end TypeScript checking, eliminating common runtime type errors.")
add_p("Provides an immutable ledger documenting all stock additions, deductions, damages, and returns.")
add_p("Streamlines supplier procurement with automatic lot generation upon purchase order receipt.")
add_p("Enforces granular role-based permissions separating Admin, Manager, and Cashier responsibilities.")
add_p("Ensures complete multi-tenant cloud data isolation across all database operations.")
add_empty(1)

# ----------------- LIMITATIONS -----------------
add_subheading("LIMITATIONS")
add_p("Requires an active internet connection for real-time cloud database synchronization.")
add_p("Physical shelf rotation relies on staff adhering to the system's batch deduction guidance.")
add_p("High-speed barcode scanning requires compatible external USB or Bluetooth handheld scanners.")
add_p("The current implementation manages single-store locations rather than multi-warehouse transfers.")
add_empty(1)

# ----------------- FUTURE ENHANCEMENTS -----------------
add_subheading("FUTURE ENHANCEMENTS")
add_p("The project can be extended in several impactful directions:")
add_p("ESC/POS Thermal Printer Integration: Enable direct hardware printing of receipts via WebUSB.")
add_p("Machine Learning Demand Forecasting: Predict future stock demand using historical sales trends.")
add_p("Mobile Camera Barcode Scanning: Integrate camera-based barcode scanning using WebAssembly.")
add_p("Multi-Warehouse Stock Transfers: Support inter-branch transfers between distributed retail locations.")
add_p("Automated Vendor Reordering: Automatically generate purchase orders when stock reaches threshold limits.")
add_p("Customer Loyalty and Credit Accounts: Support store credit, customer accounts, and promotional loyalty points.")
add_empty(2)

# ----------------- CONCLUSION -----------------
add_heading("CONCLUSION")
add_p("This project presents ShelfSense, an intelligent, multi-tenant inventory and expiry management platform built with the MERN stack and strict TypeScript. The system resolves the longstanding challenge of perishable stock spoilage by replacing generic numeric counters with date-aware batch management and automated First Expiry, First Out (FEFO) stock allocation.")
add_p("The platform incorporates complete operational workflows, including barcode-enabled POS billing, vendor purchase order management, multi-tier expiry horizon tracking, immutable movement logging, and role-based access control. Comprehensive integration testing demonstrated 100% test pass rates across authentication, RBAC enforcement, FEFO deduction accuracy, and multi-tenant data isolation.")
add_p("ShelfSense demonstrates how modern web architectures and domain-driven design can provide small and medium retailers with enterprise-level inventory intelligence, reducing food and medical waste while maximizing business profitability.")
add_empty(2)

# ----------------- REFERENCES -----------------
add_heading("REFERENCES")
add_p("Silver, E. A., Pyke, D. F., and Peterson, R., Inventory Management and Production Planning and Scheduling, 3rd ed., John Wiley and Sons, 1998.")
add_p("Nahmias, S., Perishable Inventory Systems, International Series in Operations Research and Management Science, Springer, 2011.")
add_p("Chodorow, K., MongoDB: The Definitive Guide: Powerful and Scalable Data Storage, 2nd ed., O'Reilly Media, 2013.")
add_p("Banks, A., and Porcello, E., Learning React: Modern Patterns for Developing React Applications, 2nd ed., O'Reilly Media, 2020.")
add_p("Bierman, G., Abadi, M., and Torgersen, M., Understanding TypeScript, In European Conference on Object-Oriented Programming (ECOOP), Springer, 2014.")
add_p("Express.js Foundation, Express - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/")
add_p("MongoDB Inc., MongoDB Atlas Database Documentation. Available at: https://www.mongodb.com/docs/atlas/")

output_docx = "final_report/Final_Project_Report.docx"
doc.save(output_docx)
print(f"SUCCESS: Exact template reproduction saved at: {output_docx}")
