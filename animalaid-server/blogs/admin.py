from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'views', 'likes', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['title', 'excerpt', 'content', 'tags']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views', 'likes', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'category', 'status')
        }),
        ('Content', {
            'fields': ('excerpt', 'content', 'image', 'tags')
        }),
        ('Statistics', {
            'fields': ('views', 'likes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )