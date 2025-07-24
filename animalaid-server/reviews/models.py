from django.db import models
from django.contrib.auth import get_user_model
from medicines.models import Medicine
from feeds.models import Feed  # Assuming you have a feeds app

User = get_user_model()

# ⭐ Review for Medicines
class MedicineReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    text = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.rating}⭐ on {self.medicine.name}"

    @property
    def short_text(self):
        return self.text[:40] + '...' if len(self.text) > 40 else self.text


# ⭐ Review for Feeds
class FeedReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    feed = models.ForeignKey(Feed, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    text = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.rating}⭐ on {self.feed.name}"

    @property
    def short_text(self):
        return self.text[:40] + '...' if len(self.text) > 40 else self.text
