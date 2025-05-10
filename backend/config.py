import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'rZ59GoRMBBAyW7_CSw_f18Dn7s0LSpJ0hm4Xv7Oilfhri0zVUEy45AoKDrkeY0Am')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///ai_db2.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRATION_SECONDS = 3600  # 1 hour token validity
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'rZ59GoRMBBAyW7_CSw_f18Dn7s0LSpJ0hm4Xv7Oilfhri0zVUEy45AoKDrkeY0Am')  # For JWT
    
    # Email Configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', True)
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')
