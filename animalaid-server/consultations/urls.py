from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultationViewSet, DiseaseViewSet, MedicineViewSet

router = DefaultRouter()
router.register(r'consultations', ConsultationViewSet, basename='consultation')
router.register(r'diseases', DiseaseViewSet, basename='disease')
router.register(r'medicines', MedicineViewSet, basename='medicine')

urlpatterns = [
    path('', include(router.urls)),
]
