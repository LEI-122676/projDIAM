from rest_framework import serializers
from .models import Ingrediente, Evento, Receita, Frigorifico, Utilizador

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = '__all__'

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'

class ReceitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receita
        fields = '__all__'

class FrigorificoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Frigorifico
        fields = '__all__'

class UtilizadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilizador
        fields = '__all__'
