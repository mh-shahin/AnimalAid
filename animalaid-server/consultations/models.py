from django.db import models

class Disease(models.Model):
    CATEGORY_CHOICES = [
        ('livestock', 'Livestock'),
        ('poultry',   'Poultry'),
        ('dairy',     'Dairy'),
        ('cattle',    'Cattle'),
        ('fish',      'Fish'),
    ]
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Medicine(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    diseases = models.ManyToManyField(Disease, related_name='medicines')

    def __str__(self):
        return self.name

class Consultation(models.Model):
    symptom_text = models.TextField()
    predicted_disease = models.ForeignKey(Disease, null=True, blank=True, on_delete=models.SET_NULL)
    recommended_medicines = models.ManyToManyField(Medicine, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consultation {self.id} - {self.predicted_disease or 'Pending'}"

class Image(models.Model):
    consultation = models.ForeignKey(Consultation, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='consultation_images/')

    def __str__(self):
        return f"Image {self.id} for Consultation {self.consultation_id}"
