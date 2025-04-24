from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return jsonify({
        'status': 'success',
        'message': 'Welcome to the Maxillary Impacted Canine Prediction API'
    })

@main_bp.route('/health')
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Service is running'
    })
