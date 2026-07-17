from datetime import datetime

from bson import ObjectId
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from common.response import error, success
from apps.reviews.models import ReviewDocument
from apps.reviews.serializers import ReviewSerializer, review_to_dict
from apps.stories.models import StoryDocument


def update_story_rating(story_id):
    story = StoryDocument.objects(id=story_id).first()
    if not story:
        return
    reviews = list(ReviewDocument.objects(story_id=story_id))
    story.total_reviews = len(reviews)
    story.rating = (
        round(sum(review.rating for review in reviews) / len(reviews), 2)
        if reviews
        else 0
    )
    story.save()


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def story_reviews(request, story_id):
    if not ObjectId.is_valid(story_id):
        return error('Invalid story id', 400)
    if not StoryDocument.objects(id=story_id, status='published').first():
        return error('Story not found', 404)

    if request.method == 'GET':
        reviews = ReviewDocument.objects(story_id=story_id).order_by('-created_at')
        return success([review_to_dict(review) for review in reviews])

    if not request.user or not request.user.is_authenticated:
        return error('Authentication required', 401)

    serializer = ReviewSerializer(data=request.data)
    if not serializer.is_valid():
        return error('Validation failed', errors=serializer.errors)

    review = ReviewDocument.objects(
        user_id=request.user.id,
        story_id=story_id,
    ).first()
    created = review is None
    if not review:
        review = ReviewDocument(user_id=request.user.id, story_id=story_id)
    review.rating = serializer.validated_data['rating']
    review.comment = serializer.validated_data.get('comment', '')
    review.updated_at = datetime.utcnow()
    review.save()
    update_story_rating(story_id)
    return success(
        review_to_dict(review),
        'Review added' if created else 'Review updated',
        201 if created else 200,
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    if not ObjectId.is_valid(review_id):
        return error('Invalid review id', 400)
    review = ReviewDocument.objects(id=review_id, user_id=request.user.id).first()
    if not review:
        return error('Review not found', 404)
    story_id = review.story_id
    review.delete()
    update_story_rating(story_id)
    return success(None, 'Review deleted')
