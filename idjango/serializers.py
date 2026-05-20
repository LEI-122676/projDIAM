from django.db.models import Avg
from rest_framework import serializers
from .models import Ingrediente, Evento, Receita, Frigorifico, Utilizador, Comentario
from .moderator import validar_texto
from .models import Ingrediente, Evento, Receita, Frigorifico, Utilizador, Comentario, User

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
        read_only_fields = ['data', 'data_criacao']

    def validate_data_evento(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError("A data do evento deve ser no futuro.")
        return value

    def validate_nome(self, value):
        return validar_texto(value, "nome do evento")

    def validate_descricao(self, value):
        return validar_texto(value, "descrição do evento")

class ComentarioSerializer(serializers.ModelSerializer):
    utilizador_nome = serializers.SerializerMethodField()

    class Meta:
        model = Comentario
        fields = '__all__'

    def get_utilizador_nome(self, obj):
        if obj.utilizador and obj.utilizador.user:
            user_obj = obj.utilizador.user
            nome_completo = f"{user_obj.first_name} {user_obj.last_name}".strip()
            return nome_completo if nome_completo else user_obj.username
        return "Utilizador Desconhecido"

    def validate_texto(self, value):
        return validar_texto(value, "texto do comentário")

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

    def validate_nome(self, value):
        return validar_texto(value, "nome da receita")

    def validate_instrucao(self, value):
        if isinstance(value, list):
            for i, passo in enumerate(value):
                if isinstance(passo, str):
                    validar_texto(passo, f"instrução (passo {i+1})")
        return value

class FrigorificoSerializer(serializers.ModelSerializer):
    ingredientes = serializers.PrimaryKeyRelatedField(many=True,queryset=Ingrediente.objects.all(),required=False,allow_empty=True)

    class Meta:
        model = Frigorifico
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']

class UtilizadorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Utilizador
        fields = '__all__'

    def validate_bio(self, value):
        return validar_texto(value, "biografia")
