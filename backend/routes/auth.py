from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
import re

# Import User model and database instance
from models import User
from config import db

auth_bp = Blueprint('auth', __name__)

ACTIVE_TOKENS = {}

# Login endpoint
@auth_bp.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400

    # Find the user
    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'status': 'error', 'message': 'Username or password are incorrect'}), 401

    # Create JWT token
    access_token = create_access_token(identity=str(user.id))

    # Define user data to return
    current_user = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    }

    return jsonify({'status': 'success', 'token': access_token, 'user': current_user})

# Register endpoint
@auth_bp.route('/signup', methods=['POST'])
def register():
    # Get data from request
    data = request.json
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    confirmPassword = data.get('confirmPassword')

    if not email or not username or not password or not confirmPassword:
        return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'status': 'error', 'message': 'Email already registered'}), 400

    # Regular expression for validating an Email
    def is_valid_email(email):
        # Basic email regex pattern
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    if not is_valid_email(email):
        return jsonify({'status': 'error', 'message': 'Invalid email format'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'status': 'error', 'message': 'Username already taken'}), 400

    if len(password) < 6:
        return jsonify({'status': 'error', 'message': 'Password must be at least 6 characters long'}), 400

    if password != confirmPassword:
        return jsonify({'status': 'error', 'message': 'Passwords do not match'}), 400

    if len(username) < 3:
        return jsonify({'status': 'error', 'message': 'Username must be at least 3 characters long'}), 400

    new_user = User(
        email=email,
        username=username,
        password=generate_password_hash(password, method='pbkdf2:sha256')
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Create user successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'Registration failed: {str(e)}'}), 500

# Logout endpoint to invalidate token
@auth_bp.route('/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        # Remove token from active tokens
        ACTIVE_TOKENS.pop(token, None)

    return jsonify({'status': 'success', 'message': 'Logged out successfully'}), 200

# Validate token #
@auth_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    try:
        # This will raise an error if the token is missing or invalid
        verify_jwt_in_request()

        # Get identity from the token
        user_id = get_jwt_identity()

        # Get user from database
        user = User.query.get(user_id)

        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        # Return user info
        return jsonify({
            'status': 'success',
            'message': 'Token is valid',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Token validation failed: {str(e)}'}), 401
