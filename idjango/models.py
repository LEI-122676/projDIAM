from django.db import models
from django.contrib.auth.models import User
import os

# Create your models here.
class Ingrediente(models.Model):
    nome = models.CharField(max_length=50)

    def __str__(self):
        return self.nome

class Frigorifico(models.Model):
    ingredientes = models.ManyToManyField(Ingrediente) #Por ser ManyToManyField, nao precisamos de null=true

class Utilizador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)       # "extends"
    nome = models.CharField(max_length=50)
    apelido = models.CharField(max_length=50)
    frigorifico = models.OneToOneField(Frigorifico, on_delete=models.DO_NOTHING, null=True)
    imagem = models.ImageField(upload_to='profile_pics', default='defaultProfile.png')
    bio = models.TextField(null=True)
    
    def __str__(self):
        return self.user.email

class Evento(models.Model):
    criador = models.ForeignKey(Utilizador, on_delete=models.CASCADE, related_name='eventos_criados')
    inscritos = models.ManyToManyField(Utilizador, related_name='eventos_inscritos', blank = True)

    nome = models.CharField(max_length=50)
    foto = models.ImageField(upload_to='Event_pics', default='defaultEvent.png')
    horario = models.JSONField()
    data_evento = models.DateTimeField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    descricao = models.TextField()
    capacidade_max = models.IntegerField(default=int(os.environ.get('EVENTO_CAPACIDADE_MAX_DEFAULT', 30)))

    def __str__(self):
        return self.nome

class Receita(models.Model):
    criador = models.ForeignKey(Utilizador, on_delete=models.CASCADE, related_name='criador_receita')
    ingredientes = models.ManyToManyField(Ingrediente)
    guardadores = models.ManyToManyField(Utilizador, related_name='receitas_guardadas')      # Pessoas que guardaram esta receita

    nome = models.CharField(max_length=50)
    foto = models.ImageField(upload_to='recipe_pics', default='defaultRecipe.png')
    instrucao = models.JSONField(default=list)
    classificacao = models.FloatField(default=float(os.environ.get('RECEITA_CLASSIFICACAO_DEFAULT', 0.0)))

    def __str__(self):
        return self.nome

class Comentario(models.Model):
    utilizador = models.ForeignKey(Utilizador, on_delete=models.CASCADE)
    receita = models.ForeignKey(Receita, on_delete=models.DO_NOTHING, null=True)

    texto = models.TextField()
    data = models.DateTimeField(auto_now_add=True)
    # TODO - upvotes?

    def __str__(self):
        return f"Utilizador: {self.utilizador}\nTexto:{self.texto}"