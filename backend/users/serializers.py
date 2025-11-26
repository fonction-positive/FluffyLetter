from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'avatar', 'date_joined', 'is_active', 'is_superuser')
        read_only_fields = ('email', 'role', 'date_joined', 'is_active', 'is_superuser')
    
    def validate_username(self, value):
        # 检查用户名是否已被其他用户使用
        user = self.context.get('request').user if self.context.get('request') else None
        if User.objects.filter(username=value).exclude(id=user.id if user else None).exists():
            raise serializers.ValidationError('该用户名已被使用')
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
