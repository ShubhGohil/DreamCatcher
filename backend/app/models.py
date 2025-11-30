from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class CustomUser(AbstractUser):
    """
    Custom User model.
    Extending AbstractUser gives us all the fields of a normal User
    (username, password, email, first_name, last_name) plus
    any custom fields we want to add later.
    """

    # You can add custom fields here if needed, e.g.:
    # bio = models.TextField(blank=True)
    # dark_mode = models.BooleanField(default=False) # For "save preferences"

    def __str__(self):
        return self.username