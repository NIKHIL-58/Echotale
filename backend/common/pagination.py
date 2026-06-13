def paginate_queryset(queryset, page=1, limit=20):
    page = max(int(page or 1), 1)
    limit = max(min(int(limit or 20), 100), 1)
    total = queryset.count()
    items = queryset.skip((page - 1) * limit).limit(limit)
    return items, {'page': page, 'limit': limit, 'total': total, 'pages': (total + limit - 1) // limit}
