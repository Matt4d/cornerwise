# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('proposal', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Changeset',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('change_blob', models.BinaryField()),
                ('proposal', models.ForeignKey(to='proposal.Proposal', related_name='changes')),
            ],
        ),
        migrations.RemoveField(
            model_name='change',
            name='proposal',
        ),
        migrations.AlterField(
            model_name='attribute',
            name='handle',
            field=models.CharField(db_index=True, max_length=128, unique=True),
        ),
        migrations.DeleteModel(
            name='Change',
        ),
    ]
