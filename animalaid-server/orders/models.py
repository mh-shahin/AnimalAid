from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    order_id = models.CharField(max_length=50, unique=True, editable=False)
    
    # Order details
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=59.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Notes
    customer_notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['order_id']),
            models.Index(fields=['user']),
        ]

    def save(self, *args, **kwargs):
        if not self.order_id:
            # Generate unique order ID
            import uuid
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            unique_id = str(uuid.uuid4().hex[:6]).upper()
            self.order_id = f'ORD-{timestamp}-{unique_id}'
        
        # Calculate grand total
        self.grand_total = self.total_amount + self.delivery_charge - self.discount_amount
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_id} - {self.user.first_name}"


class ShippingAddress(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipping_address')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address_line = models.TextField()
    city = models.CharField(max_length=100)
    postal = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='Bangladesh')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Address for {self.order.order_id}"


class OrderItem(models.Model):
    PRODUCT_TYPE_CHOICES = [
        ('medicine', 'Medicine'),
        ('feed', 'Feed'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    
    # Product reference (store both ID and type for flexibility)
    product_id = models.IntegerField()
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES, default='medicine')
    
    # Product details (snapshot at time of order)
    product_name = models.CharField(max_length=255)
    product_brand = models.CharField(max_length=255, blank=True)
    product_image = models.URLField(blank=True, null=True)
    
    # Pricing
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Quantity
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['order', 'product_id']),
        ]

    def save(self, *args, **kwargs):
        # Calculate discount amount
        if self.discount_percentage > 0:
            self.discount_amount = (self.unit_price * self.discount_percentage) / 100
        
        # Calculate final price per unit
        self.final_price = self.unit_price - self.discount_amount
        
        # Calculate subtotal
        self.subtotal = self.final_price * self.quantity
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} x {self.quantity} - Order {self.order.order_id}"


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('rocket', 'Rocket'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    
    # Payment details
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    provider = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    sender_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Amount
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Timestamps
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional info
    payment_response = models.JSONField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Payment {self.transaction_id or 'N/A'} - Order {self.order.order_id}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Order status histories'

    def __str__(self):
        return f"{self.order.order_id} - {self.status} at {self.created_at}"