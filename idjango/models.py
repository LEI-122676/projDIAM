from django.db import models
from django.contrib.auth.models import User
import os

# Create your models here.
class Ingrediente(models.Model):
    nome = models.CharField(max_length=50)

    def __str__(self):
        return self.nome

class Evento(models.Model):
    criador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='eventos_criados')
    participantes = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='eventos_inscritos', null=True)

    nome = models.CharField(max_length=50)
    data = models.DateTimeField(auto_now_add=True)
    descricao = models.TextField()
    capacidade_max = models.IntegerField(default=int(os.environ.get('EVENTO_CAPACIDADE_MAX_DEFAULT', 30)))

    def __str__(self):
        return self.nome

class Comentario(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE)

    texto = models.TextField()
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Utilizador: {self.utilizador}\nTexto:{self.texto}"

class Receita(models.Model):
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    comentarios = models.ForeignKey(Comentario, on_delete=models.DO_NOTHING, null=True)
    ingredientes = models.ManyToManyField(Ingrediente)

    nome = models.CharField(max_length=50)
    instrucao = models.TextField(default=os.environ.get('RECEITA_INSTRUCAO_DEFAULT', ''))
    classificacao = models.FloatField(default=float(os.environ.get('RECEITA_CLASSIFICACAO_DEFAULT', 0.0)))

    def __str__ (self):
        return self.nome

class Utilizador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)       # "extends"
    eventos = models.ManyToManyField(Evento)
    receitas = models.ManyToManyField(Receita)

    def __str__ (self):
        return self.utilizador.email

class Frigorifico(models.Model):
    utilizador = models.OneToOneField(Utilizador, on_delete=models.CASCADE)
    ingredientes = models.ManyToManyField(Ingrediente)