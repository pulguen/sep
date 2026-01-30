from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import permissions
from .models import Person
from .serializers import PersonSerializer

@api_view(['GET'])
def hello(request):
    """Simple endpoint de prueba"""
    return Response({'message': 'Hola desde Django REST Framework'})


class PersonViewSet(viewsets.ModelViewSet):
    """CRUD para Person"""
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    # lectura anónima, crear/editar/eliminar requieren autenticación
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
