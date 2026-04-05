from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StockPurchaseViewSet, StockSaleViewSet, StockAlertViewSet,
    add_stock, stock_analytics, download_stock_report_pdf,
    create_stock_alert, product_list, sales_by_group, sales_by_area
)

router = DefaultRouter()
router.register(r'purchases', StockPurchaseViewSet, basename='stock-purchase')
router.register(r'sales', StockSaleViewSet, basename='stock-sale')
router.register(r'alerts', StockAlertViewSet, basename='stock-alert')

urlpatterns = [
    path('', include(router.urls)),

    # Stock operations
    path('add-stock/', add_stock, name='add-stock'),

    # Analytics & reports
    path('analytics/', stock_analytics, name='stock-analytics'),
    path('product-list/', product_list, name='product-list'),        # NEW
    path('sales-by-group/', sales_by_group, name='sales-by-group'),  # NEW
    path('sales-by-area/', sales_by_area, name='sales-by-area'),     # NEW

    # Alerts
    path('create-alert/', create_stock_alert, name='create-alert'),

    # PDF download
    path('download-pdf/', download_stock_report_pdf, name='download-stock-report'),
]

# Full URL map (assuming included at /api/stocks/):
#
#  GET  /api/stocks/purchases/          — list all purchases
#  GET  /api/stocks/sales/              — list all sales
#  GET  /api/stocks/alerts/             — list active alerts
#  POST /api/stocks/add-stock/          — add stock to a product
#  GET  /api/stocks/analytics/          — dashboard analytics
#  GET  /api/stocks/product-list/       — all products with current stock  ← NEW
#  GET  /api/stocks/sales-by-group/     — sales report by group            ← NEW
#  GET  /api/stocks/sales-by-area/      — sales report by area             ← NEW
#  POST /api/stocks/create-alert/       — create/update low stock alert
#  GET  /api/stocks/download-pdf/       — download PDF report