from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('idjango', '0002_remove_receita_classificacao_and_more'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name='evento',
                    name='data',
                    field=models.DateTimeField(auto_now_add=True),
                ),
            ],
        ),
    ]
