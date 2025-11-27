from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Include URLs from the api app
    path('api/accounts/', include('accounts.urls')),  # include accounts app
    path('orders/', include('orders.urls')),  # include orders app
    path('medicines/', include('medicines.urls')),  # include medicines app
    path('feeds/', include('feeds.urls')),  # include feeds app
    path('reviews/', include('reviews.urls')),  # include reviews app
    path('consultant/', include('consultant.urls')),  # include consultant app
    path('api/blogs/', include('blogs.urls')),  # include blogs app
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
