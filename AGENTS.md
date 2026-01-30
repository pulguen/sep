# AGENTS.md

## Contexto del proyecto
- Objetivo: sistema para gestionar datos de personas cumpliendo condena en distintas unidades.
- Dominio: datos sensibles (PII). No usar datos reales en ejemplos o pruebas.

## Stack (detectado)
- Backend: Django 4.2 + Django REST Framework + SimpleJWT + django-cors-headers.
- Frontend: React 18 + Vite + React Router + Axios.
- DB: SQLite (por defecto). luego de que este el mvp, cambiar a postgresql.
- Infra: Dockerfile en backend y frontend, docker-compose a nivel raiz.

## Estructura
- Backend: `backend/`
  - Proyecto Django: `backend/sep_backend/`
  - App principal: `backend/api/`
- Frontend: `frontend/`
  - Vite app en `frontend/src/`

## Backend (Django)
- Modelo principal: `Person` con `first_name`, `last_name`, `email` (unique), `created_at`.
- Endpoints REST (DRF ViewSet):
  - `GET /api/persons/` listar
  - `POST /api/persons/` crear
  - `GET /api/persons/{id}/` detalle
  - `PUT/PATCH /api/persons/{id}/` actualizar
  - `DELETE /api/persons/{id}/` eliminar
- Endpoint de prueba: `GET /api/hello/`
- Autenticacion JWT:
  - `POST /api/token/` (username/password)
  - `POST /api/token/refresh/` (refresh)
- Permisos: lectura anonima, escritura requiere autenticacion.

## Frontend (React)
- Rutas:
  - `/` home simple
  - `/login` login
  - `/persons` listado/alta/baja (protegida)
- Auth:
  - Usa JWT en `localStorage` (`token`, `refresh`)
  - Axios interceptor agrega `Authorization: Bearer <token>`
  - Refresh automatico al 401
  - `ProtectedRoute` depende del estado en memoria (se pierde al recargar)

## Configuracion (.env)
Variables esperadas en `backend/.env`:
- `SECRET_KEY`
- `DEBUG` (True/False)
- `ALLOWED_HOSTS` (coma separada)
- `CORS_ALLOWED_ORIGINS` (coma separada)
- `CORS_ALLOW_CREDENTIALS` (True/False)
- `SECURE_SSL_REDIRECT` (True/False)
- `SESSION_COOKIE_SECURE` (True/False)
- `CSRF_COOKIE_SECURE` (True/False)
- `SECURE_HSTS_SECONDS` (numero)

## Como ejecutar (completar)
- Backend:
  - Crear venv, instalar deps, migrar, correr server
  - Comandos exactos (PowerShell):
    - `python -m venv .venv`
    - `.\.venv\Scripts\Activate.ps1`
    - `pip install -r requirements.txt`
    - `python manage.py migrate`
    - `python manage.py runserver`
- Frontend:
  - Instalar deps y `npm run dev`
  - Comandos exactos (PowerShell):
    - `npm install` (o `yarn install`)
    - `npm run dev`
- Docker:
  - `docker compose up --build` (si aplica)

## Seguridad y datos sensibles
- No usar datos reales en ambientes de desarrollo o pruebas.
- Enmascarar o eliminar PII en logs, exports y capturas.
- Definir una politica de retencion y acceso minimo.
- Registrar auditoria de accesos y cambios.
- Usar HTTPS en entornos no locales.

## Roles y permisos (borrador)
- Admin: gestiona usuarios, permisos, catalogos y auditorias.
- Operador: alta/edicion de personas y movimientos.
- Consulta: solo lectura.
- Auditoria: lectura de logs y reportes.

## Entidades de dominio (borrador)
- Persona (interno): datos personales basicos.
- Unidad: establecimiento/unidad carcelaria.
- Condena: datos de sentencia, plazos, estado.
- Movimiento/Traslado: historial de cambios de unidad.
- Usuario/Rol: acceso al sistema.

## Despliegue (borrador)
- Variables por entorno via `.env` o secretos del orquestador.
- Base de datos: migrar a Postgres si hay multiusuario/produccion.
- Logging centralizado y backups de base de datos.

## Observaciones tecnicas
- En `frontend/src/pages/Login.jsx` se llama `login(form)` pero `login` espera `(username, password)`.
- `frontend` no persiste el usuario en memoria tras reload (solo tokens en localStorage).
- `backend/requirements.txt` repite `djangorestframework`.
- Texto en archivos con encoding no UTF-8 (tildes mal vistas).

## TODO / Por completar
- Definir entidades reales del dominio (unidades, condena, etc.).
- Definir roles y permisos (admin, operador, consulta, etc.).
- Definir politicas de retencion y auditoria.
- Ajustar DB a Postgres (si aplica).
- Completar despliegue y variables por entorno.

## Preguntas abiertas
- Stack definitivo (DB, hosting, auth externa?)
- Requisitos legales de tratamiento de datos (normativa local).
- Flujo de carga/consulta esperado (volumen, concurrencia).
