# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": "user"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        # Static admin check
        if email == settings.STATIC_ADMIN_EMAIL and password == settings.STATIC_ADMIN_PASSWORD:
            # create tokens for a fake admin user: we will create a token without DB user by making a lightweight token.
            # Simple JWT requires a user: create an anonymous token with no user info OR create a token for a pseudo user.
            # Simpler: return role admin with no tokens OR create a token with limited payload.
            refresh = RefreshToken()
            # add admin claims
            refresh['role'] = 'admin'
            refresh['email'] = email
            access = refresh.access_token
            access['role'] = 'admin'
            access['email'] = email
            return Response({
                "role": "admin",
                "email": email,
                "access": str(access),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)

        # Normal user login
        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "role": "user",
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_anonymous:
            return Response({
                "detail": "User is not authenticated",
                "isAuthenticated": False
            }, status=status.HTTP_200_OK)

        serializer = UserSerializer(request.user)
        return Response({
            "isAuthenticated": True,
            "user": serializer.data
        }, status=status.HTTP_200_OK)
