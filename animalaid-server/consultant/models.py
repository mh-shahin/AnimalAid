from django.db import models

class Consultation(models.Model):
    ANIMAL_CHOICES = [
        ('Poultry', 'Poultry'),
        ('Cow', 'Cow'),
        ('Bird', 'Bird'),
        ('Other', 'Other'),
    ]

    animal_type = models.CharField(max_length=50, choices=ANIMAL_CHOICES)
    description = models.TextField()
    image1 = models.ImageField(upload_to='consultations/', null=True, blank=True)
    image2 = models.ImageField(upload_to='consultations/', null=True, blank=True)
    image3 = models.ImageField(upload_to='consultations/', null=True, blank=True)
    result = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.animal_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
