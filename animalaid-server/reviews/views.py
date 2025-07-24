from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import MedicineReview, FeedReview
from medicines.models import Medicine
from feeds.models import Feed
from .serializers import MedicineReviewSerializer, FeedReviewSerializer

class MedicineReviewAPIView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow anyone to view and submit reviews

    def get(self, request, medicine_id):
        reviews = MedicineReview.objects.filter(medicine_id=medicine_id)
        serializer = MedicineReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, medicine_id):
        try:
            medicine = Medicine.objects.get(pk=medicine_id)
        except Medicine.DoesNotExist:
            return Response({'error': 'Medicine not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MedicineReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                user=request.user if request.user.is_authenticated else None,
                medicine=medicine
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeedReviewAPIView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow anyone to view and submit reviews

    def get(self, request, feed_id):
        reviews = FeedReview.objects.filter(feed_id=feed_id)
        serializer = FeedReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, feed_id):
        try:
            feed = Feed.objects.get(pk=feed_id)
        except Feed.DoesNotExist:
            return Response({'error': 'Feed not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FeedReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                user=request.user if request.user.is_authenticated else None,
                feed=feed
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
