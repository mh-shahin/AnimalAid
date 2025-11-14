from rest_framework import serializers
from .models import Feed

class FeedSerializer(serializers.ModelSerializer):
    # image = serializers.SerializerMethodField()

    class Meta:
        model = Feed
        fields = ['id', 'name', 'brand', 'quantity', 'unit', 'animal_category', 'price', 'discount','feed_type', 'description', 'piece', 'image']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None