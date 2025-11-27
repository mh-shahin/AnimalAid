# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsStaticAdmin(BasePermission):
    """
    Allow access if JWT token has 'role' == 'admin' OR header Role: admin.
    """

    def has_permission(self, request, view):
        # header
        role_header = request.headers.get('Role') or request.headers.get('role')
        if role_header and role_header.lower() == 'admin':
            return True

        # token claims (Simple JWT stores claims in request.user if user exists; custom claims are in token)
        # Simple JWT populates request.auth (token) for JWTAuthentication
        token = getattr(request, "auth", None)
        if token:
            # token might be a sliding token object; treat as dict-like
            try:
                claim_role = token.get("role", None)
                if claim_role == "admin":
                    return True
            except Exception:
                pass

        # finally, allow if user is staff/superuser
        user = getattr(request, "user", None)
        if user and user.is_authenticated and (user.is_staff or user.is_superuser):
            return True

        return False
