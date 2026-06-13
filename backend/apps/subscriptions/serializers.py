def subscription_to_dict(s):
    return {'id': str(s.id), 'user_id': s.user_id, 'plan': s.plan, 'status': s.status, 'amount': s.amount, 'currency': s.currency, 'started_at': s.started_at.isoformat() if s.started_at else None, 'expires_at': s.expires_at.isoformat() if s.expires_at else None, 'payment_provider': s.payment_provider, 'payment_id': s.payment_id}
