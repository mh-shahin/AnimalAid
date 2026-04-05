from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
import requests
from django.http import HttpResponse

from .pdf_generator import StockReportPDF
from .models import StockPurchase, StockSale, StockAlert
from .serializers import (
    StockPurchaseSerializer, StockSaleSerializer,
    StockAlertSerializer, AddStockSerializer
)


# ---------------------------------------------------------------------------
# Helper: calculate start date from period string
# ---------------------------------------------------------------------------
def _get_start_date(period):
    now = timezone.now()
    if period == 'week':
        return now - timedelta(days=7)
    elif period == 'month':
        return now - timedelta(days=30)
    elif period == 'year':
        return now - timedelta(days=365)
    return now - timedelta(days=30)  # default: month


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------
class StockPurchaseViewSet(viewsets.ModelViewSet):
    queryset = StockPurchase.objects.all()
    serializer_class = StockPurchaseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = StockPurchase.objects.all()
        product_type = self.request.query_params.get('product_type')
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        return queryset


class StockSaleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockSale.objects.all()
    serializer_class = StockSaleSerializer
    permission_classes = [AllowAny]


class StockAlertViewSet(viewsets.ModelViewSet):
    queryset = StockAlert.objects.filter(is_active=True)
    serializer_class = StockAlertSerializer
    permission_classes = [AllowAny]


# ---------------------------------------------------------------------------
# 1. PRODUCT LIST — current stock for all medicines and feeds
# GET /api/stocks/product-list/
# ---------------------------------------------------------------------------
@api_view(['GET'])
def product_list(request):
    """
    Fetch all medicines and feeds with their current stock.
    Returns a unified list so frontend can show one table.
    
    Query params:
        product_type : 'medicine' | 'feed' | '' (all)
        search       : filter by name
    """
    product_type = request.query_params.get('product_type', '')
    search = request.query_params.get('search', '')

    products = []

    # --- fetch medicines ---
    if product_type in ('', 'medicine'):
        try:
            resp = requests.get('http://localhost:8000/medicines/', timeout=5)
            if resp.status_code == 200:
                medicines = resp.json()
                # Handle both list and paginated response
                if isinstance(medicines, dict):
                    medicines = medicines.get('results', [])
                for m in medicines:
                    name = m.get('name', '')
                    if search and search.lower() not in name.lower():
                        continue
                    products.append({
                        'id': m.get('id'),
                        'product_type': 'medicine',
                        'name': name,
                        'current_stock': int(m.get('piece', 0)),
                        'unit_price': float(m.get('price', 0)),
                        'category': m.get('category', ''),
                    })
        except Exception as e:
            pass  # don't crash — just skip medicines if API is down

    # --- fetch feeds ---
    if product_type in ('', 'feed'):
        try:
            resp = requests.get('http://localhost:8000/feeds/', timeout=5)
            if resp.status_code == 200:
                feeds = resp.json()
                if isinstance(feeds, dict):
                    feeds = feeds.get('results', [])
                for f in feeds:
                    name = f.get('name', '')
                    if search and search.lower() not in name.lower():
                        continue
                    products.append({
                        'id': f.get('id'),
                        'product_type': 'feed',
                        'name': name,
                        'current_stock': int(f.get('piece', 0)),
                        'unit_price': float(f.get('price', 0)),
                        'category': f.get('category', ''),
                    })
        except Exception as e:
            pass

    # Annotate each product with low stock status
    # (alert exists and is active)
    alert_ids = set(
        StockAlert.objects.filter(is_active=True).values_list('product_id', flat=True)
    )
    for p in products:
        p['low_stock'] = p['id'] in alert_ids

    # Sort: low stock first, then by name
    products.sort(key=lambda x: (not x['low_stock'], x['name']))

    return Response({
        'count': len(products),
        'results': products
    })


