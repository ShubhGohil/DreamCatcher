from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import Profile, Dream

User = get_user_model()

# Create the user register serializer

class RegisterSerializer(serializers.Serializer):
    # Takes in the username, email, password fields
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    # checks username validation
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value
    
    # checks user-email validation
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("email already registered")
        return value
    
    # finally creates the user 
    def create(self,validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email = validated_data['email'],
            password=validated_data['password']
        )
        Profile.objects.create(user=user)
        
        return user
    
# create the login serializer
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField() 
    password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):
                    data['user'] = user
                    return data
                raise serializers.ValidationError("Invalid Credentials")
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid Credentials")
        raise serializers.ValidationError("Both fields required")
            
# Me serializer

class MeSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

# profile serializer
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'bio', 'username', 'email', 'created_at']


class DreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dream
        fields = ['id', 'title', 'content','mood','tags','is_public','created_at']