from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'persons', views.PersonViewSet)
router.register(r'audit-logs', views.AuditLogViewSet)

urlpatterns = [
    path('hello/', views.hello, name='hello'),
    path('', include(router.urls)),
]
