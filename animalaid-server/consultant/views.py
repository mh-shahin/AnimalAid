import json, traceback
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Consultation
from .serializers import ConsultationSerializer
from .utils import analyze_with_hf

@api_view(['POST', 'GET'])
@parser_classes([MultiPartParser, FormParser])
def analyze_consultation(request):
    
    if request.method == 'GET':
        # Return all consultations or latest one
        consultations = Consultation.objects.all().order_by('-created_at')
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    try:
        animal_type = request.data.get('animal_type')
        description = request.data.get('description')

        # Accept up to 3 images named image1, image2, image3
        images = []
        for i in range(1, 4):
            f = request.FILES.get(f"image{i}")
            if f is not None:
                images.append(f)

        # Validate
        if not animal_type or not description:
            return Response({"error": "animal_type and description are required."}, status=status.HTTP_400_BAD_REQUEST)
        if len(images) == 0:
            return Response({"error": "Please upload at least one image."}, status=status.HTTP_400_BAD_REQUEST)
        if len(images) > 3:
            return Response({"error": "Maximum 3 images allowed."}, status=status.HTTP_400_BAD_REQUEST)

        # Call Hugging Face analysis (may raise)
        try:
            analysis = analyze_with_hf(description=description, animal_type=animal_type, image_files=images)
        except Exception as ai_err:
            # Return AI error and raw trace to help debugging
            tb = traceback.format_exc()
            return Response({"error": "AI analysis failed", "detail": str(ai_err), "trace": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save consultation
        cons = Consultation(
            animal_type=animal_type,
            description=description,
            result=analysis
        )
        if len(images) > 0:
            cons.image1 = images[0]
        if len(images) > 1:
            cons.image2 = images[1]
        if len(images) > 2:
            cons.image3 = images[2]
        cons.save()

        serializer = ConsultationSerializer(cons)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as exc:
        tb = traceback.format_exc()
        return Response({"error": "Internal server error", "detail": str(exc), "trace": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
