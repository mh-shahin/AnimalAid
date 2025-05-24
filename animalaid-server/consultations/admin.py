from django.contrib import admin
from .models import Disease, Medicine, Consultation, Image

@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    search_fields = ('name',)

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    filter_horizontal = ('diseases',)

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('id', 'predicted_disease', 'created_at')
    list_filter = ('predicted_disease',)

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'consultation')