# ---------------------------------------------------------------------------
# 2. STOCK ANALYTICS (existing — enhanced)
# GET /api/stocks/analytics/
# ---------------------------------------------------------------------------
@api_view(['GET'])
def stock_analytics(request):
    """
    Comprehensive stock analytics for the dashboard.
    
    Query params:
        period       : week | month | year
        product_type : medicine | feed | '' (all)
    """
    period = request.query_params.get('period', 'month')
    product_type = request.query_params.get('product_type', '')
    start_date = _get_start_date(period)
    now = timezone.now()

    purchases_qs = StockPurchase.objects.filter(created_at__gte=start_date)
    sales_qs = StockSale.objects.filter(created_at__gte=start_date)

    if product_type:
        purchases_qs = purchases_qs.filter(product_type=product_type)
        sales_qs = sales_qs.filter(product_type=product_type)

    total_investment = purchases_qs.aggregate(total=Sum('total_cost'))['total'] or 0
    total_revenue = sales_qs.aggregate(total=Sum('total_revenue'))['total'] or 0
    total_units_purchased = purchases_qs.aggregate(total=Sum('quantity_added'))['total'] or 0
    total_units_sold = sales_qs.aggregate(total=Sum('quantity_sold'))['total'] or 0

    active_alerts = StockAlert.objects.filter(is_active=True)
    if product_type:
        active_alerts = active_alerts.filter(product_type=product_type)

    top_selling = (
        sales_qs
        .values('product_name', 'product_type')
        .annotate(total_sold=Sum('quantity_sold'), total_revenue=Sum('total_revenue'))
        .order_by('-total_sold')[:10]
    )

    recent_purchases = purchases_qs.order_by('-created_at')[:10]
    recent_sales = sales_qs.order_by('-created_at')[:10]

    return Response({
        'period': period,
        'start_date': start_date,
        'end_date': now,
        'metrics': {
            'total_investment': float(total_investment),
            'total_revenue': float(total_revenue),
            'profit': float(total_revenue - total_investment),
            'total_units_purchased': total_units_purchased,
            'total_units_sold': total_units_sold,
            'active_alerts_count': active_alerts.count(),
        },
        'top_selling_products': list(top_selling),
        'recent_purchases': StockPurchaseSerializer(recent_purchases, many=True).data,
        'recent_sales': StockSaleSerializer(recent_sales, many=True).data,
        'active_alerts': StockAlertSerializer(active_alerts, many=True).data,
    })


# ---------------------------------------------------------------------------
# 3. SALES REPORT — BY GROUP
# GET /api/stocks/sales-by-group/
# ---------------------------------------------------------------------------
@api_view(['GET'])
def sales_by_group(request):
    """
    Sales report grouped by customer_group.
    
    Query params:
        period       : week | month | year
        product_type : medicine | feed | '' (all)
    
    Returns for each group:
        group_name, total_revenue, total_units_sold, number_of_orders, top_product
    """
    period = request.query_params.get('period', 'month')
    product_type = request.query_params.get('product_type', '')
    start_date = _get_start_date(period)

    sales_qs = StockSale.objects.filter(created_at__gte=start_date)
    if product_type:
        sales_qs = sales_qs.filter(product_type=product_type)

    # Group by customer_group
    groups = (
        sales_qs
        .values('customer_group')
        .annotate(
            total_revenue=Sum('total_revenue'),
            total_units_sold=Sum('quantity_sold'),
            order_count=Count('order_id', distinct=True),
        )
        .order_by('-total_revenue')
    )

    # For each group also find the top-selling product
    result = []
    for g in groups:
        group_name = g['customer_group'] or 'Unknown'
        top = (
            sales_qs
            .filter(customer_group=g['customer_group'])
            .values('product_name')
            .annotate(sold=Sum('quantity_sold'))
            .order_by('-sold')
            .first()
        )
        result.append({
            'group': group_name,
            'total_revenue': float(g['total_revenue'] or 0),
            'total_units_sold': g['total_units_sold'] or 0,
            'order_count': g['order_count'] or 0,
            'top_product': top['product_name'] if top else '-',
        })

    total_rev = sum(r['total_revenue'] for r in result)

    return Response({
        'period': period,
        'groups': result,
        'summary': {
            'total_revenue': total_rev,
            'total_groups': len(result),
        }
    })


