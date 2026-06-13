def required_fields(data, fields):
    missing = [field for field in fields if not data.get(field)]
    return missing
