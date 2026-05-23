import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'idjango.settings')
django.setup()
from django.contrib.auth.models import User
from idjango.models import Utilizador

user = User.objects.get(username='admin')
utilizador = Utilizador.objects.get(user=user)
utilizador.role = 'Admin'
utilizador.save()
print(f'User {user.username} Utilizador role is now: {utilizador.role}')
