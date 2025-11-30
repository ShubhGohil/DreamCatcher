# from django.shortcuts import render
# from django.utils.timezone import now
# from django.db.models import Count
# from django.db.models.functions import TruncDate
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from datetime import timedelta

from .models import Profile, Dream

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .serializers import RegisterSerializer, LoginSerializer, ProfileSerializer, MeSerializer, DreamSerializer


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


# def analytics(req):

#     # Authenticate user using the auth table
#     token = req.headers.get("Authorization") 

#     # If no token provided user is not authenticated and status code 401
#     if not token:
#         return JsonResponse({"error": "Missing Authorization token"}, status=401)
    
#     try:
#         auth = AuthTable.objects.get(key=token) # this AuthTable links the token to Django user, if invalid -> 401
#         user = auth.user
#     except AuthTable.DoesNotExist:
#         return JsonResponse({"error": "Invalid token"}, status = 401)
    
#     # All dreams by this particular user

#     dreams = Dream.objects.filter(user=user)

#     # counting total number of dreams 

#     total_dreams = dreams.count()

#     # the dreams that were created and iput by the user this month

#     now_dt = now()
#     this_month_count = dreams.filter(
#         created_at__year = now_dt.year,
#         created_at__month = now_dt.month
#     ).count()

#     # most Common mood by the user after watching the dream
#     # Groups all dreams by mood and counts dreams per mood
#     mood_counts = dreams.values("mood").annotate(count=Count("mood")).order_by("-count")
#     most_common_mood = mood_counts[0]["mood"] if mood_counts else None

#     # Tags - Tags is a JSON list -> so flatten it manually

#     from collections import Counter

#     all_tags = [] # create an empty list to store the tags

#     for d in dreams:
#         if isinstance(d.tags, list):
#             all_tags.extend(d.tags)

#     # count the frequency of each tag 

#     tag_counter = Counter(all_tags) # freq of the tags
#     top_tags = [{
#         "tag": tag, 
#         "count": count
#         } for tag, count in tag_counter.most_common()]
    
#     # Mood distribution of user as per the mood counts earlier

#     mood_dist = [
#         {"mood": m["mood"],
#          "count": m["count"]
#         } for m in mood_counts
#     ]


#     # Recent Activity of the user (Last 14 days)

#     # computer the start date

#     start_date = now_dt - timedelta(days=13)

#     # Querying dreams group by day

#     date_counts = (
#         dreams.filter(created_at__date__gte=start_date.date())
#         .annotate(day=TruncDate("created_at"))
#         .values("day")
#         .annotate(count=Count("id"))
#         .order_by("day")
#     )

#     # Convert to list of date + count for each day in last 14 days
#     daily_map = {entry["day"]: entry["count"] for entry in date_counts} 

#     # Build a 14 days list, include the empty days
#     recent_activity = []
#     for i in range(14):
#         day = (start_date + timedelta(days=i)).date()
#         recent_activity.append({
#             "date": str(day),
#             "count": daily_map.get(day, 0)
#         })

#     # now return the JSON response

#     return JsonResponse({
#         "totalDreams": total_dreams,
#         "thisMonth": this_month_count,
#         "mostCommonMood": most_common_mood,
#         "topTags": top_tags,
#         "moodDistribution": mood_dist,
#         "recentActivity": recent_activity
#     }, status=200)


    

# c5583923c9447f3a912045569ac686ab7db1572f
