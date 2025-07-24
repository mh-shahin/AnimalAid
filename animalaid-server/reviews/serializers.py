from rest_framework import serializers
from .models import MedicineReview, FeedReview

class MedicineReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = MedicineReview
        fields = ['id', 'user', 'medicine', 'rating', 'text', 'created_at']
        read_only_fields = ['user', 'medicine', 'created_at']


class FeedReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = FeedReview
        fields = ['id', 'user', 'feed', 'rating', 'text', 'created_at']
        read_only_fields = ['user', 'feed', 'created_at']
