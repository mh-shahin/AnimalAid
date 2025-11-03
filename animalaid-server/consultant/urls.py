from django.urls import path
from .views import analyze_consultation

urlpatterns = [
    path('analyze/', analyze_consultation, name='consultation-analyze'),
]
