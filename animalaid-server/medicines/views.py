from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Medicine
from .serializers import MedicineSerializer

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@parser_classes([MultiPartParser, FormParser])
def medicines_view(request):
    if request.method == 'GET':
        medicines = Medicine.objects.all().order_by('-created_at')
        serializer = MedicineSerializer(medicines, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = MedicineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        medicine_id = request.data.get('id')
        if not medicine_id:
            return Response({'error': 'ID is required for update'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            medicine = Medicine.objects.get(id=medicine_id)
        except Medicine.DoesNotExist:
            return Response({'error': 'Medicine not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MedicineSerializer(medicine, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        medicine_id = request.query_params.get('id')
        if not medicine_id:
            return Response({'error': 'ID is required to delete'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            medicine = Medicine.objects.get(id=medicine_id)
            medicine.delete()
            return Response({'message': 'Medicine deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Medicine.DoesNotExist:
            return Response({'error': 'Medicine not found'}, status=status.HTTP_404_NOT_FOUND)
