from django.db import models
from django.conf import settings


class Person(models.Model):
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('transferred', 'Trasladado'),
        ('released', 'Liberado'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    dni = models.CharField(max_length=20, unique=True)
    legajo = models.CharField(max_length=30, unique=True)
    unit = models.CharField(max_length=120, blank=True)
    sentence_years = models.IntegerField(null=True, blank=True)
    admission_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Creación'),
        ('update', 'Actualización'),
        ('delete', 'Eliminación'),
    ]

    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    person = models.ForeignKey(Person, null=True, blank=True, on_delete=models.SET_NULL)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    ip_address = models.CharField(max_length=45, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} - {self.person_id} - {self.created_at}"
