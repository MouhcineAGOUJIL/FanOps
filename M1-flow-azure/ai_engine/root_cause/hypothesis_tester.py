"""
Hypothesis Tester - Executes tests to gather evidence for/against hypotheses
"""
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class HypothesisTester:
    """Tests hypotheses in parallel and collects evidence"""
    
    def __init__(self):
        self.test_executors = {
            "HARDWARE": self._test_hardware,
            "WEATHER": self._test_weather,
            "SYSTEM": self._test_system,
            "OPERATIONAL": self._test_operational,
            "EXTERNAL": self._test_external
        }
    
    def test_hypotheses(self, hypotheses: List[Dict], anomaly_data: Dict) -> List[Dict]:
        """
        Test each hypothesis and collect evidence
        
        Args:
            hypotheses: List of hypotheses from generator
            anomaly_data: Anomaly context data
        
        Returns:
            Hypotheses with test_results added
        """
        logger.info(f"Testing {len(hypotheses)} hypotheses")
        
        results = []
        for hypothesis in hypotheses:
            category = hypothesis.get("category", "UNKNOWN")
            
            # Execute appropriate test
            if category in self.test_executors:
                test_result = self.test_executors[category](hypothesis, anomaly_data)
            else:
                test_result = {"verdict": "INCONCLUSIVE", "confidence": 0.0, "evidence": []}
            
            # Add test results to hypothesis
            hypothesis["test_result"] = test_result
            results.append(hypothesis)
        
        return results
    
    def _test_hardware(self, hypothesis: Dict, anomaly_data: Dict) -> Dict:
        """Test hardware-related hypotheses"""
        # Mock: Check device health logs
        gate_id = anomaly_data.get("gate_id")
        
        # Simulate checking logs
        evidence = []
        
        # If anomaly score is high, assume hardware issue likely
        if anomaly_data.get("anomaly_score", 0) > 4:
            evidence.append("High error rate detected in device logs")
            evidence.append("Last heartbeat: 5 minutes ago (delayed)")
            verdict = "SUPPORTS"
            confidence = 0.8
        else:
            evidence.append("Device health normal")
            evidence.append("Last heartbeat: 30 seconds ago")
            verdict = "REFUTES"
            confidence = 0.6
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "evidence": evidence,
            "test_type": "Hardware Health Check"
        }
    
    def _test_weather(self, hypothesis: Dict, anomaly_data: Dict) -> Dict:
        """Test weather-related hypotheses"""
        # Mock: Check weather API
        evidence = []
        
        # Simulate weather check (always clear for now)
        current_weather = "clear"
        evidence.append(f"Current weather: {current_weather}")
        evidence.append("No precipitation in last hour")
        
        verdict = "REFUTES"
        confidence = 0.7
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "evidence": evidence,
            "test_type": "Weather Correlation"
        }
    
    def _test_system(self, hypothesis: Dict, anomaly_data: Dict) -> Dict:
        """Test system/software hypotheses"""
        evidence = []
        
        # Check for duplicate data
        queue_length = anomaly_data.get("queue_length", 0)
        if queue_length > 150:  # Unusually high
            evidence.append("Queue length anomalously high")
            evidence.append("Possible data duplication or latency")
            verdict = "SUPPORTS"
            confidence = 0.6
        else:
            evidence.append("Queue length within normal bounds")
            verdict = "INCONCLUSIVE"
            confidence = 0.5
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "evidence": evidence,
            "test_type": "System Integrity Check"
        }
    
    def _test_operational(self, hypothesis: Dict, anomaly_data: Dict) -> Dict:
        """Test operational hypotheses"""
        evidence = []
        
        # Mock: Check staffing records
        evidence.append("Staffing check: 2 operators assigned")
        evidence.append("No manual overrides logged")
        
        verdict = "INCONCLUSIVE"
        confidence = 0.5
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "evidence": evidence,
            "test_type": "Operational Audit"
        }
    
    def _test_external(self, hypothesis: Dict, anomaly_data: Dict) -> Dict:
        """Test external event hypotheses"""
        evidence = []
        
        # Check time - VIP arrivals typically 17:30-17:45
        timestamp = anomaly_data.get("timestamp", "")
        try:
            ts = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            hour = ts.hour
            minute = ts.minute
            
            if hour == 17 and 30 <= minute <= 45:
                evidence.append("Timing matches VIP arrival window")
                verdict = "SUPPORTS"
                confidence = 0.7
            else:
                evidence.append("Outside typical VIP arrival window")
                verdict = "REFUTES"
                confidence = 0.6
        except:
            evidence.append("Could not determine timing")
            verdict = "INCONCLUSIVE"
            confidence = 0.3
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "evidence": evidence,
            "test_type": "External Event Correlation"
        }

# Global instance
hypothesis_tester = HypothesisTester()
