from django.db import models

class animalaid_db(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    health_status = models.TextField()

    def __str__(self):
        return self.name
