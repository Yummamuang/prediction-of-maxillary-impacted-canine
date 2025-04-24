from flask import Flask
from .keypoint_detection import KeypointDetectionService
from .segmentation import SegmentationService

# Initialize services
keypoint_service = KeypointDetectionService()
segmentation_service = SegmentationService()

def init_app(app: Flask):
    # Set configuration for model paths
    app.config['YOLO_MODEL_PATH'] = app.config.get('YOLO_MODEL_PATH', 'models/keypoint/best.pt')
    app.config['SEGMENTATION_MODEL_PATH'] = app.config.get('SEGMENTATION_MODEL_PATH', 'models/segmentation/best.pt')

    # Initialize keypoint detection service
    keypoint_service.init_app(app)

    # Initialize segmentation service
    segmentation_service.init_app(app)

    # Log successful initialization
    app.logger.info("Services initialized successfully")
