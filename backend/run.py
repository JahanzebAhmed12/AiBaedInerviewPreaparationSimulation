from app import create_app
from app.models import *
app = create_app()

with app.app_context():
    db.create_all()  # Creates all tables based on the models
    print("Tables created successfully.")
if __name__ == "__main__":
    app.run(debug=True)
