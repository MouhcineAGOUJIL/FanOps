"""
Test script for the Orchestration Agent
Run this to verify the agent works before deploying
"""
import logging
import json
from ai_engine.agent.orchestration_agent import OrchestrationAgent

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_agent():
    """Test the orchestration agent"""
    print("=" * 60)
    print("TESTING ORCHESTRATION AGENT")
    print("=" * 60)
    
    # Create agent for AGADIR stadium
    agent = OrchestrationAgent(stadium_id="AGADIR")
    
    print("\n1. Making decision...")
    decision = agent.make_decision()
    
    print("\n2. DECISION RESULT:")
    print(json.dumps(decision, indent=2))
    
    print("\n3. VERIFICATION:")
    assert "decision" in decision, "Missing 'decision' field"
    assert "confidence" in decision, "Missing 'confidence' field"
    assert "reasoning" in decision, "Missing 'reasoning' field"
    
    print("✓ Decision structure valid")
    print(f"✓ Confidence: {decision['confidence']}")
    print(f"✓ Cost: ${decision.get('metadata', {}).get('total_cost_usd', 0)}")
    
    if decision.get("fallback"):
        print("⚠️  Agent used fallback (OpenAI not available)")
    else:
        print("✓ Agent used OpenAI successfully")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    
    return decision

if __name__ == "__main__":
    test_agent()
