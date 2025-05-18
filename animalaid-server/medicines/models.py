from django.db import models

class Medicine(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    quantity = models.IntegerField()
    unit = models.CharField(max_length=20)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='medicine_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    