from config import db
from datetime import datetime
import json

class KeypointDetection(db.Model):
    __tablename__ = 'keypoint_detections'

    id = db.Column(db.String(50), primary_key=True)  # Changed to String for timestamp-based IDs
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    result_path = db.Column(db.String(255), nullable=True)
    confidence_score = db.Column(db.Float, nullable=True)
    prediction_result = db.Column(db.String(50), nullable=True)
    analysis_json = db.Column(db.Text, nullable=True)  # Added field for storing analysis results as JSON
    keypoints = db.relationship('Keypoint', backref='detection', lazy=True, cascade="all, delete-orphan")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    segmentation_path = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<KeypointDetection {self.id}>'

    def to_dict(self):
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'image_path': self.image_path,
            'result_path': self.result_path,
            'confidence_score': self.confidence_score,
            'prediction_result': self.prediction_result,
            'keypoints': [keypoint.to_dict() for keypoint in self.keypoints],
            'created_at': self.created_at.isoformat()
        }

        if self.segmentation_path:
            result['segmentation_path'] = self.segmentation_path

        # Add analysis if available
        if hasattr(self, 'analysis_json') and self.analysis_json:
            try:
                result['analysis'] = json.loads(self.analysis_json)
            except:
                result['analysis'] = None

        return result

class Keypoint(db.Model):
    __tablename__ = 'keypoints'

    id = db.Column(db.Integer, primary_key=True)
    detection_id = db.Column(db.String(50), db.ForeignKey('keypoint_detections.id'), nullable=False)
    label = db.Column(db.String(50), nullable=False)
    x_coord = db.Column(db.Float, nullable=False)
    y_coord = db.Column(db.Float, nullable=False)
    confidence = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f'<Keypoint {self.label} at ({self.x_coord}, {self.y_coord})>'

    def to_dict(self):
        return {
            'id': self.id,
            'label': self.label,
            'x': self.x_coord,
            'y': self.y_coord,
            'confidence': self.confidence
        }
