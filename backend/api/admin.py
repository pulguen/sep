from django.contrib import admin
from .models import Person, AuditLog


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'created_at')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'action', 'person', 'actor', 'ip_address', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')
