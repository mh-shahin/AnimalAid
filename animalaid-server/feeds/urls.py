from django.urls import path
from .views import feeds_view, get_feeds_by_id

urlpatterns = [
    path('', feeds_view),
    path('<int:pk>/', get_feeds_by_id),
]