# ---------------------------------------------------------------------------
# 4. SALES REPORT — BY AREA
# GET /api/stocks/sales-by-area/
# ---------------------------------------------------------------------------
@api_view(['GET'])
def sales_by_area(request):
    """
    Sales report grouped by customer_area.
    
    Query params:
        period       : week | month | year
        product_type : medicine | feed | '' (all)
    
    Returns for each area:
        area_name, total_revenue, total_units_sold, number_of_orders, top_product
    """
    period = request.query_params.get('period', 'month')
    product_type = request.query_params.get('product_type', '')
    start_date = _get_start_date(period)

    sales_qs = StockSale.objects.filter(created_at__gte=start_date)
    if product_type:
        sales_qs = sales_qs.filter(product_type=product_type)

    areas = (
        sales_qs
        .values('customer_area')
        .annotate(
            total_revenue=Sum('total_revenue'),
            total_units_sold=Sum('quantity_sold'),
            order_count=Count('order_id', distinct=True),
        )
        .order_by('-total_revenue')
    )

    result = []
    for a in areas:
        area_name = a['customer_area'] or 'Unknown'
        top = (
            sales_qs
            .filter(customer_area=a['customer_area'])
            .values('product_name')
            .annotate(sold=Sum('quantity_sold'))
            .order_by('-sold')
            .first()
        )
        result.append({
            'area': area_name,
            'total_revenue': float(a['total_revenue'] or 0),
            'total_units_sold': a['total_units_sold'] or 0,
            'order_count': a['order_count'] or 0,
            'top_product': top['product_name'] if top else '-',
        })

    total_rev = sum(r['total_revenue'] for r in result)

    return Response({
        'period': period,
        'areas': result,
        'summary': {
            'total_revenue': total_rev,
            'total_areas': len(result),
        }
    })


