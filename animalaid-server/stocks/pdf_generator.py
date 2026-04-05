"""
PDF Report Generator for Animal Aid Stock Management.

Report structure (matches your handwritten notes):
  1. Title + period info
  2. Financial Overview (key metrics)
  3. Monthly/Period Report — SPLIT TABLE
       Left side  = Sales   (product, date, qty, price, revenue)
       Right side = Purchase (product, date, qty, cost, total)
       Bottom     = Net Profit / Loss
  4. Top Selling Products
  5. Low Stock Alerts
  6. Sales by Group
  7. Sales by Area
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle,
    Paragraph, Spacer, HRFlowable, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from datetime import datetime
from django.utils import timezone


# ---------------------------------------------------------------------------
# Colour palette
# ---------------------------------------------------------------------------
BLUE   = colors.HexColor('#1E40AF')
GREEN  = colors.HexColor('#10B981')
RED    = colors.HexColor('#EF4444')
ORANGE = colors.HexColor('#F59E0B')
PURPLE = colors.HexColor('#7C3AED')
LIGHT_BLUE   = colors.HexColor('#DBEAFE')
LIGHT_GREEN  = colors.HexColor('#D1FAE5')
LIGHT_RED    = colors.HexColor('#FEE2E2')
LIGHT_ORANGE = colors.HexColor('#FEF3C7')
LIGHT_GREY   = colors.HexColor('#F3F4F6')
MID_GREY     = colors.HexColor('#9CA3AF')
WHITE        = colors.white


class StockReportPDF:
    def __init__(self, analytics_data, period):
        self.data = analytics_data
        self.period = period
        self.buffer = BytesIO()
        self.pagesize = A4
        self.width, self.height = self.pagesize

        # Build styles once
        base = getSampleStyleSheet()
        self.styles = {
            'title': ParagraphStyle(
                'Title', parent=base['Heading1'],
                fontSize=22, textColor=BLUE,
                spaceAfter=4, alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            ),
            'subtitle': ParagraphStyle(
                'Subtitle', parent=base['Normal'],
                fontSize=10, textColor=MID_GREY,
                spaceAfter=2, alignment=TA_CENTER,
            ),
            'section': ParagraphStyle(
                'Section', parent=base['Heading2'],
                fontSize=13, textColor=BLUE,
                spaceBefore=14, spaceAfter=6,
                fontName='Helvetica-Bold'
            ),
            'normal': base['Normal'],
            'small': ParagraphStyle(
                'Small', parent=base['Normal'],
                fontSize=8, textColor=MID_GREY,
            ),
            'footer': ParagraphStyle(
                'Footer', parent=base['Normal'],
                fontSize=7, textColor=MID_GREY,
                alignment=TA_CENTER
            ),
            'profit_pos': ParagraphStyle(
                'ProfitPos', parent=base['Normal'],
                fontSize=14, textColor=GREEN,
                alignment=TA_CENTER, fontName='Helvetica-Bold'
            ),
            'profit_neg': ParagraphStyle(
                'ProfitNeg', parent=base['Normal'],
                fontSize=14, textColor=RED,
                alignment=TA_CENTER, fontName='Helvetica-Bold'
            ),
        }

    # -----------------------------------------------------------------------
    # Public entry point
    # -----------------------------------------------------------------------
    def generate(self):
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=self.pagesize,
            rightMargin=1.5 * cm,
            leftMargin=1.5 * cm,
            topMargin=1.5 * cm,
            bottomMargin=1.5 * cm,
        )

        elements = []
        self._add_header(elements)
        self._add_metrics_section(elements)
        self._add_split_report(elements)       # ← the split Sales | Purchase table
        self._add_top_products(elements)
        self._add_alerts(elements)
        self._add_group_sales(elements)
        self._add_area_sales(elements)
        self._add_footer(elements)

        doc.build(elements)
        pdf = self.buffer.getvalue()
        self.buffer.close()
        return pdf

    # -----------------------------------------------------------------------
    # Header
    # -----------------------------------------------------------------------
    def _add_header(self, elements):
        period_label = {
            'week':  'Last 7 Days',
            'month': 'Last 30 Days',
            'year':  'Last 365 Days',
        }.get(self.period, 'Custom Period')

        generated = timezone.now().strftime('%B %d, %Y  %I:%M %p')

        elements.append(Paragraph("Animal Aid", self.styles['title']))
        elements.append(Paragraph("Stock Management Report", self.styles['title']))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(
            f"Period: {period_label}   |   Generated: {generated}",
            self.styles['subtitle']
        ))
        elements.append(HRFlowable(width='100%', thickness=1.5, color=BLUE, spaceAfter=10))

    # -----------------------------------------------------------------------
    # Section heading helper
    # -----------------------------------------------------------------------
    def _section(self, elements, title, color=BLUE):
        elements.append(Paragraph(title, self.styles['section']))

    # -----------------------------------------------------------------------
    # 1. Key Metrics (one-row colourful summary)
    # -----------------------------------------------------------------------
    def _add_metrics_section(self, elements):
        self._section(elements, "Financial Overview")

        m = self.data['metrics']
        profit = m['profit']

        data = [
            # row 0 — headers
            ['Total Investment', 'Total Revenue', 'Net Profit / Loss',
             'Units Purchased', 'Units Sold', 'Stock Remaining', 'Low Stock Alerts'],
            # row 1 — values
            [
                f"৳{m['total_investment']:,.0f}",
                f"৳{m['total_revenue']:,.0f}",
                f"৳{profit:,.0f}",
                f"{m['total_units_purchased']:,}",
                f"{m['total_units_sold']:,}",
                f"{m['total_units_purchased'] - m['total_units_sold']:,}",
                str(m['active_alerts_count']),
            ]
        ]

        col_w = (self.width - 3 * cm) / 7

        tbl = Table(data, colWidths=[col_w] * 7)
        profit_color = GREEN if profit >= 0 else RED

        tbl.setStyle(TableStyle([
            # Header row
            ('BACKGROUND',   (0, 0), (-1, 0), BLUE),
            ('TEXTCOLOR',    (0, 0), (-1, 0), WHITE),
            ('FONTNAME',     (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',     (0, 0), (-1, 0), 8),
            ('ALIGN',        (0, 0), (-1, 0), 'CENTER'),
            ('BOTTOMPADDING',(0, 0), (-1, 0), 6),
            ('TOPPADDING',   (0, 0), (-1, 0), 6),

            # Value row
            ('BACKGROUND',   (0, 1), (-1, 1), LIGHT_BLUE),
            ('FONTNAME',     (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE',     (0, 1), (-1, 1), 11),
            ('ALIGN',        (0, 1), (-1, 1), 'CENTER'),
            ('TOPPADDING',   (0, 1), (-1, 1), 8),
            ('BOTTOMPADDING',(0, 1), (-1, 1), 8),

            # Profit cell special colour
            ('TEXTCOLOR',    (2, 1), (2, 1), profit_color),

            # Alert cell
            ('BACKGROUND',   (6, 1), (6, 1), LIGHT_ORANGE if m['active_alerts_count'] > 0 else LIGHT_GREEN),
            ('TEXTCOLOR',    (6, 1), (6, 1), ORANGE if m['active_alerts_count'] > 0 else GREEN),

            ('GRID',         (0, 0), (-1, -1), 0.5, colors.white),
            ('ROUNDEDCORNERS', [4]),
        ]))

        elements.append(tbl)
        elements.append(Spacer(1, 14))

    # -----------------------------------------------------------------------
    # 2. SPLIT TABLE — Sales (left) | Purchase (right)  +  Net P/L
    # -----------------------------------------------------------------------
    def _add_split_report(self, elements):
        self._section(elements, f"Period Report — Sales vs Purchases")

        sales     = self.data.get('recent_sales', [])
        purchases = self.data.get('recent_purchases', [])

        # ---- build inner sales rows ----
        s_header = [
            Paragraph('<b>Product</b>', self._cell_style()),
            Paragraph('<b>Date</b>', self._cell_style()),
            Paragraph('<b>Qty</b>', self._cell_style(align='CENTER')),
            Paragraph('<b>Price</b>', self._cell_style(align='RIGHT')),
            Paragraph('<b>Revenue</b>', self._cell_style(align='RIGHT')),
        ]
        s_rows = [s_header]
        for s in sales[:12]:
            d = self._parse_date(s.get('created_at', ''))
            s_rows.append([
                Paragraph(str(s.get('product_name', ''))[:22], self._cell_style(size=7)),
                Paragraph(d, self._cell_style(size=7)),
                Paragraph(str(s.get('quantity_sold', '')), self._cell_style(size=7, align='CENTER')),
                Paragraph(f"৳{float(s.get('unit_price', 0)):,.0f}", self._cell_style(size=7, align='RIGHT')),
                Paragraph(f"৳{float(s.get('total_revenue', 0)):,.0f}", self._cell_style(size=7, align='RIGHT')),
            ])
        if not sales:
            s_rows.append([Paragraph('No sales data', self._cell_style()), '', '', '', ''])

        # ---- build inner purchase rows ----
        p_header = [
            Paragraph('<b>Product</b>', self._cell_style()),
            Paragraph('<b>Date</b>', self._cell_style()),
            Paragraph('<b>Qty</b>', self._cell_style(align='CENTER')),
            Paragraph('<b>Cost</b>', self._cell_style(align='RIGHT')),
            Paragraph('<b>Total</b>', self._cell_style(align='RIGHT')),
        ]
        p_rows = [p_header]
        for p in purchases[:12]:
            d = self._parse_date(p.get('created_at', ''))
            p_rows.append([
                Paragraph(str(p.get('product_name', ''))[:22], self._cell_style(size=7)),
                Paragraph(d, self._cell_style(size=7)),
                Paragraph(str(p.get('quantity_added', '')), self._cell_style(size=7, align='CENTER')),
                Paragraph(f"৳{float(p.get('unit_cost', 0)):,.0f}", self._cell_style(size=7, align='RIGHT')),
                Paragraph(f"৳{float(p.get('total_cost', 0)):,.0f}", self._cell_style(size=7, align='RIGHT')),
            ])
        if not purchases:
            p_rows.append([Paragraph('No purchase data', self._cell_style()), '', '', '', ''])

        # Pad both to equal length so the outer table rows align
        max_rows = max(len(s_rows), len(p_rows))
        empty_s = [Paragraph('', self._cell_style())] * 5
        empty_p = [Paragraph('', self._cell_style())] * 5
        while len(s_rows) < max_rows:
            s_rows.append(empty_s)
        while len(p_rows) < max_rows:
            p_rows.append(empty_p)

        # ---- build the two inner tables ----
        half = (self.width - 3 * cm) / 2 - 0.3 * cm   # half page minus gap
        s_col_w = [half * 0.30, half * 0.18, half * 0.10, half * 0.20, half * 0.22]
        p_col_w = [half * 0.30, half * 0.18, half * 0.10, half * 0.20, half * 0.22]

        s_table = Table(s_rows, colWidths=s_col_w, repeatRows=1)
        s_table.setStyle(self._inner_table_style(header_bg=GREEN, light_bg=LIGHT_GREEN))

        p_table = Table(p_rows, colWidths=p_col_w, repeatRows=1)
        p_table.setStyle(self._inner_table_style(header_bg=BLUE, light_bg=LIGHT_BLUE))

        # ---- outer 2-column table holding the two inner tables ----
        #   Col0: label + sales table    Col1: label + purchase table
        outer_data = [
            [
                Paragraph('<b>SALES</b>', ParagraphStyle(
                    'SalesHead', fontSize=11, textColor=GREEN,
                    fontName='Helvetica-Bold', alignment=TA_CENTER
                )),
                Paragraph('<b>PURCHASES</b>', ParagraphStyle(
                    'PurchHead', fontSize=11, textColor=BLUE,
                    fontName='Helvetica-Bold', alignment=TA_CENTER
                )),
            ],
            [s_table, p_table],
        ]

        outer = Table(outer_data, colWidths=[half + 0.3 * cm, half + 0.3 * cm])
        outer.setStyle(TableStyle([
            ('VALIGN',  (0, 0), (-1, -1), 'TOP'),
            ('ALIGN',   (0, 0), (-1, 0),  'CENTER'),
            ('LINEAFTER',(0, 0), (0, -1), 0.8, BLUE),
            ('LEFTPADDING',  (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING',   (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 4),
        ]))

        elements.append(outer)
        elements.append(Spacer(1, 10))

        # ---- Net Profit / Loss row ----
        metrics = self.data['metrics']
        profit = metrics['profit']
        revenue = metrics['total_revenue']
        investment = metrics['total_investment']

        profit_style = self.styles['profit_pos'] if profit >= 0 else self.styles['profit_neg']
        profit_bg = LIGHT_GREEN if profit >= 0 else LIGHT_RED
        profit_label = "NET PROFIT" if profit >= 0 else "NET LOSS"

        pl_data = [
            ['Total Revenue', 'Total Investment', profit_label],
            [f"৳{revenue:,.2f}", f"৳{investment:,.2f}", f"৳{abs(profit):,.2f}"],
        ]
        pw = (self.width - 3 * cm) / 3
        pl_table = Table(pl_data, colWidths=[pw, pw, pw])
        pl_table.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
            ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1, 0), 10),
            ('ALIGN',         (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING',    (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),

            # Revenue col
            ('BACKGROUND',    (0, 1), (0, 1), LIGHT_GREEN),
            ('TEXTCOLOR',     (0, 1), (0, 1), GREEN),
            ('FONTNAME',      (0, 1), (0, 1), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 1), (0, 1), 12),

            # Investment col
            ('BACKGROUND',    (1, 1), (1, 1), LIGHT_BLUE),
            ('TEXTCOLOR',     (1, 1), (1, 1), BLUE),
            ('FONTNAME',      (1, 1), (1, 1), 'Helvetica-Bold'),
            ('FONTSIZE',      (1, 1), (1, 1), 12),

            # Profit col
            ('BACKGROUND',    (2, 1), (2, 1), profit_bg),
            ('TEXTCOLOR',     (2, 1), (2, 1), GREEN if profit >= 0 else RED),
            ('FONTNAME',      (2, 1), (2, 1), 'Helvetica-Bold'),
            ('FONTSIZE',      (2, 1), (2, 1), 14),

            ('GRID',          (0, 0), (-1, -1), 0.5, WHITE),
        ]))

        elements.append(pl_table)
        elements.append(Spacer(1, 18))

    # -----------------------------------------------------------------------
    # 3. Top Selling Products
    # -----------------------------------------------------------------------
    def _add_top_products(self, elements):
        self._section(elements, "Top Selling Products")

        products = self.data.get('top_selling_products', [])
        if not products:
            elements.append(Paragraph("No sales data available.", self.styles['small']))
            elements.append(Spacer(1, 10))
            return

        data = [['#', 'Product Name', 'Type', 'Units Sold', 'Revenue']]
        for i, p in enumerate(products[:10], 1):
            rank = {1: '🥇', 2: '🥈', 3: '🥉'}.get(i, f'#{i}')
            data.append([
                rank,
                str(p.get('product_name', ''))[:35],
                str(p.get('product_type', '')).capitalize(),
                f"{p.get('total_sold', 0):,}",
                f"৳{float(p.get('total_revenue', 0)):,.2f}",
            ])

        cw = self.width - 3 * cm
        tbl = Table(data, colWidths=[cw*0.07, cw*0.40, cw*0.15, cw*0.16, cw*0.22])
        tbl.setStyle(self._inner_table_style(header_bg=GREEN, light_bg=LIGHT_GREEN))
        elements.append(tbl)
        elements.append(Spacer(1, 14))

    # -----------------------------------------------------------------------
    # 4. Low Stock Alerts
    # -----------------------------------------------------------------------
    def _add_alerts(self, elements):
        self._section(elements, "Low Stock Alerts")

        alerts = self.data.get('active_alerts', [])
        if not alerts:
            elements.append(Paragraph("✅  All products are well stocked!", self.styles['normal']))
            elements.append(Spacer(1, 10))
            return

        data = [['Product Name', 'Type', 'Current Stock', 'Status']]
        for a in alerts:
            stock = a.get('current_stock', 0)
            status = '🔴 CRITICAL' if stock < 5 else '🟡 LOW'
            data.append([
                str(a.get('product_name', ''))[:35],
                str(a.get('product_type', '')).capitalize(),
                str(stock),
                status,
            ])

        cw = self.width - 3 * cm
        tbl = Table(data, colWidths=[cw*0.45, cw*0.18, cw*0.18, cw*0.19])
        tbl.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0), (-1, 0), RED),
            ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
            ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1, 0), 9),
            ('ALIGN',         (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN',         (0, 1), (0, -1), 'LEFT'),
            ('TOPPADDING',    (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('ROWBACKGROUNDS',(0, 1), (-1, -1), [LIGHT_RED, WHITE]),
            ('TEXTCOLOR',     (3, 1), (3, -1), RED),
            ('FONTNAME',      (3, 1), (3, -1), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 1), (-1, -1), 8),
            ('GRID',          (0, 0), (-1, -1), 0.5, colors.white),
        ]))
        elements.append(tbl)
        elements.append(Spacer(1, 14))

    # -----------------------------------------------------------------------
    # 5. Sales by Group
    # -----------------------------------------------------------------------
    def _add_group_sales(self, elements):
        self._section(elements, "Sales Report — By Customer Group")

        groups = self.data.get('group_sales', [])
        if not groups:
            elements.append(Paragraph("No group sales data.", self.styles['small']))
            elements.append(Spacer(1, 10))
            return

        data = [['Customer Group', 'Units Sold', 'Revenue']]
        for g in groups:
            data.append([
                str(g.get('customer_group') or 'Unknown'),
                f"{g.get('total_units_sold', 0):,}",
                f"৳{float(g.get('total_revenue', 0)):,.2f}",
            ])

        cw = self.width - 3 * cm
        tbl = Table(data, colWidths=[cw*0.50, cw*0.20, cw*0.30])
        tbl.setStyle(self._inner_table_style(header_bg=PURPLE, light_bg=colors.HexColor('#EDE9FE')))
        elements.append(tbl)
        elements.append(Spacer(1, 14))

    # -----------------------------------------------------------------------
    # 6. Sales by Area
    # -----------------------------------------------------------------------
    def _add_area_sales(self, elements):
        self._section(elements, "Sales Report — By Area")

        areas = self.data.get('area_sales', [])
        if not areas:
            elements.append(Paragraph("No area sales data.", self.styles['small']))
            elements.append(Spacer(1, 10))
            return

        data = [['Area / Location', 'Units Sold', 'Revenue']]
        for a in areas:
            data.append([
                str(a.get('customer_area') or 'Unknown'),
                f"{a.get('total_units_sold', 0):,}",
                f"৳{float(a.get('total_revenue', 0)):,.2f}",
            ])

        cw = self.width - 3 * cm
        tbl = Table(data, colWidths=[cw*0.50, cw*0.20, cw*0.30])
        tbl.setStyle(self._inner_table_style(header_bg=ORANGE, light_bg=LIGHT_ORANGE))
        elements.append(tbl)
        elements.append(Spacer(1, 14))

    # -----------------------------------------------------------------------
    # Footer
    # -----------------------------------------------------------------------
    def _add_footer(self, elements):
        elements.append(HRFlowable(width='100%', thickness=0.5, color=MID_GREY, spaceBefore=8))
        elements.append(Paragraph(
            "Animal Aid — Veterinary Supplies Management System  |  This is an automated report",
            self.styles['footer']
        ))

    # -----------------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------------
    def _inner_table_style(self, header_bg=BLUE, light_bg=LIGHT_BLUE):
        return TableStyle([
            ('BACKGROUND',    (0, 0), (-1, 0), header_bg),
            ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
            ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1, 0), 9),
            ('ALIGN',         (0, 0), (-1, 0), 'CENTER'),
            ('TOPPADDING',    (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING',   (0, 0), (-1, -1), 4),
            ('RIGHTPADDING',  (0, 0), (-1, -1), 4),
            ('ROWBACKGROUNDS',(0, 1), (-1, -1), [WHITE, light_bg]),
            ('FONTNAME',      (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE',      (0, 1), (-1, -1), 8),
            ('GRID',          (0, 0), (-1, -1), 0.4, colors.HexColor('#E5E7EB')),
        ])

    def _cell_style(self, size=8, align='LEFT'):
        align_map = {'LEFT': TA_LEFT, 'CENTER': TA_CENTER, 'RIGHT': TA_RIGHT}
        return ParagraphStyle(
            'Cell', fontSize=size,
            alignment=align_map.get(align, TA_LEFT),
            leading=size + 2,
        )

    def _parse_date(self, date_str):
        """Convert ISO date string to short readable format."""
        if not date_str:
            return ''
        try:
            dt = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
            return dt.strftime('%d/%m/%y')
        except Exception:
            return str(date_str)[:10]