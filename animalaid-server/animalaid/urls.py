from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Include URLs from the api app
    path('medicines/', include('medicines.urls')),  # include medicines app
    path('feeds/', include('feeds.urls')),  # include feeds app
    # path('consultations/', include('consultations.urls')),  # include consultations app
    path('reviews/', include('reviews.urls')),  # include reviews app
    path('consultant/', include('consultant.urls')),  # include consultant app
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
