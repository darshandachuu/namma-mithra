"""
CampusCare - Main Server Launcher
Runs the Flask application on port 5000
"""
import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"==================================================")
    print(f"  CampusCare Management System Backend Server")
    print(f"  Running on: http://127.0.0.1:{port}")
    print(f"  API base:   http://127.0.0.1:{port}/api")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
