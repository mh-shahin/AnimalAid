from django.urls import path
from .views import GetItemsView, get_animals

urlpatterns = [
    path('', GetItemsView.as_view(), name='get_items'),  # GET /api/
    path('animals/', get_animals),
]
