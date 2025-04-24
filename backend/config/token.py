from flask_jwt_extended import JWTManager
from datetime import timedelta
from dotenv import load_dotenv
from flask import jsonify
import os

load_dotenv()
jwt = JWTManager()

def init_jwt(app):
    app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

    # Add this line to fix the audience error
    app.config["JWT_DECODE_AUDIENCE"] = None

    # Initialize JWT manager with app
    jwt.init_app(app)

    # Handle JWT errors
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "status": "error",
            "message": "The token has expired"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "status": "error",
            "message": f"Invalid token: {error}"
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            "status": "error",
            "message": f"Missing Authorization header: {error}"
        }), 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return jsonify({
            "status": "error",
            "message": "The token is not fresh"
        }), 401

    # Initialize JWT
    return jwt
