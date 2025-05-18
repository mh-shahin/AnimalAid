from django.db import models

class api_test(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    health_status = models.TextField()

    class Meta:
        db_table = 'api_test'
    def __str__(self):
        return self.name
