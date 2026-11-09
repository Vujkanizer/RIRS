from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def samo(vloga):
    def dekorator(fn):
        @wraps(fn)
        def ovita(*args, **kwargs):
            verify_jwt_in_request()
            if get_jwt().get("vloga") != vloga:
                return jsonify(napaka="Nimate dovoljenja."), 403
            return fn(*args, **kwargs)

        return ovita

    return dekorator
