from django.urls import path
from .views import medicines_view

urlpatterns = [
    path('', medicines_view),
]
