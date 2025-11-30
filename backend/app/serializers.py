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

# Dream profile serializer
class DreamProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'bio', 'username', 'email', 'created_at']


class DreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dream
        fields = ['id', 'title', 'content','mood','tags','is_public','created_at']

class DreamReactionSerializer(serializers.Serializer):
    count = serializers.IntegerField()

class PublicDreamSerializer(serializers.ModelSerializer):
    profiles = DreamProfileSerializer(source="user.profile")  
    reactions = serializers.SerializerMethodField()

    class Meta:
        model = Dream
        fields = [
            "id",
            "title",
            "content",
            "mood",
            "tags",
            "created_at",
            "profiles",
            "reactions",
        ]

    def get_reactions(self, obj):
        return [{"count": obj.reactions.filter(reaction_type="heart").count()}]


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['username', 'full_name', 'bio', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_full_name(self, value):
        """Validate full_name length"""
        if value and len(value) > 255:
            raise serializers.ValidationError("Full name cannot exceed 255 characters")
        return value