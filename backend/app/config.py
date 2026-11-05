"""
CampusCare Configuration Module
Supports MySQL 8 with graceful fallback to SQLite if MySQL is offline.
"""
import os
import pymysql
from datetime import timedelta
from dotenv import load_dotenv

# Find directory containing config.py
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'campuscare-default-development-secret-key-2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'campuscare-jwt-secret-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_MINUTES', 1440)))
    
    # Upload configuration
    UPLOAD_FOLDER = os.path.join(BASE_DIR, os.getenv('UPLOAD_FOLDER', 'uploads'))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 10 * 1024 * 1024)) # 10 MB
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
    
    # Database Settings
    DB_ENGINE = os.getenv('DB_ENGINE', 'mysql').lower()
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME', 'campuscare')
    
    # Build MySQL URI
    password_part = f":{DB_PASSWORD}" if DB_PASSWORD else ""
    MYSQL_URI = f"mysql+pymysql://{DB_USER}{password_part}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    SQLITE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'campuscare.db')}"

    # Determine Active URI
    @classmethod
    def get_database_uri(cls):
        # Allow explicit override via DATABASE_URL
        custom_url = os.getenv('DATABASE_URL')
        if custom_url:
            return custom_url

        if cls.DB_ENGINE == 'sqlite':
            return cls.SQLITE_URI

        # Attempt to probe MySQL
        try:
            port = int(cls.DB_PORT)
            conn = pymysql.connect(
                host=cls.DB_HOST,
                user=cls.DB_USER,
                password=cls.DB_PASSWORD,
                port=port,
                connect_timeout=2
            )
            # Create database if not exists
            with conn.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{cls.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            conn.close()
            return cls.MYSQL_URI
        except Exception as e:
            print(f"[CampusCare Config] MySQL connection not established ({e}). Falling back to SQLite: {cls.SQLITE_URI}")
            return cls.SQLITE_URI

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = None # Populated in create_app

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
