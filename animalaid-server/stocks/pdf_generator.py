from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from datetime import datetime
from django.utils import timezone


class StockReportPDF:
    def __init__(self, analytics_data, period):
        self.data = analytics_data
        self.period = period
        self.buffer = BytesIO()
        self.pagesize = A4
        self.width, self.height = self.pagesize
        
    def generate(self):
        # Create PDF document
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=self.pagesize,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30
        )
        
        # Container for PDF elements
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1E40AF'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1E40AF'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        # Title
        title = Paragraph("Animal Aid Stock Management Report", title_style)
        elements.append(title)
        
        # Report Info
        report_info_style = ParagraphStyle(
            'ReportInfo',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        
        period_text = {
            'week': 'Last 7 Days',
            'month': 'Last 30 Days',
            'year': 'Last 365 Days'
        }.get(self.period, 'Custom Period')
        
        report_date = Paragraph(
            f"<b>Period:</b> {period_text} | <b>Generated:</b> {timezone.now().strftime('%B %d, %Y at %I:%M %p')}",
            report_info_style
        )
        elements.append(report_date)
        elements.append(Spacer(1, 20))
        
        # Add Key Metrics Section
        self._add_metrics_section(elements, heading_style)
        
        # Add Top Selling Products
        self._add_top_products_section(elements, heading_style)
        
        # Add Recent Purchases
        self._add_recent_purchases_section(elements, heading_style)
        
        # Add Low Stock Alerts
        self._add_alerts_section(elements, heading_style)
        
        # Footer
        elements.append(Spacer(1, 20))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        footer = Paragraph(
            "Animal Aid - Veterinary Supplies Management System<br/>This is an automated report",
            footer_style
        )
        elements.append(footer)
        
        # Build PDF
        doc.build(elements)
        
        # Get PDF value
        pdf = self.buffer.getvalue()
        self.buffer.close()
        return pdf
    
    def _add_metrics_section(self, elements, heading_style):
        """Add key metrics summary"""
        elements.append(Paragraph("Financial Overview", heading_style))
        
        metrics = self.data['metrics']
        
        # Create metrics table
        metrics_data = [
            ['Metric', 'Value'],
            ['Total Investment', f"৳{metrics['total_investment']:,.2f}"],
            ['Total Revenue', f"৳{metrics['total_revenue']:,.2f}"],
            ['Net Profit/Loss', f"৳{metrics['profit']:,.2f}"],
            ['Units Purchased', f"{metrics['total_units_purchased']:,}"],
            ['Units Sold', f"{metrics['total_units_sold']:,}"],
            ['Stock Remaining', f"{metrics['total_units_purchased'] - metrics['total_units_sold']:,}"],
            ['Active Alerts', str(metrics['active_alerts_count'])]
        ]
        
        # Determine profit color
        profit = metrics['profit']
        profit_color = colors.green if profit >= 0 else colors.red
        
        metrics_table = Table(metrics_data, colWidths=[3*inch, 3*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ('TEXTCOLOR', (1, 3), (1, 3), profit_color),  # Color for profit row
            ('FONTNAME', (1, 3), (1, 3), 'Helvetica-Bold'),
        ]))
        
        elements.append(metrics_table)
        elements.append(Spacer(1, 20))
    
    def _add_top_products_section(self, elements, heading_style):
        """Add top selling products table"""
        elements.append(Paragraph("Top Selling Products", heading_style))
        
        top_products = self.data.get('top_selling_products', [])
        
        if not top_products:
            elements.append(Paragraph("No sales data available", getSampleStyleSheet()['Normal']))
            elements.append(Spacer(1, 20))
            return
        
        # Table header
        table_data = [['Rank', 'Product Name', 'Type', 'Units Sold', 'Revenue']]
        
        # Add top 10 products
        for idx, product in enumerate(top_products[:10], 1):
            rank_emoji = '🥇' if idx == 1 else '🥈' if idx == 2 else '🥉' if idx == 3 else f"#{idx}"
            table_data.append([
                rank_emoji,
                product['product_name'][:30],  # Truncate long names
                product['product_type'].capitalize(),
                f"{product['total_sold']:,}",
                f"৳{product['total_revenue']:,.2f}"
            ])
        
        products_table = Table(table_data, colWidths=[0.8*inch, 2.5*inch, 1*inch, 1*inch, 1.5*inch])
        products_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10B981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ('ALIGN', (4, 1), (4, -1), 'RIGHT'),  # Right align revenue
        ]))
        
        elements.append(products_table)
        elements.append(Spacer(1, 20))
    
    def _add_recent_purchases_section(self, elements, heading_style):
        """Add recent purchases table"""
        elements.append(Paragraph("Recent Stock Purchases", heading_style))
        
        purchases = self.data.get('recent_purchases', [])
        
        if not purchases:
            elements.append(Paragraph("No recent purchases", getSampleStyleSheet()['Normal']))
            elements.append(Spacer(1, 20))
            return
        
        # Table header
        table_data = [['Date', 'Product', 'Type', 'Quantity', 'Unit Cost', 'Total']]
        
        # Add purchases
        for purchase in purchases[:10]:
            date = datetime.fromisoformat(purchase['created_at'].replace('Z', '+00:00'))
            table_data.append([
                date.strftime('%m/%d/%y'),
                purchase['product_name'][:25],
                purchase['product_type'][:3].upper(),
                str(purchase['quantity_added']),
                f"৳{float(purchase['unit_cost']):.2f}",
                f"৳{float(purchase['total_cost']):.2f}"
            ])
        
        purchases_table = Table(table_data, colWidths=[0.9*inch, 2.2*inch, 0.6*inch, 0.8*inch, 1*inch, 1.3*inch])
        purchases_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ('ALIGN', (5, 1), (5, -1), 'RIGHT'),
        ]))
        
        elements.append(purchases_table)
        elements.append(Spacer(1, 20))
    
    def _add_alerts_section(self, elements, heading_style):
        """Add low stock alerts"""
        elements.append(Paragraph("Low Stock Alerts", heading_style))
        
        alerts = self.data.get('active_alerts', [])
        
        if not alerts:
            elements.append(Paragraph("✅ All products are well stocked!", getSampleStyleSheet()['Normal']))
            elements.append(Spacer(1, 20))
            return
        
        # Table header
        table_data = [['Product Name', 'Type', 'Current Stock', 'Status']]
        
        # Add alerts
        for alert in alerts:
            status = '⚠️ CRITICAL' if alert['current_stock'] < 5 else '⚠️ LOW'
            table_data.append([
                alert['product_name'][:30],
                alert['product_type'].capitalize(),
                str(alert['current_stock']),
                status
            ])
        
        alerts_table = Table(table_data, colWidths=[3*inch, 1.2*inch, 1.3*inch, 1.3*inch])
        alerts_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EF4444')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.lightpink, colors.white]),
            ('TEXTCOLOR', (3, 1), (3, -1), colors.red),
            ('FONTNAME', (3, 1), (3, -1), 'Helvetica-Bold'),
        ]))
        
        elements.append(alerts_table)
        elements.append(Spacer(1, 20))