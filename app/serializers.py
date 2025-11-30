from rest_framework import serializers
from .models import Profile


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