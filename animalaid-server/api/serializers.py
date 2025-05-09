from rest_framework import serializers
from .models import animalaid_db

class AnimalAidSerializer(serializers.ModelSerializer):
    class Meta:
        model = animalaid_db
        fields = '__all__'
