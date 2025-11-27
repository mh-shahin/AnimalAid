from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Order, OrderItem, ShippingAddress, Payment, OrderStatusHistory
from django.db import transaction
import requests

User = get_user_model()


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ['name', 'phone', 'address_line', 'city', 'postal', 'country']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_id', 'product_type', 'product_name', 
            'product_brand', 'product_image', 'unit_price', 
            'discount_percentage', 'discount_amount', 'final_price',
            'quantity', 'subtotal'
        ]
        read_only_fields = ['discount_amount', 'final_price', 'subtotal']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'method', 'provider', 'transaction_id', 
            'sender_phone', 'amount', 'status', 'paid_at'
        ]
        read_only_fields = ['paid_at']
        extra_kwargs = {
            'amount': {'required': False}
        }


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'notes', 'changed_by_username', 'created_at']


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders"""
    items_count = serializers.SerializerMethodField()
    shipping_address = ShippingAddressSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'total_amount', 'delivery_charge', 
            'discount_amount', 'grand_total', 'status', 'payment_status',
            'items_count', 'shipping_address', 'payment', 'created_at', 'updated_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed order view"""
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = ShippingAddressSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'user', 'user_username', 'user_email',
            'total_amount', 'delivery_charge', 'discount_amount', 'grand_total',
            'status', 'payment_status', 'customer_notes', 'admin_notes',
            'items', 'shipping_address', 'payment', 'status_history',
            'created_at', 'updated_at'
        ]


class CreateOrderItemSerializer(serializers.Serializer):
    """Serializer for items when creating an order"""
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    product_type = serializers.ChoiceField(
        choices=['medicine', 'feed'], 
        required=True
    )


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating a new order"""
    user = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    delivery_charge = serializers.DecimalField(max_digits=10, decimal_places=2, default=59.00)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    items = CreateOrderItemSerializer(many=True)
    shipping_address = ShippingAddressSerializer()
    payment = serializers.DictField()
    
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_items(self, items):
        """Ensure items list is not empty"""
        if not items:
            raise serializers.ValidationError("Order must contain at least one item.")
        return items
    
    def get_product_api_url(self, product_id, product_type):
        """Generate the correct API URL based on product type"""
        product_type = product_type.lower()
        
        if product_type == 'medicine':
            return f"http://localhost:8000/medicines/{product_id}/"
        elif product_type == 'feed':
            return f"http://localhost:8000/feeds/{product_id}/"
        else:
            raise serializers.ValidationError(
                f"Invalid product type: {product_type}. Must be 'medicine' or 'feed'."
            )
    
    def fetch_product_details(self, product_id, product_type):
        """Fetch product details from the correct API based on type"""
        try:
            url = self.get_product_api_url(product_id, product_type)
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                
                # Convert string values to proper types
                if 'price' in data:
                    data['price'] = float(data['price'])
                if 'discount' in data:
                    data['discount'] = float(data['discount'])
                if 'piece' in data:
                    data['piece'] = int(data['piece'])
                
                return data
            else:
                raise serializers.ValidationError(
                    f"{product_type.capitalize()} with ID {product_id} not found or unavailable."
                )
        except requests.RequestException as e:
            raise serializers.ValidationError(
                f"Unable to fetch {product_type} details: {str(e)}"
            )
    
    def validate_stock(self, product_data, requested_quantity):
        """Check if product has sufficient stock"""
        available_quantity = product_data.get('piece', 0)
        
        try:
            available_quantity = int(available_quantity)
            requested_quantity = int(requested_quantity)
        except (ValueError, TypeError):
            raise serializers.ValidationError(
                f"Invalid quantity values for {product_data.get('name', 'product')}"
            )
        
        if available_quantity < requested_quantity:
            raise serializers.ValidationError(
                f"Insufficient stock for {product_data['name']}. "
                f"Available: {available_quantity}, Requested: {requested_quantity}"
            )
    
    def update_product_stock(self, product_id, new_stock, product_type):
        """Update product stock after order - Works for both medicine and feed"""
        try:
            url = self.get_product_api_url(product_id, product_type)
            
            # Try PATCH method (partial update)
            try:
                response = requests.patch(
                    url,
                    json={'piece': new_stock},
                    headers={'Content-Type': 'application/json'},
                    timeout=5
                )
                
                if response.status_code in [200, 204]:
                    return True
            except requests.RequestException:
                pass
            
            # Try PUT method (full update)
            try:
                get_response = requests.get(url, timeout=5)
                
                if get_response.status_code == 200:
                    product_data = get_response.json()
                    product_data['piece'] = new_stock
                    
                    put_response = requests.put(
                        url,
                        json=product_data,
                        headers={'Content-Type': 'application/json'},
                        timeout=5
                    )
                    
                    if put_response.status_code in [200, 204]:
                        return True
            except requests.RequestException:
                pass
            
            return False
        
        except Exception:
            return False
    
    @transaction.atomic
    def create(self, validated_data):
        """Create order with all related objects"""
        items_data = validated_data.pop('items')
        shipping_data = validated_data.pop('shipping_address')
        payment_data = validated_data.pop('payment')
        
        user_id = validated_data.pop('user')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        
        # Create the order
        order = Order.objects.create(user=user, **validated_data)
        
        # Create shipping address
        ShippingAddress.objects.create(order=order, **shipping_data)
        
        # Create order items and update product stock
        for item_data in items_data:
            product_id = item_data['product']
            quantity = item_data['quantity']
            product_type = item_data['product_type']
            
            # Fetch product details based on type
            product = self.fetch_product_details(product_id, product_type)
            
            # Validate stock
            self.validate_stock(product, quantity)
            
            # Create order item
            OrderItem.objects.create(
                order=order,
                product_id=product_id,
                product_type=product_type,
                product_name=product.get('name', ''),
                product_brand=product.get('brand', ''),
                product_image=product.get('image', ''),
                unit_price=float(product.get('price', 0)),
                discount_percentage=float(product.get('discount', 0)),
                quantity=int(quantity)
            )
            
            # Update product stock
            current_stock = int(product['piece'])
            new_stock = current_stock - int(quantity)
            self.update_product_stock(product_id, new_stock, product_type)
        
        # Create payment record
        payment_method = payment_data.get('method', 'cod')
        payment_provider = payment_data.get('provider', '')
        payment_status = payment_data.get('status', 'pending')
        payment_amount = payment_data.get('amount', order.grand_total)
        transaction_id = payment_data.get('transaction_id', '')
        sender_phone = payment_data.get('sender_phone', '')
        
        Payment.objects.create(
            order=order,
            method=payment_method,
            provider=payment_provider,
            transaction_id=transaction_id,
            sender_phone=sender_phone,
            amount=payment_amount,
            status=payment_status
        )
        
        # Create initial status history
        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            notes='Order created'
        )
        
        # Update payment status in order if paid
        if payment_data.get('status') == 'paid':
            order.payment_status = 'paid'
            order.status = 'confirmed'
            order.save()
            
            OrderStatusHistory.objects.create(
                order=order,
                status='confirmed',
                notes='Payment received and confirmed'
            )
        
        return order