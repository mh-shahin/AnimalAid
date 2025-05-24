from rest_framework import serializers
from .models import Disease, Medicine, Consultation, Image

class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = ['id', 'name', 'category', 'description']

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'description']

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image']

class ConsultationSerializer(serializers.ModelSerializer):
    # Accept multiple images on create (write-only field)
    images = serializers.ListField(
        child=serializers.ImageField(write_only=True),
        write_only=True,
        required=False
    )
    # Nested or read-only fields for output
    predicted_disease = DiseaseSerializer(read_only=True)
    recommended_medicines = MedicineSerializer(many=True, read_only=True)

    class Meta:
        model = Consultation
        fields = [
            'id', 'symptom_text', 'images',
            'predicted_disease', 'recommended_medicines',
            'created_at'
        ]
        read_only_fields = ('id', 'predicted_disease', 'recommended_medicines', 'created_at')

    def create(self, validated_data):
        # Pop out images data before creating Consultation
        images_data = validated_data.pop('images', [])
        consultation = Consultation.objects.create(**validated_data)
        # Save uploaded images to the Image model
        for image_file in images_data:
            Image.objects.create(consultation=consultation, image=image_file)
        return consultation
