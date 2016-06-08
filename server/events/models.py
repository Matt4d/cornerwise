from django.db import models

# Create your models here.
class Event(models.Model):
    date = models.CharField(max_length=40)
    board = models.CharField(max_length=64)
    meeting_type = models.CharField(max_length=64)
    status = models.CharField(max_length=50)
    location = models.CharField(max_length=128)
    proposals = models.ManyToManyField("proposal.models.Proposal",
                                       related_name="proposals")
    
