from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
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
    frigorifico = models.OneToOneField(Frigorifico, on_delete=models.DO_NOTHING, null=True)
    imagem = models.ImageField(upload_to='profile_pics', default='default.png')
    bio = models.TextField(null=True)
    
    def __str__(self):
        return self.user.email

class Evento(models.Model):
    criador = models.ForeignKey(Utilizador, on_delete=models.CASCADE, related_name='eventos_criados')
    inscritos = models.ManyToManyField(Utilizador, related_name='eventos_inscritos')
    
    nome = models.CharField(max_length=50)
    fotos = models.JSONField()
    horario = models.JSONField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_evento = models.DateTimeField()
    descricao = models.TextField()
    capacidade_max = models.IntegerField(default=int(os.environ.get('EVENTO_CAPACIDADE_MAX_DEFAULT', 30)), validators=[MinValueValidator(5)])

    def clean(self):
        super().clean()
        if self.data_evento and self.data_evento <= timezone.now():
            raise ValidationError({'data_evento': 'A data do evento deve ser no futuro.'})

    def __str__(self):
        return self.nome

class Receita(models.Model):
    criador = models.ForeignKey(Utilizador, on_delete=models.CASCADE, related_name='criador_receita')
    ingredientes = models.ManyToManyField(Ingrediente)
    guardadores = models.ManyToManyField(Utilizador, related_name='receitas_guardadas')      # Pessoas que guardaram esta receita

    nome = models.CharField(max_length=50)
    foto = models.ImageField()
    instrucao = models.JSONField(default=list)
    classificacao = models.FloatField(default=float(os.environ.get('RECEITA_CLASSIFICACAO_DEFAULT', 0.0)), validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])

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