# ---------------------------------------------------------------------------
# 5. ADD STOCK
# POST /api/stocks/add-stock/
# ---------------------------------------------------------------------------
@api_view(['POST'])
def add_stock(request):
    """Add stock to existing product and record purchase"""
    serializer = AddStockSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    product_id = data['product_id']
    product_type = data['product_type']
    quantity_added = data['quantity_added']
    unit_cost = data['unit_cost']

    try:
        if product_type == 'medicine':
            url = f"http://localhost:8000/medicines/{product_id}/"
        else:
            url = f"http://localhost:8000/feeds/{product_id}/"

        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return Response(
                {'error': f'{product_type.capitalize()} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        product = response.json()
        current_stock = int(product.get('piece', 0))
        new_stock = current_stock + quantity_added

        update_response = requests.patch(
            url,
            json={'piece': new_stock},
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        if update_response.status_code not in [200, 204]:
            return Response(
                {'error': 'Failed to update product stock'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        stock_purchase = StockPurchase.objects.create(
            product_id=product_id,
            product_type=product_type,
            product_name=product.get('name', ''),
            quantity_added=quantity_added,
            unit_cost=unit_cost,
            total_cost=quantity_added * unit_cost,
            supplier_name=data.get('supplier_name', ''),
            supplier_phone=data.get('supplier_phone', ''),
            invoice_number=data.get('invoice_number', ''),
            notes=data.get('notes', ''),
            added_by=request.user if request.user.is_authenticated else None
        )

        # Resolve existing alert if stock is now OK
        StockAlert.objects.filter(
            product_id=product_id,
            product_type=product_type,
            is_active=True
        ).update(is_active=False, resolved_at=timezone.now())

        return Response({
            'success': True,
            'message': f'Stock updated. New stock: {new_stock}',
            'purchase': StockPurchaseSerializer(stock_purchase).data,
            'new_stock': new_stock
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# 6. DOWNLOAD PDF REPORT
# GET /api/stocks/download-pdf/
# ---------------------------------------------------------------------------
@api_view(['GET'])
def download_stock_report_pdf(request):
    """Download full stock report as PDF"""
    period = request.query_params.get('period', 'month')
    product_type = request.query_params.get('product_type', '')
    start_date = _get_start_date(period)
    now = timezone.now()

    purchases_qs = StockPurchase.objects.filter(created_at__gte=start_date)
    sales_qs = StockSale.objects.filter(created_at__gte=start_date)

    if product_type:
        purchases_qs = purchases_qs.filter(product_type=product_type)
        sales_qs = sales_qs.filter(product_type=product_type)

    total_investment = purchases_qs.aggregate(total=Sum('total_cost'))['total'] or 0
    total_revenue = sales_qs.aggregate(total=Sum('total_revenue'))['total'] or 0
    total_units_purchased = purchases_qs.aggregate(total=Sum('quantity_added'))['total'] or 0
    total_units_sold = sales_qs.aggregate(total=Sum('quantity_sold'))['total'] or 0

    active_alerts = StockAlert.objects.filter(is_active=True)
    if product_type:
        active_alerts = active_alerts.filter(product_type=product_type)

    top_selling = (
        sales_qs
        .values('product_name', 'product_type')
        .annotate(total_sold=Sum('quantity_sold'), total_revenue=Sum('total_revenue'))
        .order_by('-total_sold')[:10]
    )

    recent_purchases = purchases_qs.order_by('-created_at')[:10]
    recent_sales = sales_qs.order_by('-created_at')[:10]

    # Group sales
    group_sales = (
        sales_qs.values('customer_group')
        .annotate(total_revenue=Sum('total_revenue'), total_units_sold=Sum('quantity_sold'))
        .order_by('-total_revenue')
    )
    area_sales = (
        sales_qs.values('customer_area')
        .annotate(total_revenue=Sum('total_revenue'), total_units_sold=Sum('quantity_sold'))
        .order_by('-total_revenue')
    )

    analytics_data = {
        'period': period,
        'metrics': {
            'total_investment': float(total_investment),
            'total_revenue': float(total_revenue),
            'profit': float(total_revenue - total_investment),
            'total_units_purchased': total_units_purchased,
            'total_units_sold': total_units_sold,
            'active_alerts_count': active_alerts.count(),
        },
        'top_selling_products': list(top_selling),
        'recent_purchases': StockPurchaseSerializer(recent_purchases, many=True).data,
        'recent_sales': StockSaleSerializer(recent_sales, many=True).data,
        'active_alerts': StockAlertSerializer(active_alerts, many=True).data,
        'group_sales': list(group_sales),
        'area_sales': list(area_sales),
    }

    pdf_generator = StockReportPDF(analytics_data, period)
    pdf_content = pdf_generator.generate()

    filename = f"AnimalAid_Stock_Report_{period}_{now.strftime('%Y%m%d')}.pdf"
    response = HttpResponse(pdf_content, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


# ---------------------------------------------------------------------------
# 7. CREATE STOCK ALERT
# POST /api/stocks/create-alert/
# ---------------------------------------------------------------------------
@api_view(['POST'])
def create_stock_alert(request):
    """Manually create or update stock alert"""
    product_id = request.data.get('product_id')
    product_type = request.data.get('product_type')
    threshold = request.data.get('threshold', 10)

    try:
        if product_type == 'medicine':
            url = f"http://localhost:8000/medicines/{product_id}/"
        else:
            url = f"http://localhost:8000/feeds/{product_id}/"

        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            product = response.json()
            current_stock = int(product.get('piece', 0))

            if current_stock <= threshold:
                alert, created = StockAlert.objects.get_or_create(
                    product_id=product_id,
                    product_type=product_type,
                    defaults={
                        'product_name': product.get('name', ''),
                        'current_stock': current_stock,
                        'threshold': threshold,
                        'is_active': True,
                    }
                )
                if not created:
                    alert.current_stock = current_stock
                    alert.is_active = True
                    alert.save()
                return Response({'success': True, 'alert': StockAlertSerializer(alert).data})
            else:
                return Response({'success': False, 'message': 'Stock is above threshold'})
        else:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)