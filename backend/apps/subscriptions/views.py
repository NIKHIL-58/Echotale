from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from common.response import success
from apps.subscriptions.models import SubscriptionDocument
from apps.subscriptions.serializers import subscription_to_dict
PLANS=[{'id':'free','name':'Free','amount':0,'currency':'INR'},{'id':'premium_monthly','name':'Premium Monthly','amount':499,'currency':'INR'},{'id':'premium_yearly','name':'Premium Yearly','amount':4999,'currency':'INR'}]
@api_view(['GET'])
def plans(request): return success(PLANS)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe(request):
    plan_id=request.data.get('plan_id','premium_monthly')
    plan=next((p for p in PLANS if p['id']==plan_id), PLANS[1])
    sub=SubscriptionDocument(user_id=request.user.id, plan=plan['id'], amount=plan['amount'], currency=plan['currency'], expires_at=datetime.utcnow()+timedelta(days=365 if 'yearly' in plan['id'] else 30), payment_id=request.data.get('payment_id','')).save()
    request.user.doc.is_premium=True; request.user.doc.save()
    return success(subscription_to_dict(sub),'Subscription active',201)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current(request):
    sub=SubscriptionDocument.objects(user_id=request.user.id).order_by('-started_at').first()
    return success(subscription_to_dict(sub) if sub else None)
