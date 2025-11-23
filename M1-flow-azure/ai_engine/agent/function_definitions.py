"""
Agent Function Definitions for OpenAI Function Calling
Defines the schema for functions the orchestration agent can call
"""

def get_function_definitions():
    """
    Returns OpenAI function definitions for the orchestration agent
    These functions allow the agent to gather data and take actions
    """
    return [
        {
            "name": "get_all_gate_status",
            "description": "Retrieves current status of all gates at a stadium including wait times, queue lengths, and ML predictions",
            "parameters": {
                "type": "object",
                "properties": {
                    "stadium_id": {
                        "type": "string",
                        "description": "Stadium identifier (e.g., AGADIR, RABAT, CASABLANCA)"
                    }
                },
                "required": ["stadium_id"]
            }
        },
        {
            "name": "get_historical_pattern",
            "description": "Retrieves historical crowd patterns for similar match scenarios (time, opponent, etc.)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stadium_id": {
                        "type": "string",
                        "description": "Stadium identifier"
                    },
                    "time_of_day": {
                        "type": "string",
                        "description": "Time period (e.g., '17:00-18:00')"
                    },
                    "lookback_days": {
                        "type": "integer",
                        "description": "Number of days to look back for historical data",
                        "default": 30
                    }
                },
                "required": ["stadium_id", "time_of_day"]
            }
        },
        {
            "name": "simulate_redistribution",
            "description": "Simulates the impact of redirecting fans from one gate to another using queueing theory (M/M/c model)",
            "parameters": {
                "type": "object",
                "properties": {
                    "from_gate": {
                        "type": "string",
                        "description": "Gate to redirect fans FROM (e.g., G2)"
                    },
                    "to_gate": {
                        "type": "string",
                        "description": "Gate to redirect fans TO (e.g., G1)"
                    },
                    "percentage": {
                        "type": "number",
                        "description": "Percentage of crowd to redirect (0-100)",
                        "minimum": 0,
                        "maximum": 100
                    },
                    "stadium_id": {
                        "type": "string",
                        "description": "Stadium identifier"
                    }
                },
                "required": ["from_gate", "to_gate", "percentage", "stadium_id"]
            }
        },
        {
            "name": "send_staff_alert",
            "description": "Sends an operational alert to stadium staff (security, operations, technical team)",
            "parameters": {
                "type": "object",
                "properties": {
                    "alert_type": {
                        "type": "string",
                        "enum": ["security", "operations", "technical", "medical"],
                        "description": "Type of alert to send"
                    },
                    "gate_id": {
                        "type": "string",
                        "description": "Gate requiring attention"
                    },
                    "message": {
                        "type": "string",
                        "description": "Alert message to staff"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Alert priority level"
                    },
                    "stadium_id": {
                        "type": "string",
                        "description": "Stadium identifier"
                    }
                },
                "required": ["alert_type", "gate_id", "message", "priority", "stadium_id"]
            }
        },
        {
            "name": "get_match_context",
            "description": "Retrieves match-specific context: time to kickoff, current score, VIP arrivals, weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "stadium_id": {
                        "type": "string",
                        "description": "Stadium identifier"
                    }
                },
                "required": ["stadium_id"]
            }
        }
    ]
