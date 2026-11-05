"""
Production WSGI Entrypoint for Namma Mithra
Used by Gunicorn, Waitress, and production cloud runners.
"""
from app import create_app

app = create_app()

if __name__ == "__main__":
    from waitress import serve
    import os
    port = int(os.environ.get("PORT", 5000))
    print(f"Serving Namma Mithra production server with Waitress on port {port}...")
    serve(app, host="0.0.0.0", port=port)
