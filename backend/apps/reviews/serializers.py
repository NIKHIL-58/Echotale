from rest_framework import serializers
class ReviewSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True)
def review_to_dict(r):
    return {'id': str(r.id), 'user_id': r.user_id, 'story_id': r.story_id, 'rating': r.rating, 'comment': r.comment, 'created_at': r.created_at.isoformat()}
