import docx
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib import colors

docx_path = "final_report/Final_Project_Report.docx"
pdf_path = "final_report/Final_Project_Report.pdf"

doc = docx.Document(docx_path)

pdf = SimpleDocTemplate(
    pdf_path,
    pagesize=A4,
    leftMargin=1 * inch,
    rightMargin=1 * inch,
    topMargin=1 * inch,
    bottomMargin=1 * inch
)

# Define exact matching styles in Times-Roman
style_center_14_bold = ParagraphStyle(
    'Center14Bold',
    fontName='Times-Bold',
    fontSize=14,
    leading=17,
    alignment=TA_CENTER,
    spaceBefore=0,
    spaceAfter=0
)

style_justify_14_bold = ParagraphStyle(
    'Justify14Bold',
    fontName='Times-Bold',
    fontSize=14,
    leading=17,
    alignment=TA_JUSTIFY,
    spaceBefore=0,
    spaceAfter=0
)

style_justify_12 = ParagraphStyle(
    'Justify12',
    fontName='Times-Roman',
    fontSize=12,
    leading=15,
    alignment=TA_JUSTIFY,
    spaceBefore=0,
    spaceAfter=0
)

style_flowchart = ParagraphStyle(
    'Flowchart',
    fontName='Courier-Bold',
    fontSize=9,
    leading=11,
    alignment=TA_CENTER,
    spaceBefore=0,
    spaceAfter=0
)

story = []

for i, p in enumerate(doc.paragraphs):
    txt = p.text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    if not txt.strip():
        story.append(Spacer(1, 10))
        continue

    r0 = p.runs[0] if p.runs else None
    sz = r0.font.size.pt if r0 and r0.font and r0.font.size else 12.0
    bold = r0.bold if r0 else False
    align = p.alignment

    # Detect ASCII Flowchart lines
    if any(c in txt for c in ['┌', '│', '└', '↓', '──']):
        story.append(Paragraph(txt, style_flowchart))
    elif sz == 14.0 and bold and align == docx.enum.text.WD_ALIGN_PARAGRAPH.CENTER:
        story.append(Paragraph(txt, style_center_14_bold))
    elif sz == 14.0 and bold:
        story.append(Paragraph(txt, style_justify_14_bold))
    else:
        story.append(Paragraph(txt, style_justify_12))

pdf.build(story)
print(f"✅ Generated PDF report: {pdf_path}")
