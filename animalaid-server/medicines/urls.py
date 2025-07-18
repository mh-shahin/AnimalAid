from django.urls import path
from .views import medicines_view, get_medicines_by_id

urlpatterns = [
    path('', medicines_view),
    path('<int:pk>/', get_medicines_by_id),
]
