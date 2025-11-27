from django.contrib import admin
from .models import Order, OrderItem, ShippingAddress, Payment, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal', 'final_price', 'discount_amount']
    fields = [
        'product_id', 'product_type', 'product_name', 'product_brand',
        'unit_price', 'discount_percentage', 'discount_amount', 
        'final_price', 'quantity', 'subtotal'
    ]


class ShippingAddressInline(admin.StackedInline):
    model = ShippingAddress
    extra = 0


class PaymentInline(admin.StackedInline):
    model = Payment
    extra = 0


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_id', 'user', 'grand_total', 'status', 
        'payment_status', 'created_at'
    ]
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_id', 'user__username', 'user__email']
    readonly_fields = ['order_id', 'grand_total', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_id', 'user', 'status', 'payment_status')
        }),
        ('Amounts', {
            'fields': ('total_amount', 'delivery_charge', 'discount_amount', 'grand_total')
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [OrderItemInline, ShippingAddressInline, PaymentInline, OrderStatusHistoryInline]
    
    def save_model(self, request, obj, form, change):
        if change:
            # Create status history when order status changes
            if 'status' in form.changed_data:
                OrderStatusHistory.objects.create(
                    order=obj,
                    status=obj.status,
                    notes=f'Status changed by admin',
                    changed_by=request.user
                )
        super().save_model(request, obj, form, change)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'product_name', 'product_brand', 
        'quantity', 'final_price', 'subtotal'
    ]
    list_filter = ['product_type', 'order__status']
    search_fields = ['product_name', 'order__order_id']
    readonly_fields = ['subtotal', 'final_price', 'discount_amount']


@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ['order', 'name', 'phone', 'city', 'postal']
    search_fields = ['name', 'phone', 'order__order_id']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'method', 'amount', 'status', 
        'transaction_id', 'paid_at'
    ]
    list_filter = ['method', 'status', 'paid_at']
    search_fields = ['order__order_id', 'transaction_id', 'sender_phone']
    readonly_fields = ['paid_at', 'created_at', 'updated_at']


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'changed_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order__order_id', 'notes']
    readonly_fields = ['created_at']