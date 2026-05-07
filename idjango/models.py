from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Ingrediente(models.Model):
    nome = models.CharField(max_length=50)

class Evento(models.Model):
    nome = models.CharField(max_length=50)
    criador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='eventos_criados')
    data = models.DateField()
    descricao = models.TextField()
    participantes = models.ForeignKey(User, on_delete=models.CASCADE, related_name='eventos_inscritos')

class Receita(models.Model):
    nome = models.CharField(max_length=50)
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    instrucao = models.TextField()
    ingredientes = models.ManyToManyField(Ingrediente)

class Frigorifico(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    ingredientes = models.ManyToManyField(Ingrediente)

class Utilizador(models.Model):
    utilizador = models.OneToOneField(User, on_delete=models.CASCADE)       # "extends"
    eventos = models.ManyToManyField(Evento, on_delte=models.DO_NOTHING)
    receitas = models.ManyToManyField(Receita, on_delete=models.DO_NOTHING)
