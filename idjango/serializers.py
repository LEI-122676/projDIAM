from rest_framework import serializers
from .models import Ingrediente, Evento, Receita, Frigorifico, Utilizador, Comentario

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = '__all__'

from django.utils import timezone

class EventoSerializer(serializers.ModelSerializer):
    inscritos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Utilizador.objects.all(),
        required=False
    )
    
    class Meta:
        model = Evento
        fields = '__all__'
        
    def validate_data_evento(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError("A data do evento deve ser no futuro.")
        return value

class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
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
