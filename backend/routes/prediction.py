from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import traceback
from PIL import Image

from services import keypoint_service, segmentation_service

prediction_bp = Blueprint('prediction', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@prediction_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_image():
    user_id = get_jwt_identity()

    # Check if the post request has the file part
    if 'image' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No image provided'
        }), 400

    file = request.files['image']

    # If user does not select file, browser also submits an empty part without filename
    if file.filename == '':
        return jsonify({
            'status': 'error',
            'message': 'No selected file'
        }), 400

    if file and allowed_file(file.filename):
        try:
            # Check file size
            file_content = file.read()
            file.seek(0)  # Reset file pointer to beginning after reading

            # Check if file is too large (e.g., > 10MB)
            if len(file_content) > 10 * 1024 * 1024:
                return jsonify({
                    'status': 'error',
                    'message': 'File is too large. Maximum size is 10MB.'
                }), 400

            # Check if file is valid image
            try:
                img = Image.open(file)
                img.verify()  # Verify it's an image
                file.seek(0)  # Reset file pointer

                # Check image dimensions
                img = Image.open(file)
                if img.width < 200 or img.height < 200:
                    return jsonify({
                        'status': 'error',
                        'message': 'Image is too small. Minimum dimensions are 200x200 pixels.'
                    }), 400
                file.seek(0)  # Reset file pointer again
            except Exception as e:
                current_app.logger.error(f"Image validation error: {str(e)}")
                return jsonify({
                    'status': 'error',
                    'message': 'Uploaded file is not a valid image.'
                }), 400

            # Save the uploaded image
            image_path = keypoint_service.save_image(file)

            # First, get segmentation results
            segmentation_results = segmentation_service.get_tooth_segmentation(image_path)

            # Then, get keypoint detection results with segmentation data
            keypoint_results = keypoint_service.detect_keypoints(
                image_path,
                user_id,
                segmentation_data=segmentation_results
            )

            # Combine results
            combined_results = {
                'status': 'success',
                'message': 'Image processed successfully',
                'detection': keypoint_results,
                'segmentation': segmentation_results
            }

            return jsonify(combined_results)

        except Exception as e:
            current_app.logger.error(f"Error processing image: {str(e)}")
            current_app.logger.error(traceback.format_exc())

            # Provide more detailed error message when possible
            error_message = 'Error processing image. The AI model may have difficulty analyzing this X-ray.'

            if 'No valid keypoints detected' in str(e):
                error_message = 'Could not detect dental keypoints in this image. Please try with a clearer X-ray.'
            elif 'Model not initialized' in str(e):
                error_message = 'AI model initialization error. Please contact support.'
            elif 'out of memory' in str(e).lower():
                error_message = 'Server memory error. The image may be too large or complex.'

            return jsonify({
                'status': 'error',
                'message': error_message,
                'details': str(e)
            }), 500

    return jsonify({
        'status': 'error',
        'message': 'Invalid file format. Allowed formats: png, jpg, jpeg'
    }), 400

@prediction_bp.route('/detection/<detection_id>', methods=['GET'])
@jwt_required()
def get_detection(detection_id):
    user_id = get_jwt_identity()

    try:
        # Get detection details
        detection = keypoint_service.get_detection_by_id(detection_id)

        if not detection:
            return jsonify({
                'status': 'error',
                'message': 'Detection not found'
            }), 404

        # Check if the detection belongs to the user
        if str(detection['user_id']) != str(user_id):
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized access to detection'
            }), 403

        return jsonify({
            'status': 'success',
            'detection': detection
        })

    except Exception as e:
        current_app.logger.error(f"Error retrieving detection: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving detection: {str(e)}'
        }), 500

@prediction_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()

    try:
        # Get detection history for the user
        history = keypoint_service.get_user_history(user_id)

        return jsonify({
            'status': 'success',
            'history': history
        })

    except Exception as e:
        current_app.logger.error(f"Error retrieving history: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving history: {str(e)}'
        }), 500

@prediction_bp.route('/uploads/<filename>', methods=['GET'])
def uploaded_file(filename):
    return send_from_directory(os.path.join(current_app.root_path, 'uploads'), filename)

@prediction_bp.route('/results/<filename>', methods=['GET'])
def result_file(filename):
    return send_from_directory(os.path.join(current_app.root_path, 'results'), filename)
