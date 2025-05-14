# app/email_utils.py
from flask_mail import Message
from flask import current_app
from app import mail

def send_email(subject, recipients, body):
    try:
        # Validate essential configuration
        mail_username = current_app.config.get('MAIL_USERNAME')
        mail_default_sender = current_app.config.get('MAIL_DEFAULT_SENDER')
        
        if not mail_username or not mail_default_sender:
            print("❌ Email configuration incomplete:")
            print(f"MAIL_USERNAME: {mail_username or 'Not set'}")
            print(f"MAIL_DEFAULT_SENDER: {mail_default_sender or 'Not set'}")
            print("Please set these values in your environment variables or config file.")
            return False
            
        # Debug prints to check configuration
        print("📧 Email Configuration:")
        print(f"MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
        print(f"MAIL_USERNAME: {mail_username}")
        print(f"MAIL_DEFAULT_SENDER: {mail_default_sender}")
        
        # Create email message
        msg = Message(subject=subject, recipients=recipients, body=body)
        with current_app.app_context():
            mail.send(msg)
        print("✅ Email sent successfully.")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        # Print more detailed error for debugging
        if "does not specify a sender" in str(e):
            print("  → MAIL_DEFAULT_SENDER not configured properly.")
        elif "SMTP" in str(e):
            print("  → SMTP connection error. Check your MAIL_SERVER and authentication details.")
        return False
