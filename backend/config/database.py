from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

db = SQLAlchemy()
migrate = Migrate()
load_dotenv()

def init_app(app):
    # Configure database connection
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('DATABASE_URL')
    # Or use environment variables (recommended for production)
    # app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
