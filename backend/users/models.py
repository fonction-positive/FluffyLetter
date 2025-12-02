from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

def user_avatar_path(instance, filename):
    # 文件将被上传到 MEDIA_ROOT/users/<uuid>/avatar/<filename>
    return f'users/{instance.id}/avatar/{filename}'

class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    avatar = models.ImageField(upload_to=user_avatar_path, null=True, blank=True)

    def __str__(self):
        return self.username
