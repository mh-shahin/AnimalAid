from django.urls import path
from .views import MedicineReviewAPIView, FeedReviewAPIView

urlpatterns = [
    path('medicines/<int:medicine_id>/', MedicineReviewAPIView.as_view(), name='medicine-reviews'),
    path('feeds/<int:feed_id>/', FeedReviewAPIView.as_view(), name='feed-reviews'),
]
