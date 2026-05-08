from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Ingrediente(models.Model):
    nome = models.CharField(max_length=50)

    def __str__ (self):
        return self.nome

class Evento(models.Model):
    nome = models.CharField(max_length=50)
    criador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='eventos_criados')
    data = models.DateField()
    descricao = models.TextField()
    participantes = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='eventos_inscritos')
    capacidade_max = models.IntegerField()

    def __str__ (self):
        return self.nome

class Comentario(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE)
    texto = models.TextField()
    date = models.DateTimeField()

class Receita(models.Model):
    nome = models.CharField(max_length=50)
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    instrucao = models.TextField()
    ingredientes = models.ManyToManyField(Ingrediente)
    classificacao = models.FloatField()
    comentarios = models.ForeignKey(Comentario, on_delete=models.DO_NOTHING)

    def __str__ (self):
        return self.nome

class Utilizador(models.Model):
    utilizador = models.OneToOneField(User, on_delete=models.CASCADE)       # "extends"
    eventos = models.ManyToManyField(Evento)
    receitas = models.ManyToManyField(Receita)

    def __str__ (self):
        return self.utilizador.email

class Frigorifico(models.Model):
    usuario = models.OneToOneField(Utilizador, on_delete=models.CASCADE)
    ingredientes = models.ManyToManyField(Ingrediente)