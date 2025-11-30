from django.contrib.auth.models import User
from django.db import models
import uuid

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# Dreams model
class Dream(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dreams')
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    mood = models.CharField(max_length=50, null=True, blank=True)
    
    tags = models.JSONField(default=list, blank=True)
    
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# Dream Reaction model
class DreamReaction(models.Model):
    dream = models.ForeignKey(Dream, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=20, default='heart')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a user can only like a dream once
        unique_together = ('dream', 'user', 'reaction_type')
