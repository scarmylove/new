import os
from datetime import timedelta

class Config:
    """Flask configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'spoms-secret-key-change-in-production-2026'
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=1)
    SESSION_COOKIE_HTTPONLY = True
    # Use HTTPS in production (Vercel provides HTTPS)
    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
    SESSION_COOKIE_SAMESITE = 'Lax'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Vercel environment detection
    VERCEL = os.environ.get('VERCEL') == '1'
    VERCEL_ENV = os.environ.get('VERCEL_ENV', 'development')
    
    # Supabase configuration
    SUPABASE_URL = os.environ.get('SUPABASE_REST_URL')
    SUPABASE_KEY = os.environ.get('SUPABASE_ANON_KEY')
    