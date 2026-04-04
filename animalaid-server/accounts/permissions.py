from rest_framework.permissions import BasePermission
import jwt
from django.conf import settings


class IsStaticAdmin(BasePermission):
    """
    Decodes the JWT manually (no user_id required).
    Allows access if token has role = 'admin'.
    Also allows DB staff/superuser as fallback.
    """

    def has_permission(self, request, view):

        # Step 1: Get the Authorization header
        auth_header = request.headers.get("Authorization", "")
        parts = auth_header.split()

        # Step 2: Must be "Bearer <token>"
        if len(parts) == 2 and parts[0].lower() == "bearer":
            raw_token = parts[1]

            try:
                # Step 3: Decode manually using Django SECRET_KEY
                # This does NOT require user_id in the token
                payload = jwt.decode(
                    raw_token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )

                # Step 4: Check role claim
                if payload.get("role") == "admin":
                    return True

            except jwt.ExpiredSignatureError:
                # Token has expired
                return False
            except jwt.InvalidTokenError:
                # Token is invalid
                return False

        # Step 5: Fallback for DB staff/superuser
        user = getattr(request, "user", None)
        if user and user.is_authenticated and (user.is_staff or user.is_superuser):
            return True

        return False