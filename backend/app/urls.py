from django.urls import path
from django.contrib imp
my_app = 'app'

urlpatterns = [
    path('', views.home, name='home'),
]