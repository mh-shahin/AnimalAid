from django.shortcuts import render
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Feed
from .serializers import FeedSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@parser_classes([MultiPartParser, FormParser])
def feeds_view(request):
    if request.method == 'GET':
        feeds = Feed.objects.all().order_by('-created_at')
        serializer = FeedSerializer(feeds, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = FeedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        feed_id = request.data.get('id')
        if not feed_id:
            return Response({'error': 'ID is required for update'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            feed = Feed.objects.get(id=feed_id)
        except Feed.DoesNotExist:
            return Response({'error': 'Feed not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FeedSerializer(feed, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        feed_id = request.query_params.get('id')
        if not feed_id:
            return Response({'error': 'ID is required to delete'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            feed = Feed.objects.get(id=feed_id)
            feed.delete()
            return Response({'message': 'Feed deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Feed.DoesNotExist:
            return Response({'error': 'Feed not found'}, status=status.HTTP_404_NOT_FOUND)

        
@api_view(['GET', 'PATCH', 'PUT'])  # ✅ ADDED PATCH HERE
def get_feeds_by_id(request, pk):
    try:
        feed = Feed.objects.get(pk=pk)
    except Feed.DoesNotExist:
        return Response({'error': 'Feed not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FeedSerializer(feed, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PATCH':  # ✅ ADDED PATCH SUPPORT
        serializer = FeedSerializer(feed, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT':  # ✅ ADDED PUT SUPPORT
        serializer = FeedSerializer(feed, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)