from django.urls import path
from . import views

app_name = 'idjango'
urlpatterns = [
    path('api/utilizadores/', views.utilizadores),
    path('api/utilizadores/<int:utilizador_id>', views.utilizador_detail),
    path('api/utilizadores/<int:utilizador_id>/frigorifico', views.utilizador_frigorifico),

    path('api/receitas/', views.receitas),
    path('api/receitas/<int:receita_id>', views.receita_detail),

    path('api/eventos/', views.eventos),
    path('api/eventos/<int:evento_id>', views.evento_detail),

    path('api/ingredientes/', views.ingredientes),
    path('api/ingredientes/<int:ingrediente_id>', views.ingrediente_detail),

    path('api/frigorificos/', views.frigorificos),
    path('api/frigorificos/<int:frigorifico_id>', views.frigorifico_detail),

    path('api/comentarios/', views.comentarios),
    path('api/comentarios/<int:comentario_id>', views.comentario_detail),

    path('api/signup/', views.signup),
    path('api/login/', views.login_view),
    path('api/logout/', views.logout_view),

    path('api/user/', views.user_view),
    path('api/user_view__Id/', views.user_view_Id),
]

