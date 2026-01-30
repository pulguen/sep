from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Person


class PersonAPITest(APITestCase):
    def setUp(self):
        # crear dato inicial y usuario de prueba
        Person.objects.create(first_name='Test', last_name='User', email='test@example.com')
        User = get_user_model()
        self.user = User.objects.create_user(username='tester', password='pass')

    def test_list_persons(self):
        url = reverse('person-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_person(self):
        # autenticar el cliente para permitir creación (endpoints protegidos)
        self.client.force_authenticate(user=self.user)
        url = reverse('person-list')
        data = {'first_name': 'New', 'last_name': 'Person', 'email': 'new@example.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Person.objects.count(), 2)

    def test_update_and_delete_person(self):
        self.client.force_authenticate(user=self.user)
        person = Person.objects.create(first_name='Upd', last_name='Me', email='upd@example.com')
        url = reverse('person-detail', args=[person.id])
        data = {'first_name': 'Updated', 'last_name': 'Me', 'email': 'upd@example.com'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        person.refresh_from_db()
        self.assertEqual(person.first_name, 'Updated')

        # delete
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Person.objects.filter(id=person.id).exists())
