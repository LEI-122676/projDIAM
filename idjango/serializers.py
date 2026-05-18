from django.db.models import Avg
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

from rest_framework import serializers
from .models import Receita, Avaliacao
from django.db.models import Avg

class ReceitaSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()
    classificacao = serializers.SerializerMethodField() # O React vai ler isto aqui!
    guardadores = serializers.PrimaryKeyRelatedField(many=True, queryset=Utilizador.objects.all(), required=False)

    class Meta:
        model = Receita
        fields = '__all__'

    def get_foto_url(self, obj):
        return obj.foto.url if obj.foto else None

    def get_classificacao(self, obj):
        media = Avaliacao.objects.filter(receita=obj).aggregate(Avg('nota'))['nota__avg']
        return round(media, 1) if media else 0.0

class FrigorificoSerializer(serializers.ModelSerializer):
    ingredientes = serializers.PrimaryKeyRelatedField(many=True,queryset=Ingrediente.objects.all(),required=False,allow_empty=True)

    class Meta:
        model = Frigorifico
        fields = '__all__'

class UtilizadorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Utilizador
        fields = '__all__'
