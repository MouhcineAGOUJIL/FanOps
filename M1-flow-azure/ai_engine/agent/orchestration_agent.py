"""
Orchestration Agent - Main AI decision-making engine
Uses OpenAI GPT with function calling to make intelligent crowd management decisions
"""
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from shared.openai_client import openai_client
from ai_engine.agent.function_definitions import get_function_definitions
from ai_engine.agent.function_executor import function_executor
from config.settings import settings
import os

logger = logging.getLogger(__name__)

class OrchestrationAgent:
    """
    AI agent that monitors gates and makes intelligent decisions using GPT function calling
    """
    
    def __init__(self, stadium_id: str):
        self.stadium_id = stadium_id
        self.max_iterations = 5
        self.system_prompt = self._load_system_prompt()
        self.functions = get_function_definitions()
    
    def _load_system_prompt(self) -> str:
        """Load and customize system prompt"""
        prompt_path = os.path.join("config", "prompts", "agent_system_prompt.txt")
        
        try:
            with open(prompt_path, "r") as f:
                template = f.read()
            
            # Calculate minutes to kickoff (assume 18:00 kickoff)
            now = datetime.utcnow()
            kickoff = now.replace(hour=18, minute=0, second=0, microsecond=0)
            minutes_to_kickoff = int((kickoff - now).total_seconds() / 60)
            
            # Fill template
            return template.format(
                stadium_id=self.stadium_id,
                current_time=now.strftime("%Y-%m-%d %H:%M UTC"),
                minutes_to_kickoff=minutes_to_kickoff
            )
        except FileNotFoundError:
            logger.warning(f"System prompt file not found: {prompt_path}, using default")
            return "You are an AI assistant for stadium crowd management."
    
    def make_decision(self) -> Dict[str, Any]:
        """
        Main decision loop: Observe → Reason → Act
        
        Returns:
            Decision dict with recommendation, reasoning, confidence
        """
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Analyze the current situation at {self.stadium_id} and provide recommendations."}
        ]
        
        iteration = 0
        total_cost = 0.0
        function_calls_made = []
        
        try:
            while iteration < self.max_iterations:
                iteration += 1
                logger.info(f"Agent iteration {iteration}/{self.max_iterations}")
                
                # Call OpenAI with function calling
                response = openai_client.chat_completion(
                    messages=messages,
                    functions=self.functions,
                    temperature=0.7,
                    max_tokens=settings.OPENAI_MAX_TOKENS
                )
                
                total_cost += response["cost"]
                
                # Check if OpenAI wants to call a function
                if response["function_call"]:
                    function_call = response["function_call"]
                    function_name = function_call.name
                    function_args = json.loads(function_call.arguments)
                    
                    logger.info(f"Agent calling function: {function_name}")
                    function_calls_made.append(function_name)
                    
                    # Execute the function
                    function_result = function_executor.execute(function_name, function_args)
                    
                    # Add to conversation
                    messages.append({
                        "role": "assistant",
                        "content": None,
                        "function_call": {
                            "name": function_name,
                            "arguments": function_call.arguments
                        }
                    })
                    messages.append({
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps(function_result)
                    })
                    
                else:
                    # Agent has final answer
                    logger.info("Agent reached final decision")
                    
                    decision = self._parse_decision(response["content"])
                    decision["metadata"] = {
                        "iterations": iteration,
                        "functions_called": function_calls_made,
                        "total_cost_usd": round(total_cost, 4),
                        "model": settings.OPENAI_MODEL,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    return decision
            
            # Max iterations reached
            logger.warning(f"Agent reached max iterations ({self.max_iterations})")
            return self._fallback_decision()
        
        except Exception as e:
            logger.error(f"Agent error: {str(e)}")
            return self._fallback_decision()
    
    def _parse_decision(self, content: str) -> Dict[str, Any]:
        """
        Parse agent's final response into structured decision
        Extracts: situation, analysis, recommendation, confidence, reasoning
        """
        # Simple parsing - split by section markers
        sections = {
            "situation": "",
            "analysis": "",
            "recommendation": "",
            "confidence": 0.5,
            "reasoning": ""
        }
        
        lines = content.split("\n")
        current_section = None
        
        for line in lines:
            line_upper = line.upper().strip()
            
            if "SITUATION:" in line_upper:
                current_section = "situation"
            elif "ANALYSIS:" in line_upper:
                current_section = "analysis"
            elif "RECOMMENDATION:" in line_upper:
                current_section = "recommendation"
            elif "CONFIDENCE:" in line_upper:
                current_section = "confidence"
                # Extract confidence score
                try:
                    score_text = line.split(":")[-1].strip()
                    # Extract first number (0.0-1.0)
                    import re
                    match = re.search(r'0?\.\d+|1\.0', score_text)
                    if match:
                        sections["confidence"] = float(match.group())
                except:
                    pass
            elif "REASONING:" in line_upper:
                current_section = "reasoning"
            elif current_section and line.strip():
                # Ensure we append strings only
                if isinstance(sections[current_section], str):
                    sections[current_section] += line + "\n"
        
        # Clean up
        for key in sections:
            if isinstance(sections[key], str):
                sections[key] = sections[key].strip()
        
        return {
            "decision": sections["recommendation"],
            "confidence": sections["confidence"],
            "reasoning": sections["reasoning"],
            "full_response": content
        }
    
    def _fallback_decision(self) -> Dict[str, Any]:
        """
        Rule-based fallback when OpenAI fails
        Simple logic: Alert on red gates, recommend redistribution on yellow
        """
        logger.info("Using rule-based fallback decision")
        
        # Get gate status directly
        try:
            from shared.storage_client import storage_client
            table_client = storage_client.get_table_client(settings.TABLE_NAME_GATES)
            filter_query = f"PartitionKey eq '{self.stadium_id}'"
            entities = list(table_client.query_entities(filter_query))
            
            red_gates = [e for e in entities if e.get('state') == 'red']
            yellow_gates = [e for e in entities if e.get('state') == 'yellow']
            
            if red_gates:
                recommendation = f"URGENT: {len(red_gates)} gate(s) in RED status. Immediate action required."
            elif yellow_gates:
                recommendation = f"ATTENTION: {len(yellow_gates)} gate(s) in YELLOW status. Consider redistribution."
            else:
                recommendation = "All gates operating normally. Continue monitoring."
            
            return {
                "decision": recommendation,
                "confidence": 0.5,
                "reasoning": "Rule-based fallback (OpenAI unavailable)",
                "fallback": True,
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
        except Exception as e:
            return {
                "decision": "System error - manual review required",
                "confidence": 0.0,
                "reasoning": f"Error: {str(e)}",
                "fallback": True
            }

# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agent = OrchestrationAgent(stadium_id="AGADIR")
    decision = agent.make_decision()
    print(json.dumps(decision, indent=2))
