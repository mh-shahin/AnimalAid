from rest_framework import serializers
from .models import StockPurchase, StockSale, StockAlert


class StockPurchaseSerializer(serializers.ModelSerializer):
    added_by_username = serializers.CharField(
        source='added_by.username', read_only=True
    )

    class Meta:
        model = StockPurchase
        fields = '__all__'
        read_only_fields = ['added_by', 'created_at']


class StockSaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockSale
        fields = '__all__'  # includes new customer_name, customer_group, customer_area


class StockAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAlert
        fields = '__all__'


class AddStockSerializer(serializers.Serializer):
    """Serializer for adding stock to existing products"""
    product_id = serializers.IntegerField()
    product_type = serializers.ChoiceField(choices=['medicine', 'feed'])
    quantity_added = serializers.IntegerField(min_value=1)
    unit_cost = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    supplier_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    supplier_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    invoice_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)