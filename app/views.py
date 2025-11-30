from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Profile
from .serializers import ProfileSerializer

User = get_user_model()


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    GET /auth/profile/: Returns the current user's profile data (username, bio, full name).
    PUT /auth/profile/: Updates the user's profile fields (bio, full name).
    """
    try:
        # Get or create profile for the current user
        profile, created = Profile.objects.get_or_create(user=request.user)
    except Exception as e:
        return Response(
            {'error': 'Failed to retrieve profile'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)