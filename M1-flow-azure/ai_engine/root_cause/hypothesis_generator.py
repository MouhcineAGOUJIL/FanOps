"""
Hypothesis Generator - Creates potential root causes for anomalies using GPT
"""
import logging
from typing import Dict, Any, List
from shared.openai_client import openai_client

logger = logging.getLogger(__name__)

class HypothesisGenerator:
    """Generates hypotheses for anomaly root causes using chain-of-thought prompting"""
    
    def generate_hypotheses(self, anomaly_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate 5-7 hypotheses for the root cause of an anomaly
        
        Args:
            anomaly_data: Dict containing gate_id, score, queue_length, wait_time, etc.
        
        Returns:
            List of hypotheses with plausibility scores
        """
        logger.info(f"Generating hypotheses for anomaly at {anomaly_data.get('gate_id')}")
        
        # Build chain-of-thought prompt
        prompt = self._build_prompt(anomaly_data)
        
        try:
            # Call OpenAI
            response = openai_client.chat_completion(
                messages=[
                    {"role": "system", "content": "You are an expert in stadium operations and crowd management diagnostics."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse hypotheses from response
            hypotheses = self._parse_hypotheses(response["content"])
            
            logger.info(f"Generated {len(hypotheses)} hypotheses")
            return hypotheses
        
        except Exception as e:
            logger.error(f"Error generating hypotheses: {str(e)}")
            return self._fallback_hypotheses(anomaly_data)
    
    def _build_prompt(self, anomaly_data: Dict) -> str:
        """Build chain-of-thought prompt for hypothesis generation"""
        return f"""
ANOMALY DETECTED:
- Gate: {anomaly_data.get('gate_id', 'Unknown')}
- Anomaly Score: {anomaly_data.get('anomaly_score', 0)}/5
- Queue Length: {anomaly_data.get('queue_length', 0)} people
- Wait Time: {anomaly_data.get('wait_time', 0)} minutes
- Processing Time: {anomaly_data.get('processing_time', 0)} sec/person
- Time: {anomaly_data.get('timestamp', 'Unknown')}
- Stadium: {anomaly_data.get('stadium_id', 'Unknown')}

TASK:
Analyze this anomaly step-by-step and generate 5-7 hypotheses for the root cause.

Consider these categories:
1. HARDWARE: Scanner malfunction, turnstile jam, power failure
2. WEATHER: Sudden rain, extreme heat affecting equipment
3. SYSTEM: Software glitch, duplicate data, network latency
4. OPERATIONAL: Understaffing, incorrect procedures, manual overrides
5. EXTERNAL: VIP arrival spike, security incident, nearby event

For each hypothesis:
- Name: Brief title
- Category: One of the 5 above
- Description: What might be happening
- Plausibility: Score 0-1 (how likely)
- Evidence Needed: What data would confirm/refute this

Format as JSON array:
[
  {{
    "name": "Scanner Malfunction",
    "category": "HARDWARE",
    "description": "Barcode scanner failing intermittently",
    "plausibility": 0.7,
    "evidence_needed": "Device health logs, error rates"
  }},
  ...
]
"""
    
    def _parse_hypotheses(self, content: str) -> List[Dict]:
        """Parse hypotheses from GPT response"""
        import json
        import re
        
        try:
            # Try to extract JSON array from response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                hypotheses = json.loads(json_match.group())
                return hypotheses
            
            # Fallback: manual parsing
            return self._manual_parse(content)
        
        except Exception as e:
            logger.warning(f"Failed to parse hypotheses: {str(e)}")
            return []
    
    def _manual_parse(self, content: str) -> List[Dict]:
        """Manually parse hypotheses if JSON parsing fails"""
        # Simple line-based parsing
        hypotheses = []
        lines = content.split('\n')
        
        current = {}
        for line in lines:
            if "name:" in line.lower():
                if current:
                    hypotheses.append(current)
                current = {"name": line.split(":", 1)[1].strip()}
            elif "category:" in line.lower():
                current["category"] = line.split(":", 1)[1].strip()
            elif "plausibility:" in line.lower():
                try:
                    score = float(re.search(r'0?\.\d+|1\.0', line).group())
                    current["plausibility"] = score
                except:
                    current["plausibility"] = 0.5
        
        if current:
            hypotheses.append(current)
        
        return hypotheses
    
    def _fallback_hypotheses(self, anomaly_data: Dict) -> List[Dict]:
        """Generate fallback hypotheses using rules"""
        score = anomaly_data.get('anomaly_score', 0)
        
        hypotheses = [
            {
                "name": "Equipment Malfunction",
                "category": "HARDWARE",
                "description": "Scanner or turnstile hardware issue",
                "plausibility": 0.6 if score > 3 else 0.4,
                "evidence_needed": "Device health logs"
            },
            {
                "name": "Sudden Crowd Surge",
                "category": "EXTERNAL",
                "description": "Unexpected arrival spike",
                "plausibility": 0.5,
                "evidence_needed": "Arrival rate comparison"
            },
            {
                "name": "Staff Shortage",
                "category": "OPERATIONAL",
                "description": "Insufficient staff at gate",
                "plausibility": 0.4,
                "evidence_needed": "Staffing records"
            }
        ]
        
        return hypotheses

# Global instance
hypothesis_generator = HypothesisGenerator()
