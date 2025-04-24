import os
import uuid
import cv2
import numpy as np
import json
import traceback
from ultralytics import YOLO
from pathlib import Path
from PIL import Image
import torch
from datetime import datetime

class SegmentationService:
    def __init__(self, app=None):
        self.app = app
        self.model = None
        self.upload_folder = os.path.join(os.getcwd(), 'uploads')
        self.results_folder = os.path.join(os.getcwd(), 'results')

        # Ensure directories exist
        os.makedirs(self.upload_folder, exist_ok=True)
        os.makedirs(self.results_folder, exist_ok=True)

        if app:
            self.init_app(app)

    def init_app(self, app):
        self.app = app
        # Load YOLO segmentation model
        try:
            model_path = app.config.get('SEGMENTATION_MODEL_PATH', 'models/segmentation/best.pt')
            self.model = YOLO(model_path, task='segment')
            app.logger.info(f"YOLO segmentation model loaded from: {model_path}")
        except Exception as e:
            app.logger.error(f"Error loading YOLO segmentation model: {str(e)}")
            # Fallback to a default model if available
            try:
                self.model = YOLO('yolov11n-seg.pt')  # Use a standard model as fallback
                app.logger.info("Loaded fallback YOLO segmentation model")
            except:
                app.logger.error("Could not load any YOLO segmentation model")

    def get_tooth_segmentation(self, image_path):
        """Process image with YOLO segmentation and return segmentation masks"""
        try:
            # Check if model is loaded
            if self.model is None:
                self.app.logger.error("YOLO segmentation model not loaded")
                raise ValueError("Segmentation model not initialized")

            # Load image
            image = Image.open(image_path)

            # Run inference
            results = self.model(image, verbose=False)

            # Generate unique filename for results
            result_filename = f"{uuid.uuid4().hex}_seg_result.jpg"
            result_path = os.path.join(self.results_folder, result_filename)

            # Plot results
            result_image = results[0].plot()
            cv2.imwrite(result_path, result_image)

            # Process segmentation results
            segmentation_data = []
            left_teeth = []
            right_teeth = []

            # Load category names from the notes.json
            category_names = self._get_category_names()

            if len(results) > 0 and hasattr(results[0], 'masks') and results[0].masks is not None:
                masks = results[0].masks
                boxes = results[0].boxes

                # Debug info
                self.app.logger.info(f"Found {len(masks)} masks")

                for i, (mask, box) in enumerate(zip(masks, boxes)):
                    # Get class information
                    class_id = int(box.cls.item())
                    confidence = float(box.conf.item())

                    # Get mask as numpy array
                    mask_array = mask.data.cpu().numpy().squeeze()

                    # Convert mask to polygon for easier processing
                    contours, _ = cv2.findContours(
                        (mask_array * 255).astype(np.uint8),
                        cv2.RETR_EXTERNAL,
                        cv2.CHAIN_APPROX_SIMPLE
                    )

                    if contours:
                        largest_contour = max(contours, key=cv2.contourArea)
                        polygon = largest_contour.flatten().tolist()

                        # Normalize coordinates
                        img_height, img_width = mask_array.shape
                        normalized_polygon = []
                        for j in range(0, len(polygon), 2):
                            normalized_polygon.append(polygon[j] / img_width)    # x
                            normalized_polygon.append(polygon[j+1] / img_height) # y

                        # Get area
                        area = cv2.contourArea(largest_contour)

                        # Get bounding box
                        x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())

                        # Create tooth data
                        tooth_data = {
                            "id": i,
                            "class_id": class_id,
                            "class_name": category_names.get(class_id, f"class_{class_id}"),
                            "confidence": confidence,
                            "bbox": [x1, y1, x2, y2],
                            "polygon": normalized_polygon,
                            "area": area
                        }

                        segmentation_data.append(tooth_data)

            # Group teeth by sides
            if len(results) > 0:
                img_width = results[0].orig_shape[1]

                for tooth_data in segmentation_data:
                    # Use center of bbox to determine side
                    center_x = (tooth_data["bbox"][0] + tooth_data["bbox"][2]) / 2
                    if center_x < img_width / 2:
                        tooth_data["side"] = "left"
                        left_teeth.append(tooth_data)
                    else:
                        tooth_data["side"] = "right"
                        right_teeth.append(tooth_data)

            # Add sides to the return data - ย้าย return ออกมานอก if
            return {
                "status": "success",
                "result_image": os.path.basename(result_path),
                "segmentations": segmentation_data,
                "left_teeth": left_teeth,
                "right_teeth": right_teeth
            }

        except Exception as e:
            self.app.logger.error(f"Error in segmentation: {str(e)}")
            self.app.logger.error(traceback.format_exc())
            raise

    def _get_category_names(self):
        """Load category names from notes.json or use defaults"""
        try:
            notes_path = os.path.join(os.getcwd(), 'models/segmentation/notes.json')
            if os.path.exists(notes_path):
                with open(notes_path, 'r') as f:
                    notes = json.load(f)
                    return {cat['id']: cat['name'] for cat in notes.get('categories', [])}

            # Fallback to hardcoded values from your segmentation notes.json
            return {
                0: "Central incisor",
                1: "First premolar",
                2: "Impacted canine",
                3: "Lateral incisor",
                4: "Second premolar"
            }
        except Exception as e:
            self.app.logger.error(f"Error loading segmentation category names: {str(e)}")
            # Return basic numbered categories as fallback
            return {i: f"class_{i}" for i in range(5)}
