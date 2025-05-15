from django.urls import path
from .views import feeds_view

urlpatterns = [
    path('', feeds_view),
]