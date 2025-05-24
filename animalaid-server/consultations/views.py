from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Disease, Medicine, Consultation, Image
from .serializers import ConsultationSerializer, DiseaseSerializer, MedicineSerializer
from .ml_model import AnimalDiseaseModel
import tempfile

# Lazy initialization of the model
MODEL = None

class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all().order_by('-created_at')
    serializer_class = ConsultationSerializer

    def create(self, request, *args, **kwargs):
        global MODEL
        # Initialize the model only once after migrations are applied
        if MODEL is None:
            MODEL = AnimalDiseaseModel(num_classes=Disease.objects.count() or 1)

        # Use serializer to create Consultation and save images
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consultation = serializer.save()

        # Run model inference on the first image and symptom text
        images = consultation.images.all()
        if images and consultation.symptom_text:
            img = images[0].image

            # Save first image temporarily to pass to PIL
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                img.open('rb')
                temp_file.write(img.read())
                temp_path = temp_file.name

            # Predict disease name using ML model
            predicted_name = MODEL.predict(temp_path, consultation.symptom_text)
            if predicted_name:
                disease = Disease.objects.filter(name=predicted_name).first()
                if disease:
                    consultation.predicted_disease = disease
                    consultation.recommended_medicines.set(disease.medicines.all())
                    consultation.save()

        # Return serialized consultation with prediction
        result_serializer = self.get_serializer(consultation)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


class DiseaseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Disease.objects.all()
    serializer_class = DiseaseSerializer


class MedicineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
