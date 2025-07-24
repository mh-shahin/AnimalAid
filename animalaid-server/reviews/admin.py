from django.contrib import admin
from .models import MedicineReview, FeedReview

@admin.register(MedicineReview)
class MedicineReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'medicine', 'rating', 'short_text', 'created_at')
    list_filter = ('medicine', 'rating', 'created_at')
    search_fields = ('user__username', 'medicine__name', 'text')
    ordering = ('-created_at',)

@admin.register(FeedReview)
class FeedReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'feed', 'rating', 'short_text', 'created_at')
    list_filter = ('feed', 'rating', 'created_at')
    search_fields = ('user__username', 'feed__name', 'text')
    ordering = ('-created_at',)
