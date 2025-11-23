"""
Test script for Root Cause Analysis system
Run this to verify RCA works before deploying
"""
import logging
import json
from ai_engine.root_cause.anomaly_investigator import anomaly_investigator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_rca():
    """Test the RCA system"""
    print("=" * 60)
    print("TESTING ROOT CAUSE ANALYSIS SYSTEM")
    print("=" * 60)
    
    # Simulate an anomaly
    anomaly_data = {
        "stadium_id": "AGADIR",
        "gate_id": "G2",
        "anomaly_score": 4.5,
        "queue_length": 200,
        "wait_time": 12.5,
        "processing_time": 5.0,
        "timestamp": "2025-07-14T17:35:00Z"
    }
    
    print("\n1. ANOMALY DATA:")
    print(json.dumps(anomaly_data, indent=2))
    
    print("\n2. Running RCA investigation...")
    investigation = anomaly_investigator.investigate(anomaly_data)
    
    print("\n3. INVESTIGATION RESULTS:")
    print(f"   Investigation ID: {investigation.get('investigation_id')}")
    print(f"   Status: {investigation.get('status')}")
    
    diagnosis = investigation.get('diagnosis', {})
    print(f"\n4. DIAGNOSIS:")
    print(f"   Root Cause: {diagnosis.get('root_cause')}")
    print(f"   Category: {diagnosis.get('category')}")
    print(f"   Confidence: {diagnosis.get('confidence', 0):.2f}")
    
    print(f"\n5. HYPOTHESES TESTED: {investigation.get('hypotheses_tested', 0)}")
    
    for i, hyp in enumerate(investigation.get('all_hypotheses', [])[:3], 1):
        print(f"\n   Hypothesis {i}:")
        print(f"   - Name: {hyp.get('name')}")
        print(f"   - Category: {hyp.get('category')}")
        print(f"   - Plausibility: {hyp.get('plausibility', 0):.2f}")
        
        test_result = hyp.get('test_result', {})
        print(f"   - Test Verdict: {test_result.get('verdict')}")
        print(f"   - Test Confidence: {test_result.get('confidence', 0):.2f}")
        print(f"   - Final Confidence: {hyp.get('final_confidence', 0):.2f}")
    
    mitigation = investigation.get('mitigation_plan', {})
    print(f"\n6. MITIGATION PLAN:")
    print(f"   Priority: {mitigation.get('priority')}")
    print(f"   Estimated Time: {mitigation.get('estimated_time')}")
    print(f"   Actions:")
    for i, action in enumerate(mitigation.get('actions', []), 1):
        print(f"      {i}. {action}")
    
    print("\n" + "=" * 60)
    print("TEST VERIFICATION")
    print("=" * 60)
    
    # Verify
    assert investigation.get('status') in ['completed', 'failed'], "Invalid status"
    assert diagnosis.get('root_cause'), "Missing root cause"
    assert 0 <= diagnosis.get('confidence', 0) <= 1, "Invalid confidence"
    assert mitigation.get('actions'), "Missing mitigation actions"
    
    print("✓ Investigation structure valid")
    print(f"✓ Diagnosis: {diagnosis.get('root_cause')}")
    print(f"✓ Confidence: {diagnosis.get('confidence', 0):.2f}")
    print(f"✓ Mitigation priority: {mitigation.get('priority')}")
    
    if investigation.get('status') == 'completed':
        print("✓ RCA completed successfully")
    else:
        print("⚠️  RCA failed (check logs)")
    
    print("\n" + "=" * 60)
    print("RCA TEST COMPLETE")
    print("=" * 60)
    
    return investigation

if __name__ == "__main__":
    test_rca()
