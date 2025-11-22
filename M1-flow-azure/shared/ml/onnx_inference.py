import onnxruntime as ort
import numpy as np
import os
import logging
import json

class ONNXInference:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.session = None
        self.input_name = None
        self.features = []
        self._load_model()
        self._load_metadata()

    def _load_model(self):
        try:
            if not os.path.exists(self.model_path):
                logging.warning(f"ONNX model not found at {self.model_path}. Inference will fail.")
                return
            
            self.session = ort.InferenceSession(self.model_path)
            self.input_name = self.session.get_inputs()[0].name
            logging.info(f"Loaded ONNX model from {self.model_path}")
        except Exception as e:
            logging.error(f"Failed to load ONNX model: {str(e)}")

    def _load_metadata(self):
        try:
            metadata_path = os.path.join(os.path.dirname(self.model_path), "model_metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    data = json.load(f)
                    self.features = data.get("features", [])
        except Exception as e:
            logging.warning(f"Failed to load model metadata: {str(e)}")

    def predict(self, input_data: dict) -> float:
        """
        Runs inference on a single dictionary of input features.
        Expected keys in input_data must match training features.
        """
        if not self.session:
            return -1.0
        
        try:
            # Prepare input vector in correct order
            # Default to 0.0 if feature missing (safe fallback)
            input_vector = [float(input_data.get(f, 0.0)) for f in self.features]
            
            # Reshape to (1, N)
            input_tensor = np.array(input_vector, dtype=np.float32).reshape(1, -1)
            
            # Run inference
            result = self.session.run(None, {self.input_name: input_tensor})
            return float(result[0][0])
        except Exception as e:
            logging.error(f"Inference error: {str(e)}")
            return -1.0

# Singleton instance for global reuse
# Assuming model is in shared/ml/models/wait_time_model.onnx relative to function root
# In Azure Functions, root is usually where host.json is.
import pathlib
current_dir = pathlib.Path(__file__).parent.parent.parent
model_path = current_dir / "shared" / "ml" / "models" / "wait_time_model.onnx"
inference_engine = ONNXInference(str(model_path))
