from rest_framework import serializers
from .models import Ingrediente, Evento, Receita, Frigorifico

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = ('id', 'nome')

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ('id', 'nome', 'criador', 'data', 'descricao', 'participantes')


class ReceitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receita
        fields = ('id', 'nome', 'autor', 'instrucao', 'ingredientes')

class FrigorificoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receita
        fields = ('id', 'usuario', 'ingredientes')