import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

def generate_flowchart():
    # Setup figure with academic proportions
    fig, ax = plt.subplots(figsize=(10, 16), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    # 12 Process Steps
    steps = [
        {"title": "Start", "subtitle": "System Initialized & Secure Session Opened", "type": "terminal"},
        {"title": "User Authentication & RBAC", "subtitle": "Verify JWT & Permissions (Owner / Manager / Cashier)", "type": "process"},
        {"title": "Ingest Supplier Shipments", "subtitle": "Record Products, Purchase Costs & Distinct Batch Dates", "type": "process"},
        {"title": "Evaluate Shelf-Life Intervals", "subtitle": "Compare Expiration Deadlines against Dynamic Store Thresholds", "type": "decision"},
        {"title": "Batch State Classification", "subtitle": "Tag Batches: ACTIVE, NEAR_EXPIRY, EXPIRED, or DEPLETED", "type": "process"},
        {"title": "Proactive Alert Dispatcher", "subtitle": "Push Low-Stock & Near-Expiry Alerts to Dashboard", "type": "process"},
        {"title": "Point-of-Sale (POS) Checkout", "subtitle": "Cashier Scans SKU / Barcode into Active Sales Order", "type": "process"},
        {"title": "FEFO Allocation Algorithm", "subtitle": "Query Active Batches Sorted Chronologically (expiryDate: ASC)", "type": "decision"},
        {"title": "Atomic Stock Depletion", "subtitle": "Deduct Requested Quantities from Earliest-Expiring Batches First", "type": "process"},
        {"title": "Invoice & Immutable Audit Log", "subtitle": "Generate Customer Receipt & Write Stock Movement Record", "type": "process"},
        {"title": "Live Analytics Dashboard", "subtitle": "Update Valuations, Turnover Velocity & Shrinkage Metrics", "type": "process"},
        {"title": "End", "subtitle": "Transaction Complete & System Ready", "type": "terminal"}
    ]
    
    total_steps = len(steps)
    box_w = 0.76
    box_h = 0.052
    spacing = 0.078
    start_y = 0.94
    center_x = 0.5
    
    # Color palette
    c_terminal_fill = '#1E3A8A'  # Deep Navy Blue
    c_terminal_border = '#172554'
    c_terminal_text = '#FFFFFF'
    
    c_process_fill = '#F8FAFC'   # Crisp Slate Gray
    c_process_border = '#3B82F6' # Primary Blue
    c_process_title = '#0F172A'  # Dark Slate
    c_process_sub = '#475569'    # Muted Slate
    
    c_decision_fill = '#EFF6FF'  # Soft Blue Tint
    c_decision_border = '#2563EB'
    c_decision_title = '#1E40AF'
    c_decision_sub = '#3B82F6'
    
    for i, s in enumerate(steps):
        y = start_y - (i * spacing)
        
        if s['type'] == 'terminal':
            # Rounded capsule
            box = patches.FancyBboxPatch(
                (center_x - (box_w * 0.45), y - box_h/2),
                box_w * 0.9, box_h,
                boxstyle="round,pad=0.015,rounding_size=0.03",
                edgecolor=c_terminal_border,
                facecolor=c_terminal_fill,
                linewidth=2.0,
                zorder=3
            )
            ax.add_patch(box)
            ax.text(center_x, y + 0.007, s['title'],
                    ha='center', va='center', fontsize=12, fontweight='bold',
                    color=c_terminal_text, zorder=4, fontfamily='DejaVu Sans')
            ax.text(center_x, y - 0.012, s['subtitle'],
                    ha='center', va='center', fontsize=8.5,
                    color='#93C5FD', zorder=4, fontfamily='DejaVu Sans')
            
        elif s['type'] == 'decision':
            box = patches.FancyBboxPatch(
                (center_x - box_w/2, y - box_h/2),
                box_w, box_h,
                boxstyle="round,pad=0.015,rounding_size=0.015",
                edgecolor=c_decision_border,
                facecolor=c_decision_fill,
                linewidth=2.0,
                zorder=3
            )
            ax.add_patch(box)
            ax.text(center_x, y + 0.008, s['title'],
                    ha='center', va='center', fontsize=11, fontweight='bold',
                    color=c_decision_title, zorder=4, fontfamily='DejaVu Sans')
            ax.text(center_x, y - 0.012, s['subtitle'],
                    ha='center', va='center', fontsize=8.5,
                    color='#1E3A8A', zorder=4, fontfamily='DejaVu Sans')
            
        else: # process
            box = patches.FancyBboxPatch(
                (center_x - box_w/2, y - box_h/2),
                box_w, box_h,
                boxstyle="round,pad=0.015,rounding_size=0.012",
                edgecolor=c_process_border,
                facecolor=c_process_fill,
                linewidth=1.6,
                zorder=3
            )
            ax.add_patch(box)
            ax.text(center_x, y + 0.008, s['title'],
                    ha='center', va='center', fontsize=11, fontweight='bold',
                    color=c_process_title, zorder=4, fontfamily='DejaVu Sans')
            ax.text(center_x, y - 0.012, s['subtitle'],
                    ha='center', va='center', fontsize=8.5,
                    color=c_process_sub, zorder=4, fontfamily='DejaVu Sans')
            
        # Draw connecting down arrow to next step
        if i < total_steps - 1:
            next_y = start_y - ((i + 1) * spacing)
            arrow_start_y = y - (box_h / 2) - 0.002
            arrow_end_y = next_y + (box_h / 2) + 0.004
            
            ax.annotate(
                '',
                xy=(center_x, arrow_end_y),
                xytext=(center_x, arrow_start_y),
                arrowprops=dict(
                    arrowstyle="-|>",
                    color='#0284C7',
                    lw=2.2,
                    mutation_scale=14,
                    shrinkA=0, shrinkB=0
                ),
                zorder=2
            )
    
    # Title on top
    plt.title("ShelfSense – Automated FEFO Allocation & Expiry Management Pipeline",
              fontsize=13, fontweight='bold', color='#0F172A', pad=25, fontfamily='DejaVu Sans')
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    
    # Save destinations
    destinations = [
        "C:/Users/venga/Downloads/shelfsense-inventory-platform/docs/flowchart.png",
        "C:/Users/venga/Downloads/shelfsense-inventory-platform/final_report/flowchart.png",
        "C:/Users/venga/.gemini/antigravity/brain/bab2414a-7888-4ea8-aa0b-dee53af82459/flowchart.png"
    ]
    
    for dest in destinations:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        plt.savefig(dest, bbox_inches='tight', dpi=300)
        print(f"✅ Generated: {dest}")

if __name__ == "__main__":
    generate_flowchart()
