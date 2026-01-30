Instrucciones rápidas (PowerShell):

# Crear entorno virtual e instalar dependencias
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

Nota: este proyecto requiere Python 3.10+ para instalar las dependencias listadas. Si tienes una versión de Python más antigua, actualiza a 3.10 o superior.

Hardening para producción (resumen):

- No subir `.env` al repositorio. Usa variables de entorno gestionadas por tu plataforma (Docker secrets, orquestador o CI/CD).
- En `settings.py` para producción establece:
	- `DEBUG=False`
	- `ALLOWED_HOSTS` con los hosts exactos
	- `SECURE_SSL_REDIRECT=True`
	- `SESSION_COOKIE_SECURE=True`
	- `CSRF_COOKIE_SECURE=True`
	- `SECURE_HSTS_SECONDS` a un valor alto (ej. `31536000`)
- Configura un almacén seguro para `SECRET_KEY` (no usar la de `.env.example`).
- Considerar usar HTTPS con un proxy/reverse (nginx) y configurar cabeceras seguras.
- Añadir logging y monitorización de errores.


# Crear un archivo .env (puedes basarte en .env.example)
copy .env.example .env
REM Edita .env y cambia SECRET_KEY en producción

# Migrar y arrancar el servidor
python manage.py migrate
python manage.py runserver

Nota sobre CORS/CSRF:
- En desarrollo `CORS_ALLOWED_ORIGINS` está configurado por defecto para `http://localhost:5173`.
- Si el frontend corre en otro origen, añade dicho origen en el `.env` (variable `CORS_ALLOWED_ORIGINS`, separada por comas).

La API estará disponible en http://127.0.0.1:8000/api/hello/
 
CRUD Personas:

1. Crear migraciones y aplicar:

```powershell
python manage.py makemigrations api
python manage.py migrate
```

2. Crear un superusuario para acceder al admin:

```powershell
python manage.py createsuperuser
```

3. Endpoints:
- `GET /api/persons/` - listar
- `POST /api/persons/` - crear
- `GET /api/persons/{id}/` - detalle
- `PUT/PATCH /api/persons/{id}/` - actualizar
- `DELETE /api/persons/{id}/` - eliminar

