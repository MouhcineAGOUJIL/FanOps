"""
Mitigation Recommender - Generates action plans based on diagnosed root cause
"""
import json
import logging
import os
from typing import Dict, Any, List
from shared.openai_client import openai_client

logger = logging.getLogger(__name__)

class MitigationRecommender:
    """Recommends mitigation actions based on root cause diagnosis"""
    
    def __init__(self):
        self.playbook = self._load_playbook()
    
    def _load_playbook(self) -> Dict:
        """Load mitigation playbook from config"""
        playbook_path = os.path.join("config", "mitigation_playbook.json")
        
        try:
            with open(playbook_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Playbook not found: {playbook_path}, using defaults")
            return self._default_playbook()
    
    def _default_playbook(self) -> Dict:
        """Default mitigation playbook"""
        return {
            "scanner_failure": {
                "priority": "high",
                "actions": [
                    "Dispatch technical team to gate",
                    "Activate backup scanner",
                    "Reroute 30% of crowd to adjacent gate",
                    "Notify operations center"
                ],
                "estimated_time": "5-10 minutes"
            },
            "weather_event": {
                "priority": "medium",
                "actions": [
                    "Deploy weather shelter at gate",
                    "Increase staff presence",
                    "Send weather alerts to fans",
                    "Prepare indoor holding area"
                ],
                "estimated_time": "10-15 minutes"
            },
            "crowd_surge": {
                "priority": "high",
                "actions": [
                    "Alert security team immediately",
                    "Deploy additional staff to gate",
                    "Activate crowd control barriers",
                    "Redirect arrivals to less congested gates"
                ],
                "estimated_time": "2-5 minutes"
            },
            "system_glitch": {
                "priority": "medium",
                "actions": [
                    "Restart gate processing system",
                    "Clear duplicate records",
                    "Verify data integrity",
                    "Monitor for recurrence"
                ],
                "estimated_time": "3-7 minutes"
            },
            "staffing_issue": {
                "priority": "medium",
                "actions": [
                    "Redeploy staff from low-traffic areas",
                    "Call in backup personnel",
                    "Implement manual processing if needed",
                    "Log incident for scheduling review"
                ],
                "estimated_time": "5-10 minutes"
            }
        }
    
    def recommend(self, diagnosis: str, anomaly_data: Dict, confidence: float) -> Dict[str, Any]:
        """
        Generate mitigation recommendations
        
        Args:
            diagnosis: Root cause diagnosis (hypothesis name)
            anomaly_data: Context about the anomaly
            confidence: Confidence in the diagnosis
        
        Returns:
            Action plan with prioritized steps
        """
        logger.info(f"Generating mitigation plan for: {diagnosis}")
        
        # Match diagnosis to playbook
        playbook_key = self._match_playbook(diagnosis)
        base_plan = self.playbook.get(playbook_key, None)
        
        if not base_plan:
            # Generate plan using GPT
            return self._generate_custom_plan(diagnosis, anomaly_data, confidence)
        
        # Customize base plan with GPT
        customized = self._customize_plan(base_plan, diagnosis, anomaly_data, confidence)
        
        return customized
    
    def _match_playbook(self, diagnosis: str) -> str:
        """Match diagnosis to playbook entry"""
        diagnosis_lower = diagnosis.lower()
        
        if "scanner" in diagnosis_lower or "hardware" in diagnosis_lower:
            return "scanner_failure"
        elif "weather" in diagnosis_lower or "rain" in diagnosis_lower:
            return "weather_event"
        elif "surge" in diagnosis_lower or "spike" in diagnosis_lower or "crowd" in diagnosis_lower:
            return "crowd_surge"
        elif "system" in diagnosis_lower or "glitch" in diagnosis_lower or "software" in diagnosis_lower:
            return "system_glitch"
        elif "staff" in diagnosis_lower or "operational" in diagnosis_lower:
            return "staffing_issue"
        else:
            return None
    
    def _customize_plan(self, base_plan: Dict, diagnosis: str, anomaly_data: Dict, confidence: float) -> Dict:
        """Customize base plan using GPT"""
        try:
            prompt = f"""
Given this situation:
- Root Cause: {diagnosis}
- Confidence: {confidence*100:.0f}%
- Gate: {anomaly_data.get('gate_id')}
- Queue Length: {anomaly_data.get('queue_length')} people
- Wait Time: {anomaly_data.get('wait_time')} minutes

Standard Playbook Actions:
{json.dumps(base_plan['actions'], indent=2)}

Customize these actions for the specific context. Add any missing steps. Format as JSON:"
{{
  "priority": "high|medium|low",
  "actions": ["step 1", "step 2", ...],
  "estimated_time": "X-Y minutes",
  "confidence_note": "note about confidence level"
}}
"""
            
            response = openai_client.chat_completion(
                messages=[
                    {"role": "system", "content": "You are an expert in stadium emergency response."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=500
            )
            
            # Parse response
            import re
            json_match = re.search(r'\{.*\}', response["content"], re.DOTALL)
            if json_match:
                customized = json.loads(json_match.group())
                return customized
            
            return base_plan
        
        except Exception as e:
            logger.warning(f"Failed to customize plan: {str(e)}")
            return base_plan
    
    def _generate_custom_plan(self, diagnosis: str, anomaly_data: Dict, confidence: float) -> Dict:
        """Generate completely custom plan using GPT"""
        try:
            prompt = f"""
Create an action plan for this stadium issue:
- Root Cause: {diagnosis}
- Confidence: {confidence*100:.0f}%
- Gate: {anomaly_data.get('gate_id')}
- Queue: {anomaly_data.get('queue_length')} people

Format as JSON:
{{
  "priority": "high|medium|low",
  "actions": ["actionable step 1", "step 2", ...],
  "estimated_time": "X-Y minutes"
}}
"""
            
            response = openai_client.chat_completion(
                messages=[
                    {"role": "system", "content": "You are a stadium operations expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=400
            )
            
            import re
            json_match = re.search(r'\{.*\}', response["content"], re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            # Fallback
            return {
                "priority": "medium",
                "actions": ["Investigate the issue", "Monitor situation", "Prepare contingency"],
                "estimated_time": "5-10 minutes"
            }
        
        except Exception as e:
            logger.error(f"Failed to generate custom plan: {str(e)}")
            return {
                "priority": "medium",
                "actions": ["Manual review required"],
                "estimated_time": "Unknown"
            }

# Global instance
mitigation_recommender = MitigationRecommender()
