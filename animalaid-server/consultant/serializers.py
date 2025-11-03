# consultant/serializers.py
from rest_framework import serializers
from .models import Consultation

class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = ['id', 'animal_type', 'description', 'image1', 'image2', 'image3', 'result', 'created_at']
