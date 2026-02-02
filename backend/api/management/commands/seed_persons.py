from django.core.management.base import BaseCommand
from api.models import Person


class Command(BaseCommand):
    help = "Carga personas ficticias para pruebas"

    def handle(self, *args, **options):
        samples = [
            ("Mariana", "Gonzalez", "mariana.gonzalez@test.local", "30123456", "LEG-000101", "Unidad 1", 6, "2022-03-14", "active"),
            ("Ricardo", "Lopez", "ricardo.lopez@test.local", "28999888", "LEG-000102", "Unidad 2", 4, "2021-11-02", "transferred"),
            ("Carla", "Sosa", "carla.sosa@test.local", "32444555", "LEG-000103", "Unidad 3", 2, "2023-01-22", "active"),
            ("Nicolas", "Perez", "nicolas.perez@test.local", "33555777", "LEG-000104", "Unidad 1", 10, "2019-08-10", "released"),
            ("Lucia", "Martinez", "lucia.martinez@test.local", "29888777", "LEG-000105", "Unidad 4", 7, "2020-06-05", "active"),
            ("Juan", "Suarez", "juan.suarez@test.local", "31011222", "LEG-000106", "Unidad 2", 3, "2024-02-18", "transferred"),
        ]

        created = 0
        for first, last, email, dni, legajo, unit, years, admission, status in samples:
            obj, was_created = Person.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "dni": dni,
                    "legajo": legajo,
                    "unit": unit,
                    "sentence_years": years,
                    "admission_date": admission,
                    "status": status,
                },
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Personas creadas: {created}"))
