import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'idjango.settings')
django.setup()
from django.contrib.auth.models import User, Group

user = User.objects.get(username='admin')
admin_group, created = Group.objects.get_or_create(name='Admin')
user.groups.add(admin_group)
user.is_staff = True
user.is_superuser = True
user.save()
print(f'User {user.username} is now in groups: {[g.name for g in user.groups.all()]}')
