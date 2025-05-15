from rest_framework import serializers
from .models import api_test

class AnimalAidSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_test
        fields = '__all__'
