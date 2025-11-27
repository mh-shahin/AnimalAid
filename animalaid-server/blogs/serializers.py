from rest_framework import serializers
from .models import BlogPost

class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 
            'category', 'tags', 'image', 'status', 
            'views', 'likes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at', 'views', 'likes']

