from .models import Profile, Dream, DreamReaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .serializers import RegisterSerializer, LoginSerializer, MeSerializer, DreamSerializer, PublicDreamSerializer, ProfileSerializer, AnalyticsSerializer
from django.utils.timezone import   now
from django.db.models import Count
from django.db.models.functions import TruncDate
from datetime import timedelta
from collections import Counter


from django.shortcuts import get_object_or_404

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            token = Token.objects.create(user=user)

            # profile, created = Profile.objects.create(user=user)

            return Response(
                {
                    "token": token.key,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                },
                status = status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        # print("Serializer: ", serializer)

        if serializer.is_valid():
            user = serializer.validated_data['user']

            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "token": token.key, # change this to auth_token.key
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                },
                status = status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogOutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.auth.delete()
            return Response(status=status.HTTP_200_OK)
        except (AttributeError, Exception):
            return Response(status=status.HTTP_200_OK)
        
class MeView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = MeSerializer(request.user.profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class DreamListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        dreams = Dream.objects.filter(user=request.user)
        serializer = DreamSerializer(dreams, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DreamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicDreamsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dreams = Dream.objects.filter(is_public=True).order_by("-created_at")
        serializer = PublicDreamSerializer(dreams, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DreamDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    # Helper method
    def get_object(self, pk, user):
        try:
            a = Dream.objects.get(id=pk, user=user)
            print(a)
            return Dream.objects.get(id=pk, user=user)
        except Dream.DoesNotExist:
            return None

    # PUT /dreams/<id>/
    def put(self, request, pk):
        dream = self.get_object(pk, request.user)
        if not dream:
            return Response({"error": "Dream not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DreamSerializer(dream, data=request.data, partial=True)
        print(serializer)
        if serializer.is_valid():
            serializer.save()    # user remains same
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE /dreams/<id>/
    def delete(self, request, pk):
        dream = self.get_object(pk, request.user)
        if not dream:
            return Response({"error": "Dream not found"}, status=status.HTTP_404_NOT_FOUND)

        dream.delete()
        return Response({"message": "Dream deleted"}, status=status.HTTP_204_NO_CONTENT)


class ToggleReactionView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):

        dream = Dream.objects.filter(pk=id).first()
        if not dream:
            return Response(
                {"error": "Dream not found or exist."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent reacting to private dreams
        if not dream.is_public:
            return Response(
                {"error": "You are not allowed to react to this dream."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if reaction already exists
        existing = DreamReaction.objects.filter(
            dream=dream,
            user=request.user,
            reaction_type="heart"
        ).first()

        if existing:
            # Remove reaction
            existing.delete()
            action = "unhearted"
        else:
            # Add new reaction
            DreamReaction.objects.create(
                dream=dream,
                user=request.user,
                reaction_type="heart"
            )
            action = "hearted"

        # Updated count
        heart_count = dream.reactions.filter(reaction_type="heart").count()

        return Response({
            "message": f"Dream {action} successfully",
            "heart_count": heart_count
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception:
            return Response(
                {'error': 'Failed to retrieve profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        try:
            profile, _ = Profile.objects.get_or_create(user=request.user)
        except Exception:
            return Response(
                {'error': 'Failed to retrieve profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnalyticsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        dreams = Dream.objects.filter(user=user)

        # Total dreams count
        total_dreams = dreams.count()

        # This month count
        now_dt = now()
        this_month_count = dreams.filter(
            created_at__year=now_dt.year,
            created_at__month=now_dt.month
        ).count()

        # Most common mood
        mood_counts = dreams.values('mood').annotate(count=Count('mood')).order_by('-count')
        most_common_mood = mood_counts[0]['mood'] if mood_counts else None

        # Top tags
        all_tags = []
        for d in dreams:
            if isinstance(d.tags, list):
                all_tags.extend(d.tags)
        tag_counter = Counter(all_tags)
        top_tags = [{'tag': tag, 'count': count} for tag, count in tag_counter.most_common()]

        # Mood distribution
        mood_dist = [{'mood': m['mood'], 'count': m['count']} for m in mood_counts]

        # recent activity
        start_date = now_dt - timedelta(days=13)
        date_counts = (dreams.filter(created_at__date__gte=start_date.date())
                       .annotate(day=TruncDate('created_at'))
                       .values('day')
                       .annotate(count=Count('id'))
                       .order_by('day'))
        daily_map = {entry['day']: entry['count'] for entry in date_counts}

        recent_activity = []
        for i in range(14):
            day = (start_date + timedelta(days=i)).date()
            recent_activity.append({
                'date': day,
                'count': daily_map.get(day, 0)
            })

        # Prepare response data
        data = {
            'totalDreams': total_dreams,
            'thisMonth': this_month_count,
            'mostCommonMood': most_common_mood,
            'topTags': top_tags,
            'moodDistribution': mood_dist,
            'recentActivity': recent_activity
        }

        serializer = AnalyticsSerializer(data)
        return Response(serializer.data, status=200)

    


