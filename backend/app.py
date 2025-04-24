from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from config import db, init_db, init_jwt
import os

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    CORS(app,
        resources={r"/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
            "supports_credentials": True,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }})

    # Set upload folders
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
    app.config['RESULTS_FOLDER'] = os.path.join(app.root_path, 'results')
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)

    # Set YOLO model path
    app.config['YOLO_MODEL_PATH'] = os.environ.get('YOLO_MODEL_PATH', 'models/keypoint/best.pt')

    # Initialize database
    init_db(app)

    # Initialize JWT
    init_jwt(app)

    # Initialize Flask-Migrate
    migrate.init_app(app, db)

    # Import models explicitly to ensure migration works
    from models import User, KeypointDetection, Keypoint

    # Import routes after app is created to avoid circular imports
    from routes import init_app as init_routes
    init_routes(app)

    # Import services after app is created
    from services import init_app as init_services
    init_services(app)

    # Add an error handler for 500 errors
    @app.errorhandler(500)
    def handle_500(error):
        app.logger.error(f"Internal Server Error: {error}")
        return {"status": "error", "message": "Internal server error"}, 500

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
