from rest_framework import serializers
from .models import Ingrediente, Evento, Receita, Frigorifico, Utilizador, Comentario

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = '__all__'

class EventoSerializer(serializers.ModelSerializer):
    inscritos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Utilizador.objects.all(),
        required=False
    )
    
    class Meta:
        model = Evento
        fields = '__all__'

class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = '__all__'

class ReceitaSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField(read_only=True)
    ingredientes = serializers.PrimaryKeyRelatedField(many=True, queryset=Ingrediente.objects.all(), required=False)
    guardadores = serializers.PrimaryKeyRelatedField(many=True, queryset=Utilizador.objects.all(), required=False)
    foto = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Receita
        fields = '__all__'

    def get_foto_url(self, obj):
        if obj.foto:
            return obj.foto.url  # ex: /idjango/media/receitas/foto.jpg
        return None

class FrigorificoSerializer(serializers.ModelSerializer):
    ingredientes = serializers.PrimaryKeyRelatedField(many=True, queryset=Ingrediente.objects.all(), required=False)

    class Meta:
        model = Frigorifico
        fields = '__all__'

class UtilizadorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Utilizador
        fields = '__all__'
