from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StockPurchaseViewSet, StockSaleViewSet, StockAlertViewSet,
    add_stock, download_stock_report_pdf, stock_analytics, create_stock_alert
)

router = DefaultRouter()
router.register(r'purchases', StockPurchaseViewSet, basename='stock-purchase')
router.register(r'sales', StockSaleViewSet, basename='stock-sale')
router.register(r'alerts', StockAlertViewSet, basename='stock-alert')

urlpatterns = [
    path('', include(router.urls)),
    path('add-stock/', add_stock, name='add-stock'),  # ✅ Remove 'api/stock/'
    path('analytics/', stock_analytics, name='stock-analytics'),
    path('create-alert/', create_stock_alert, name='create-alert'),
    path('download-pdf/', download_stock_report_pdf, name='download-stock-report'),
]