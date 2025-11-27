from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction
from datetime import datetime

from .models import Order, OrderItem, Payment, OrderStatusHistory
from .serializers import (
    OrderListSerializer, 
    OrderDetailSerializer, 
    CreateOrderSerializer,
    OrderStatusHistorySerializer
)


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling orders
    
    Endpoints:
    - GET /orders/ - List all orders
    - GET /orders/{id}/ - Get order details
    - POST /orders/create/ - Create new order
    - PATCH /orders/{id}/update_status/ - Update order status
    - GET /orders/user/{user_id}/ - Get orders for specific user
    """
    
    queryset = Order.objects.all()
    permission_classes = [AllowAny]  # Change to IsAuthenticated in production
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create_order':
            return CreateOrderSerializer
        return OrderDetailSerializer
    
    def list(self, request):
        """List all orders"""
        orders = self.get_queryset()
        serializer = OrderListSerializer(orders, many=True)
        return Response({
            'success': True,
            'count': orders.count(),
            'orders': serializer.data
        })
    
    def retrieve(self, request, pk=None):
        """Get detailed order information"""
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderDetailSerializer(order)
        return Response({
            'success': True,
            'order': serializer.data
        })
    
    @action(detail=False, methods=['post'], url_path='create')
    def create_order(self, request):
        """
        Create a new order with items, shipping, and payment
        
        Expected payload:
        {
            "user": 1,
            "total_amount": 1000.00,
            "delivery_charge": 59.00,
            "discount_amount": 0.00,
            "items": [
                {
                    "product": 15,
                    "quantity": 2,
                    "product_type": "medicine"
                }
            ],
            "shipping_address": {
                "name": "John Doe",
                "phone": "01712345678",
                "address_line": "123 Main St",
                "city": "Dhaka",
                "postal": "1200"
            },
            "payment": {
                "method": "cod",
                "provider": "",
                "transaction_id": "",
                "sender_phone": "",
                "status": "pending"
            },
            "customer_notes": "Please deliver carefully"
        }
        """
        serializer = CreateOrderSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                order = serializer.save()
                
                # Return success response
                detail_serializer = OrderDetailSerializer(order)
                return Response({
                    'success': True,
                    'message': 'Order created successfully',
                    'order_id': order.order_id,
                    'order': detail_serializer.data,
                    'created_at': order.created_at.isoformat()
                }, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e),
                    'message': 'Failed to create order'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'errors': serializer.errors,
            'message': 'Invalid order data'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Update order status
        
        Payload:
        {
            "status": "confirmed",
            "notes": "Payment verified"
        }
        """
        order = get_object_or_404(Order, pk=pk)
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response({
                'success': False,
                'error': 'Status is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate status
        valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response({
                'success': False,
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update order status
        order.status = new_status
        order.save()
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            notes=notes,
            changed_by=request.user if request.user.is_authenticated else None
        )
        
        serializer = OrderDetailSerializer(order)
        return Response({
            'success': True,
            'message': f'Order status updated to {new_status}',
            'order': serializer.data
        })
    
    @action(detail=True, methods=['patch'], url_path='update-payment-status')
    def update_payment_status(self, request, pk=None):
        """
        Update payment status
        
        Payload:
        {
            "payment_status": "paid",
            "transaction_id": "TXN123456",
            "paid_at": "2024-01-15T10:30:00"
        }
        """
        order = get_object_or_404(Order, pk=pk)
        payment_status = request.data.get('payment_status')
        transaction_id = request.data.get('transaction_id')
        
        if not payment_status:
            return Response({
                'success': False,
                'error': 'Payment status is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update order payment status
        order.payment_status = payment_status
        order.save()
        
        # Update payment record
        if hasattr(order, 'payment'):
            payment = order.payment
            payment.status = payment_status
            
            if transaction_id:
                payment.transaction_id = transaction_id
            
            if payment_status == 'paid' and not payment.paid_at:
                payment.paid_at = datetime.now()
            
            payment.save()
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            notes=f'Payment status updated to {payment_status}',
            changed_by=request.user if request.user.is_authenticated else None
        )
        
        serializer = OrderDetailSerializer(order)
        return Response({
            'success': True,
            'message': f'Payment status updated to {payment_status}',
            'order': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_orders(self, request, user_id=None):
        """Get all orders for a specific user"""
        orders = Order.objects.filter(user_id=user_id)
        serializer = OrderListSerializer(orders, many=True)
        
        return Response({
            'success': True,
            'count': orders.count(),
            'orders': serializer.data
        })
    
    @action(detail=True, methods=['get'], url_path='status-history')
    def status_history(self, request, pk=None):
        """Get status history for an order"""
        order = get_object_or_404(Order, pk=pk)
        history = order.status_history.all()
        serializer = OrderStatusHistorySerializer(history, many=True)
        
        return Response({
            'success': True,
            'order_id': order.order_id,
            'history': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Get order statistics"""
        from django.db.models import Count, Sum
        
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(
            total=Sum('grand_total')
        )['total'] or 0
        
        status_breakdown = Order.objects.values('status').annotate(
            count=Count('id')
        )
        
        payment_status_breakdown = Order.objects.values('payment_status').annotate(
            count=Count('id')
        )
        
        return Response({
            'success': True,
            'statistics': {
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'status_breakdown': list(status_breakdown),
                'payment_status_breakdown': list(payment_status_breakdown)
            }
        })