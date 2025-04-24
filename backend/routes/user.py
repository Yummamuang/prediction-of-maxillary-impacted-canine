from flask import Blueprint, request, jsonify

user_bp = Blueprint('user', __name__)

# Import User model and database instance
from models import User
from config import db

@user_bp.route('/user/all', methods=['GET'])
def index():
    try:
        # Query all users from the database
        users = User.query.all()

        # Convert users to a list of dictionaries
        users_data = [
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
            for user in users
        ]

        return jsonify({
            'status': 'success',
            'users': users_data,
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
