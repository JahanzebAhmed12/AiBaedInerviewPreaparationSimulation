# app/email_utils.py
from flask_mail import Message
from flask import current_app
from app import mail

def send_email(subject, recipients, body):
    try:
        msg = Message(subject=subject, recipients=recipients, body=body)
        with current_app.app_context():
            mail.send(msg)
        print("✅ Email sent successfully.")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False
