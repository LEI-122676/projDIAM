from django.db import models
from django.contrib.auth.models import User
import os

# Create your models here.
class Ingrediente(models.Model):
    nome = models.CharField(max_length=50)

    def __str__ (self):
        return self.nome

class Evento(models.Model):
    nome = models.CharField(max_length=50)
    criador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='eventos_criados', null=True)
    data = models.DateTimeField(auto_now_add=True)
    descricao = models.TextField(default=os.environ.get('EVENTO_DESCRICAO_DEFAULT', ''))
    participantes = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='eventos_inscritos', null=True)
    capacidade_max = models.IntegerField(default=int(os.environ.get('EVENTO_CAPACIDADE_MAX_DEFAULT', 30)))

    def __str__ (self):
        return self.nome

class Frigorifico(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    ingredientes = models.ManyToManyField(Ingrediente)

class Comentario(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    texto = models.TextField(default=os.environ.get('COMENTARIO_TEXTO_DEFAULT', ''))
    data = models.DateTimeField(auto_now_add=True)

class Receita(models.Model):
    nome = models.CharField(max_length=50, default=os.environ.get('RECEITA_NOME_DEFAULT', 'Receita Sem Nome'))
    autor = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    instrucao = models.TextField(default=os.environ.get('RECEITA_INSTRUCAO_DEFAULT', ''))
    ingredientes = models.ManyToManyField(Ingrediente)
    classificacao = models.FloatField(default=float(os.environ.get('RECEITA_CLASSIFICACAO_DEFAULT', 0.0)))
    comentarios = models.ForeignKey(Comentario, on_delete=models.DO_NOTHING, null=True)

    def __str__ (self):
        return self.nome

class Utilizador(models.Model):
    utilizador = models.OneToOneField(User, on_delete=models.CASCADE, null=True)       # "extends"
    eventos = models.ManyToManyField(Evento)
    receitas = models.ManyToManyField(Receita)

    def __str__ (self):
        return self.utilizador.email