from django.db import models
from django.contrib.auth.models import User
import os

# Create your models here.
class Ingrediente(models.Model):
    nome = models.CharField(max_length=50)

    def __str__(self):
        return self.nome

class Frigorifico(models.Model):
    ingredientes = models.ManyToManyField(Ingrediente, blank=True) #Por ser ManyToManyField, nao precisamos de null=true

class Utilizador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)       # "extends"
    frigorifico = models.OneToOneField(Frigorifico, on_delete=models.DO_NOTHING, null=True)
    imagem = models.ImageField(upload_to='profile_pics', default='default.png')
    bio = models.TextField(null=True)
    
    def __str__(self):
        return self.user.email

class Evento(models.Model):
    criador = models.ForeignKey(Utilizador, on_delete=models.CASCADE, related_name='eventos_criados')
    inscritos = models.ManyToManyField(Utilizador, related_name='eventos_inscritos', blank = True)

    nome = models.CharField(max_length=50)
    fotos = models.JSONField()
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
    guardadores = models.ManyToManyField(Utilizador, related_name='receitas_guardadas', blank=True)      # Pessoas que guardaram esta receita

    nome = models.CharField(max_length=50)
    foto = models.ImageField(null=True, blank=True)
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

class Avaliacao(models.Model):
    utilizador = models.ForeignKey(Utilizador, on_delete=models.CASCADE)
    receita = models.ForeignKey(Receita, on_delete=models.CASCADE, related_name='avaliacoes')
    valor = models.IntegerField() # 1 a 5

    class Meta:
        unique_together = ('utilizador', 'receita')

    def __str__(self):
        return f"{self.utilizador} -> {self.receita}: {self.valor}"