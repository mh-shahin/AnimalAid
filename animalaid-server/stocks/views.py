from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum, Count, Q, F
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

class StockPurchaseViewSet(viewsets.ModelViewSet):
    queryset = StockPurchase.objects.all()
    serializer_class = StockPurchaseSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = StockPurchase.objects.all()
        product_type = self.request.query_params.get('product_type', None)
        
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
        # Fetch current product details
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
        
        # Update product stock
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
        
        # Record stock purchase
        total_cost = quantity_added * unit_cost
        
        stock_purchase = StockPurchase.objects.create(
            product_id=product_id,
            product_type=product_type,
            product_name=product.get('name', ''),
            quantity_added=quantity_added,
            unit_cost=unit_cost,
            total_cost=total_cost,
            supplier_name=data.get('supplier_name', ''),
            supplier_phone=data.get('supplier_phone', ''),
            invoice_number=data.get('invoice_number', ''),
            notes=data.get('notes', ''),
            added_by=request.user if request.user.is_authenticated else None
        )
        
        # Check and resolve low stock alert if exists
        StockAlert.objects.filter(
            product_id=product_id,
            product_type=product_type,
            is_active=True
        ).update(is_active=False, resolved_at=timezone.now())
        
        return Response({
            'success': True,
            'message': f'Stock updated successfully. New stock: {new_stock}',
            'purchase': StockPurchaseSerializer(stock_purchase).data,
            'new_stock': new_stock
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def stock_analytics(request):
    """Get comprehensive stock analytics"""
    period = request.query_params.get('period', 'week')  # week, month, year
    product_type = request.query_params.get('product_type', None)
    
    # Calculate date range
    now = timezone.now()
    if period == 'week':
        start_date = now - timedelta(days=7)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=7)
    
    # Base querysets
    purchases_qs = StockPurchase.objects.filter(created_at__gte=start_date)
    sales_qs = StockSale.objects.filter(created_at__gte=start_date)
    
    if product_type:
        purchases_qs = purchases_qs.filter(product_type=product_type)
        sales_qs = sales_qs.filter(product_type=product_type)
    
    # Calculate metrics
    total_investment = purchases_qs.aggregate(
        total=Sum('total_cost')
    )['total'] or 0
    
    total_revenue = sales_qs.aggregate(
        total=Sum('total_revenue')
    )['total'] or 0
    
    total_units_purchased = purchases_qs.aggregate(
        total=Sum('quantity_added')
    )['total'] or 0
    
    total_units_sold = sales_qs.aggregate(
        total=Sum('quantity_sold')
    )['total'] or 0
    
    # Get active alerts
    active_alerts = StockAlert.objects.filter(is_active=True)
    if product_type:
        active_alerts = active_alerts.filter(product_type=product_type)
    
    # Top selling products
    top_selling = sales_qs.values('product_name', 'product_type').annotate(
        total_sold=Sum('quantity_sold'),
        total_revenue=Sum('total_revenue')
    ).order_by('-total_sold')[:10]
    
    # Recent purchases
    recent_purchases = purchases_qs.order_by('-created_at')[:10]
    
    # Recent sales
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
            'active_alerts_count': active_alerts.count()
        },
        'top_selling_products': list(top_selling),
        'recent_purchases': StockPurchaseSerializer(recent_purchases, many=True).data,
        'recent_sales': StockSaleSerializer(recent_sales, many=True).data,
        'active_alerts': StockAlertSerializer(active_alerts, many=True).data
    })




@api_view(['GET'])
def download_stock_report_pdf(request):
    """Download stock analytics as PDF"""
    period = request.query_params.get('period', 'month')
    product_type = request.query_params.get('product_type', None)
    
    # Get analytics data (reuse existing function logic)
    now = timezone.now()
    if period == 'week':
        start_date = now - timedelta(days=7)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=7)
    
    # Base querysets
    purchases_qs = StockPurchase.objects.filter(created_at__gte=start_date)
    sales_qs = StockSale.objects.filter(created_at__gte=start_date)
    
    if product_type:
        purchases_qs = purchases_qs.filter(product_type=product_type)
        sales_qs = sales_qs.filter(product_type=product_type)
    
    # Calculate metrics
    total_investment = purchases_qs.aggregate(total=Sum('total_cost'))['total'] or 0
    total_revenue = sales_qs.aggregate(total=Sum('total_revenue'))['total'] or 0
    total_units_purchased = purchases_qs.aggregate(total=Sum('quantity_added'))['total'] or 0
    total_units_sold = sales_qs.aggregate(total=Sum('quantity_sold'))['total'] or 0
    
    # Get active alerts
    active_alerts = StockAlert.objects.filter(is_active=True)
    if product_type:
        active_alerts = active_alerts.filter(product_type=product_type)
    
    # Top selling products
    top_selling = sales_qs.values('product_name', 'product_type').annotate(
        total_sold=Sum('quantity_sold'),
        total_revenue=Sum('total_revenue')
    ).order_by('-total_sold')[:10]
    
    # Recent purchases
    recent_purchases = purchases_qs.order_by('-created_at')[:10]
    
    # Prepare analytics data
    analytics_data = {
        'period': period,
        'start_date': start_date,
        'end_date': now,
        'metrics': {
            'total_investment': float(total_investment),
            'total_revenue': float(total_revenue),
            'profit': float(total_revenue - total_investment),
            'total_units_purchased': total_units_purchased,
            'total_units_sold': total_units_sold,
            'active_alerts_count': active_alerts.count()
        },
        'top_selling_products': list(top_selling),
        'recent_purchases': StockPurchaseSerializer(recent_purchases, many=True).data,
        'active_alerts': StockAlertSerializer(active_alerts, many=True).data
    }
    
    # Generate PDF
    pdf_generator = StockReportPDF(analytics_data, period)
    pdf_content = pdf_generator.generate()
    
    # Create filename
    filename = f"AnimalAid_Stock_Report_{period}_{now.strftime('%Y%m%d')}.pdf"
    
    # Return PDF response
    response = HttpResponse(pdf_content, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response




@api_view(['POST'])
def create_stock_alert(request):
    """Manually create or update stock alert"""
    product_id = request.data.get('product_id')
    product_type = request.data.get('product_type')
    threshold = request.data.get('threshold', 10)
    
    # Fetch product details
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
                        'is_active': True
                    }
                )
                
                if not created:
                    alert.current_stock = current_stock
                    alert.is_active = True
                    alert.save()
                
                return Response({
                    'success': True,
                    'alert': StockAlertSerializer(alert).data
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Stock is above threshold'
                })
        else:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)