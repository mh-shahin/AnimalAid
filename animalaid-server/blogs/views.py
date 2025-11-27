from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import F
from django.shortcuts import get_object_or_404
from .models import BlogPost
from .serializers import BlogPostSerializer


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'   # default lookup

    # ----------- SUPPORT SLUG OR ID ------------
    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)

        # If the lookup value is numeric → treat it as ID
        if lookup_value.isdigit():
            return get_object_or_404(BlogPost, id=lookup_value)

        # Otherwise → treat it as slug
        return get_object_or_404(BlogPost, slug=lookup_value)

    # ----------- FILTERING ------------
    def get_queryset(self):
        queryset = BlogPost.objects.all()
        status_param = self.request.query_params.get('status')
        category_param = self.request.query_params.get('category')

        if status_param:
            queryset = queryset.filter(status=status_param)

        if category_param:
            queryset = queryset.filter(category=category_param)

        return queryset

    # ----------- RETRIEVE (VIEW COUNT) ------------
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        BlogPost.objects.filter(pk=instance.pk).update(views=F('views') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # ----------- UPDATE (PUT/PATCH) ------------
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # ----------- DELETE ------------
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Blog deleted successfully'}, status=200)

    # ----------- LIKE ------------
    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        blog_post = self.get_object()
        BlogPost.objects.filter(pk=blog_post.pk).update(likes=F('likes') + 1)
        blog_post.refresh_from_db()
        return Response({'status': 'success', 'likes': blog_post.likes})

    # ----------- CATEGORIES ------------
    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = BlogPost.objects.values_list('category', flat=True).distinct()
        return Response([{'category': cat} for cat in categories if cat])
