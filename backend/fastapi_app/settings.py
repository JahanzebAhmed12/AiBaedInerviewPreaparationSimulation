import os

class Settings:
    SECRET_KEY = os.getenv('SECRET_KEY', 'rZ59GoRMBBAyW7_CSw_f18Dn7s0LSpJ0hm4Xv7Oilfhri0zVUEy45AoKDrkeY0Am')
    JWT_SECRET = os.getenv('JWT_SECRET', 'rZ59GoRMBBAyW7_CSw_f18Dn7s0LSpJ0hm4Xv7Oilfhri0zVUEy45AoKDrkeY0Am')
    ALLOW_ORIGINS = ["*"]  # Example CORS settings

settings = Settings()