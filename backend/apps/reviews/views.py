from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from common.response import success, error
from apps.reviews.models import ReviewDocument
from apps.reviews.serializers import ReviewSerializer, review_to_dict
@api_view(['GET','POST'])
def story_reviews(request, story_id):
    if request.method == 'GET': return success([review_to_dict(r) for r in ReviewDocument.objects(story_id=story_id).order_by('-created_at')])
    if not request.user or not request.user.is_authenticated: return error('Authentication required',401)
    serializer=ReviewSerializer(data=request.data)
    if not serializer.is_valid(): return error('Validation failed', errors=serializer.errors)
    review=ReviewDocument(user_id=request.user.id, story_id=story_id, **serializer.validated_data).save()
    return success(review_to_dict(review),'Review added',201)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    review=ReviewDocument.objects(id=review_id, user_id=request.user.id).first()
    if not review: return error('Review not found',404)
    review.delete(); return success(None,'Review deleted')
