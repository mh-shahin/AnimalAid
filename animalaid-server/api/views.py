from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class GetItemsView(APIView):
    def get(self, request):
        # Simulate fetching items from a database or other source
        items = [
            {"id": 1, "name": "Mouse"},
            {"id": 2, "name": "Keyboard"},
            {"id": 3, "name": "Monitor"},
        ]
        return Response(items, status=status.HTTP_200_OK)
    
from rest_framework.decorators import api_view
from .models import animalaid_db
from .serializers import AnimalAidSerializer

@api_view(['GET'])
def get_animals(request):
    animals = animalaid_db.objects.all()
    serializer = AnimalAidSerializer(animals, many=True)
    return Response(serializer.data)
