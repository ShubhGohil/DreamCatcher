from django.urls import path
from .views import LoginView, RegisterView, LogOutView, MeView

urlpatterns = [
    # path("analytics/", analytics, name="analytics")
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogOutView.as_view(), name="logout"),
    # path("profile", ProfileView.as_view(), name="profile")
]