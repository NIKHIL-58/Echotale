from datetime import datetime, timedelta

import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from common.response import error, success
from apps.subscriptions.models import SubscriptionDocument
from apps.subscriptions.serializers import subscription_to_dict


PLANS = [
    {'id': 'free', 'name': 'Free', 'amount': 0, 'currency': 'INR'},
    {'id': 'premium_monthly', 'name': 'Premium Monthly', 'amount': 499, 'currency': 'INR'},
    {'id': 'premium_yearly', 'name': 'Premium Yearly', 'amount': 4999, 'currency': 'INR'},
]


def verify_payment(payment_id, plan):
    if plan['amount'] == 0:
        return True
    if settings.DEBUG and payment_id == 'dev_local':
        return True
    if not (
        payment_id
        and settings.PAYMENT_VERIFICATION_URL
        and settings.PAYMENT_VERIFICATION_SECRET
    ):
        return False

    try:
        response = requests.post(
            settings.PAYMENT_VERIFICATION_URL,
            json={
                'payment_id': payment_id,
                'amount': plan['amount'],
                'currency': plan['currency'],
            },
            headers={
                'Authorization': f'Bearer {settings.PAYMENT_VERIFICATION_SECRET}'
            },
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()
        return bool(
            result.get('verified')
            and result.get('amount') == plan['amount']
            and result.get('currency') == plan['currency']
        )
    except (requests.RequestException, ValueError):
        return False


@api_view(['GET'])
@permission_classes([AllowAny])
def plans(request):
    return success(PLANS)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe(request):
    plan_id = request.data.get('plan_id', 'premium_monthly')
    plan = next((item for item in PLANS if item['id'] == plan_id), None)
    if not plan:
        return error('Invalid subscription plan', 400)

    payment_id = request.data.get('payment_id', '')
    if not verify_payment(payment_id, plan):
        return error('Payment could not be verified', 402)

    SubscriptionDocument.objects(
        user_id=request.user.id,
        status='active',
    ).update(status='replaced')

    days = 365 if 'yearly' in plan['id'] else 30
    sub = SubscriptionDocument(
        user_id=request.user.id,
        plan=plan['id'],
        amount=plan['amount'],
        currency=plan['currency'],
        expires_at=datetime.utcnow() + timedelta(days=days),
        payment_provider='development' if payment_id == 'dev_local' else 'configured',
        payment_id=payment_id,
    ).save()

    request.user.doc.is_premium = plan['id'] != 'free'
    request.user.doc.save()
    return success(subscription_to_dict(sub), 'Subscription active', 201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current(request):
    sub = SubscriptionDocument.objects(
        user_id=request.user.id,
        status='active',
        expires_at__gt=datetime.utcnow(),
    ).order_by('-started_at').first()
    if not sub and request.user.doc.is_premium:
        request.user.doc.is_premium = False
        request.user.doc.save()
    return success(subscription_to_dict(sub) if sub else None)
