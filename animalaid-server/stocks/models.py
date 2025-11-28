from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class StockPurchase(models.Model):
    """Track all stock purchases/additions"""
    PRODUCT_TYPES = [
        ('medicine', 'Medicine'),
        ('feed', 'Feed'),
    ]
    
    product_id = models.IntegerField()
    product_type = models.CharField(max_length=10, choices=PRODUCT_TYPES)
    product_name = models.CharField(max_length=255)
    quantity_added = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    supplier_name = models.CharField(max_length=255, blank=True)
    supplier_phone = models.CharField(max_length=20, blank=True)
    invoice_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Stock Purchase'
        verbose_name_plural = 'Stock Purchases'
    
    def __str__(self):
        return f"{self.product_name} - {self.quantity_added} units"


class StockSale(models.Model):
    """Track all sales from orders"""
    order_id = models.CharField(max_length=100)
    product_id = models.IntegerField()
    product_type = models.CharField(max_length=10)
    product_name = models.CharField(max_length=255)
    quantity_sold = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    customer_id = models.IntegerField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Stock Sale'
        verbose_name_plural = 'Stock Sales'
    
    def __str__(self):
        return f"{self.product_name} - {self.quantity_sold} units sold"


class StockAlert(models.Model):
    """Low stock alerts"""
    product_id = models.IntegerField()
    product_type = models.CharField(max_length=10)
    product_name = models.CharField(max_length=255)
    current_stock = models.IntegerField()
    threshold = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Alert: {self.product_name} - {self.current_stock} remaining"