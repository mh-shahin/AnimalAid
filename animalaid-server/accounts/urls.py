# accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginView, UserDetailView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='accounts-register'),
    path('login/', LoginView.as_view(), name='accounts-login'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('users/', UserListView.as_view(), name='user-list'),
]
