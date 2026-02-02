from rest_framework import serializers
from .models import Person, AuditLog


class PersonSerializer(serializers.ModelSerializer):
	class Meta:
		model = Person
		fields = ['id', 'first_name', 'last_name', 'email', 'dni', 'legajo', 'unit', 'sentence_years', 'admission_date', 'status', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
	actor_username = serializers.CharField(source='actor.username', read_only=True)
	person_name = serializers.SerializerMethodField()

	class Meta:
		model = AuditLog
		fields = ['id', 'action', 'person', 'person_name', 'actor_username', 'ip_address', 'created_at']

	def get_person_name(self, obj):
		if not obj.person:
			return None
		return f"{obj.person.first_name} {obj.person.last_name}".strip()

