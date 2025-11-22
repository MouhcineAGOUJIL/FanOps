import boto3
import json
import logging
import random
from datetime import datetime, timedelta
from config.settings import settings

class AWSAnomalyClient:
    def __init__(self):
        self.client = None
        self.endpoint_name = settings.SAGEMAKER_ENDPOINT_NAME
        self.cache = {}
        self.cache_ttl = timedelta(minutes=5)
        
        # Initialize boto3 client if credentials exist
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                self.client = boto3.client(
                    'sagemaker-runtime',
                    region_name=settings.AWS_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
                )
            except Exception as e:
                logging.warning(f"Failed to initialize AWS client: {e}")
        else:
            logging.info("AWS credentials not found. Running in MOCK mode.")

    def check_anomaly(self, data_point: dict) -> dict:
        """
        Checks if the given data point is anomalous.
        Uses local cache to avoid frequent calls for similar data/time windows.
        """
        gate_id = data_point.get('gateId')
        
        # Check cache
        if gate_id in self.cache:
            entry = self.cache[gate_id]
            if datetime.now() - entry['ts'] < self.cache_ttl:
                return entry['result']

        result = {"anomaly": False, "score": 0.0}

        if self.client and self.endpoint_name:
            try:
                # Real call to SageMaker
                payload = json.dumps(data_point)
                response = self.client.invoke_endpoint(
                    EndpointName=self.endpoint_name,
                    ContentType='application/json',
                    Body=payload
                )
                result_body = json.loads(response['Body'].read().decode())
                # Assuming RCF returns {"scores": [{"score": 1.2}]}
                score = result_body['scores'][0]['score']
                result = {
                    "anomaly": score > 3.0, # Threshold
                    "score": score
                }
            except Exception as e:
                logging.error(f"SageMaker invocation failed: {e}")
                # Fallback to mock in case of error
                result = self._mock_anomaly(data_point)
        else:
            # Mock mode
            result = self._mock_anomaly(data_point)

        # Update cache
        self.cache[gate_id] = {
            'ts': datetime.now(),
            'result': result
        }
        return result

    def _mock_anomaly(self, data_point: dict) -> dict:
        """
        Simulates anomaly detection logic.
        """
        # Simulate anomaly if queue length is unusually high
        queue_len = data_point.get('queueLength', 0)
        is_anomaly = queue_len > 150 # Arbitrary threshold for demo
        score = (queue_len / 50.0) + random.uniform(0, 0.5)
        
        return {
            "anomaly": is_anomaly,
            "score": round(score, 2)
        }

aws_client = AWSAnomalyClient()
