from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import permissions
from .models import Person, AuditLog
from .serializers import PersonSerializer, AuditLogSerializer


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

    def _get_ip(self, request):
        return request.META.get('REMOTE_ADDR', '')

    def perform_create(self, serializer):
        person = serializer.save()
        AuditLog.objects.create(
            action='create',
            person=person,
            actor=self.request.user if self.request.user.is_authenticated else None,
            ip_address=self._get_ip(self.request),
        )

    def perform_update(self, serializer):
        person = serializer.save()
        AuditLog.objects.create(
            action='update',
            person=person,
            actor=self.request.user if self.request.user.is_authenticated else None,
            ip_address=self._get_ip(self.request),
        )

    def perform_destroy(self, instance):
        AuditLog.objects.create(
            action='delete',
            person=instance,
            actor=self.request.user if self.request.user.is_authenticated else None,
            ip_address=self._get_ip(self.request),
        )
        instance.delete()


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('actor', 'person').all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        action = self.request.query_params.get('action')
        actor = self.request.query_params.get('actor')
        date_from = self.request.query_params.get('from')
        date_to = self.request.query_params.get('to')

        if action:
            qs = qs.filter(action=action)
        if actor:
            qs = qs.filter(actor__username__icontains=actor)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs
