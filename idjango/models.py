from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
import os
import json
from .moderator import FIELD_LIMITS


# Create your models here.
class Ingrediente(models.Model):
    nome = models.CharField(max_length=FIELD_LIMITS.get('ingrediente_nome_max_length', 50))
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

class Frigorifico(models.Model):
    ingredientes = models.ManyToManyField(Ingrediente)
    is_active = models.BooleanField(default=True)

class Utilizador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    frigorifico = models.OneToOneField(Frigorifico, on_delete=models.DO_NOTHING)
    
    imagem = models.ImageField(upload_to='profile_pics', default='defaultProfile.svg')
    bio = models.TextField(null=True)
    cookie_clicks = models.IntegerField(default=0)

    _roles_file = os.environ.get('UTILIZADOR_ROLES_FILE', 'user_roles.json')
    _roles_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), _roles_file)
    try:
        with open(_roles_path, 'r') as f:
            _roles_data = json.load(f)
        ROLES = tuple((r, r) for r in _roles_data.get('ROLES', []))
    except (FileNotFoundError, json.JSONDecodeError):
        ROLES = (('Admin', 'Admin'), ('User', 'User'), ('Guest', 'Guest'), ('EventOrganizer', 'EventOrganizer'))

    role = models.CharField(max_length=20, choices=ROLES, default='User')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.user.email

class Evento(models.Model):
    criador = models.ForeignKey(Utilizador, on_delete=models.CASCADE, related_name='eventos_criados')
    inscritos = models.ManyToManyField(Utilizador, related_name='eventos_inscritos', blank = True)

    nome = models.CharField(max_length=FIELD_LIMITS.get('evento_nome_max_length', 50))
    foto = models.ImageField(upload_to='Event_pics', default='defaultEvent.png')
    horario = models.JSONField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    data = models.DateTimeField(auto_now_add=True)
    data_evento = models.DateTimeField()
    descricao = models.TextField()
    capacidade_max = models.IntegerField(default=int(os.environ.get('EVENTO_CAPACIDADE_MAX_DEFAULT', 30)), validators=[MinValueValidator(5)])
    is_active = models.BooleanField(default=True)

    def clean(self):
        super().clean()
        if self.data_evento and self.data_evento.date() < timezone.now().date():
            raise ValidationError({'data_evento': 'A data do evento deve ser no futuro.'})

    def __str__(self):
        return self.nome

class Receita(models.Model):
    criador = models.ForeignKey(Utilizador, on_delete=models.CASCADE, related_name='criador_receita')
    ingredientes = models.ManyToManyField(Ingrediente)
    guardadores = models.ManyToManyField(Utilizador, related_name='receitas_guardadas', blank=True)
    nome = models.CharField(max_length=FIELD_LIMITS.get('receita_nome_max_length', 50))
    foto = models.ImageField(upload_to='recipe_pics', default='defaultRecipe.png')
    instrucao = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

class Avaliacao(models.Model):
    utilizador = models.ForeignKey(Utilizador, on_delete=models.CASCADE)
    receita = models.ForeignKey(Receita, on_delete=models.CASCADE, related_name='avaliacoes')
    nota = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.utilizador.nome} deu {self.nota}⭐ a {self.receita.nome}"

class Comentario(models.Model):
    utilizador = models.ForeignKey(Utilizador, on_delete=models.CASCADE)
    receita = models.ForeignKey(Receita, on_delete=models.DO_NOTHING, null=True)

    texto = models.TextField()
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Utilizador: {self.utilizador}\nTexto:{self.texto}"

class Feedback(models.Model):
    utilizador = models.ForeignKey(Utilizador, on_delete=models.CASCADE)
    
    nota_receitas = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    nota_eventos = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    nota_frigorifico = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    nota_estetica = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    FAVORITE_CHOICES = [
        ('Receitas', 'Receitas'),
        ('Eventos', 'Eventos'),
        ('Frigorifico', 'Frigorífico'),
        ('Estetica', 'Estética'),
    ]
    funcionalidade_favorita = models.CharField(max_length=20, choices=FAVORITE_CHOICES)
    comentario_livre = models.TextField(blank=True, null=True)
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback de {self.utilizador.user.username} ({self.data.strftime('%Y-%m-%d')})"