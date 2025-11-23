"""
Anomaly Investigator - Main RCA orchestrator
Coordinates hypothesis generation, testing, and mitigation recommendations
"""
import logging
import json
from datetime import datetime
from typing import Dict, Any, List
from ai_engine.root_cause.hypothesis_generator import hypothesis_generator
from ai_engine.root_cause.hypothesis_tester import hypothesis_tester
from ai_engine.root_cause.mitigation_recommender import mitigation_recommender
from shared.storage_client import storage_client
from config.settings import settings

logger = logging.getLogger(__name__)

class AnomalyInvestigator:
    """Main RCA orchestrator - runs full investigation pipeline"""
    
    def __init__(self):
        self.investigation_cache = {}  # Simple in-memory cache
    
    def investigate(self, anomaly_data: Dict[str, Any], cache_ttl_seconds: int = 900) -> Dict[str, Any]:
        """
        Run full RCA investigation
        
        Args:
            anomaly_data: Dict with gate_id, anomaly_score, queue_length, etc.
            cache_ttl_seconds: Cache TTL (default 15 minutes)
        
        Returns:
            Investigation report with hypotheses, evidence, diagnosis, mitigation plan
        """
        # Check cache
        cache_key = f"{anomaly_data.get('gate_id')}_{anomaly_data.get('anomaly_score')}"
        cached = self._get_cached(cache_key, cache_ttl_seconds)
        if cached:
            logger.info(f"Returning cached investigation for {cache_key}")
            return cached
        
        logger.info(f"Starting RCA investigation for {anomaly_data.get('gate_id')}")
        
        investigation_id = f"INV_{anomaly_data.get('gate_id')}_{int(datetime.utcnow().timestamp())}"
        
        try:
            # Step 1: Generate hypotheses
            logger.info("Step 1: Generating hypotheses")
            hypotheses = hypothesis_generator.generate_hypotheses(anomaly_data)
            
            if not hypotheses:
                return self._error_report("Failed to generate hypotheses", investigation_id)
            
            # Step 2: Test hypotheses
            logger.info("Step 2: Testing hypotheses")
            tested_hypotheses = hypothesis_tester.test_hypotheses(hypotheses, anomaly_data)
            
            # Step 3: Rank hypotheses by evidence
            logger.info("Step 3: Ranking hypotheses")
            ranked = self._rank_hypotheses(tested_hypotheses)
            
            # Step 4: Diagnose most likely cause
            diagnosis = ranked[0] if ranked else None
            
            if not diagnosis:
                return self._error_report("No viable diagnosis", investigation_id)
            
            # Step 5: Generate mitigation plan
            logger.info("Step 4: Generating mitigation plan")
            mitigation_plan = mitigation_recommender.recommend(
                diagnosis["name"],
                anomaly_data,
                diagnosis.get("final_confidence", 0.5)
            )
            
            # Build investigation report
            report = {
                "investigation_id": investigation_id,
                "stadium_id": anomaly_data.get("stadium_id"),
                "gate_id": anomaly_data.get("gate_id"),
                "timestamp": datetime.utcnow().isoformat(),
                "anomaly_score": anomaly_data.get("anomaly_score"),
                "diagnosis": {
                    "root_cause": diagnosis["name"],
                    "category": diagnosis.get("category"),
                    "confidence": diagnosis.get("final_confidence"),
                    "description": diagnosis.get("description", "")
                },
                "hypotheses_tested": len(tested_hypotheses),
                "all_hypotheses": tested_hypotheses,
                "mitigation_plan": mitigation_plan,
                "status": "completed"
            }
            
            # Store investigation
            self._store_investigation(report)
            
            # Cache result
            self._cache_result(cache_key, report)
            
            logger.info(f"Investigation {investigation_id} completed: {diagnosis['name']}")
            
            return report
        
        except Exception as e:
            logger.error(f"Investigation failed: {str(e)}")
            return self._error_report(str(e), investigation_id)
    
    def _rank_hypotheses(self, tested_hypotheses: List[Dict]) -> List[Dict]:
        """Rank hypotheses by combining plausibility and test evidence"""
        for hyp in tested_hypotheses:
            test_result = hyp.get("test_result", {})
            verdict = test_result.get("verdict", "INCONCLUSIVE")
            test_confidence = test_result.get("confidence", 0.5)
            prior = hyp.get("plausibility", 0.5)
            
            # Simple Bayesian update
            if verdict == "SUPPORTS":
                posterior = min(prior * 1.5, 1.0)
            elif verdict == "REFUTES":
                posterior = prior * 0.5
            else:  # INCONCLUSIVE
                posterior = prior
            
            # Weight by test confidence
            final_confidence = posterior * test_confidence
            
            hyp["final_confidence"] = final_confidence
        
        # Sort by final confidence (desc)
        return sorted(tested_hypotheses, key=lambda x: x.get("final_confidence", 0), reverse=True)
    
    def _store_investigation(self, report: Dict):
        """Store investigation in Table Storage"""
        try:
            table_client = storage_client.get_table_client(settings.TABLE_NAME_INVESTIGATION_LOGS)
            
            entity = {
                "PartitionKey": report["stadium_id"],
                "RowKey": report["investigation_id"],
                "gate_id": report["gate_id"],
                "root_cause": report["diagnosis"]["root_cause"],
                "confidence": report["diagnosis"]["confidence"],
                "anomaly_score": report["anomaly_score"],
                "mitigation_priority": report["mitigation_plan"].get("priority", "unknown"),
                "timestamp": datetime.utcnow(),
                "status": "completed"
            }
            
            table_client.upsert_entity(entity)
            logger.info(f"Stored investigation {report['investigation_id']}")
        
        except Exception as e:
            logger.warning(f"Failed to store investigation: {str(e)}")
    
    def _get_cached(self, key: str, ttl: int) -> Dict | None:
        """Get cached result if still valid"""
        if key in self.investigation_cache:
            cached_time, result = self.investigation_cache[key]
            age = (datetime.utcnow() - cached_time).total_seconds()
            if age < ttl:
                return result
        return None
    
    def _cache_result(self, key: str, result: Dict):
        """Cache investigation result"""
        self.investigation_cache[key] = (datetime.utcnow(), result)
    
    def _error_report(self, error: str, investigation_id: str) -> Dict:
        """Generate error report"""
        return {
            "investigation_id": investigation_id,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "failed",
            "error": error,
            "diagnosis": {
                "root_cause": "Unknown - Manual review required",
                "confidence": 0.0
            },
            "mitigation_plan": {
                "priority": "high",
                "actions": ["Manual investigation required", "Notify operations manager"],
                "estimated_time": "Unknown"
            }
        }

# Global investigator instance
anomaly_investigator = AnomalyInvestigator()
