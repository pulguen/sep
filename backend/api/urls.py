from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'persons', views.PersonViewSet)

urlpatterns = [
    path('hello/', views.hello, name='hello'),
    path('', include(router.urls)),
]
