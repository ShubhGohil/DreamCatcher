from django.urls import path
from .views import LoginView, RegisterView, LogOutView, MeView, DreamListCreateAPIView, DreamDetailAPIView, PublicDreamsView, ToggleReactionView, ProfileView, AnalyticsView

urlpatterns = [
    path("analytics/", AnalyticsView.as_view(), name="analytics"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogOutView.as_view(), name="logout"),
    path("dreams/public/", PublicDreamsView.as_view()),
    path("dreams/", DreamListCreateAPIView.as_view()),
    path("dreams/<str:pk>/", DreamDetailAPIView.as_view(), name="dream-detail"),
    path("dreams/<uuid:id>/react/", ToggleReactionView.as_view()),
    path("auth/profile/", ProfileView.as_view())
]