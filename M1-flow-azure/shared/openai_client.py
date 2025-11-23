"""
OpenAI Client Wrapper with Retry Logic and Token Counting
Provides cost-optimized integration with OpenAI API
"""
import os
import logging
from typing import Optional, Dict, List, Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import tiktoken
from openai import OpenAI, OpenAIError
from config.settings import settings

logger = logging.getLogger(__name__)

class OpenAIClient:
    """
    Wrapper for OpenAI API with retry logic, token counting, and cost tracking
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = None):
        self.api_key = api_key or settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        self.model = model or settings.OPENAI_MODEL
        
        if not self.api_key:
            logger.warning("OpenAI API key not found. Running in MOCK mode.")
            self.mock_mode = True
            self.client = None
        else:
            self.mock_mode = False
            self.client = OpenAI(api_key=self.api_key)
        
        # Initialize tokenizer for cost tracking
        try:
            self.encoding = tiktoken.encoding_for_model(self.model)
        except KeyError:
            self.encoding = tiktoken.get_encoding("cl100k_base")  # Fallback
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in a text string"""
        return len(self.encoding.encode(text))
    
    def estimate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Estimate cost in USD based on token usage
        Pricing (as of 2024):
        - GPT-3.5-Turbo: $0.001 per 1k tokens (input/output)
        - GPT-4: $0.03 per 1k tokens (input), $0.06 per 1k (output)
        """
        if "gpt-4" in self.model:
            input_cost = (prompt_tokens / 1000) * 0.03
            output_cost = (completion_tokens / 1000) * 0.06
        else:  # gpt-3.5-turbo
            input_cost = (prompt_tokens / 1000) * 0.001
            output_cost = (completion_tokens / 1000) * 0.001
        
        return input_cost + output_cost
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(OpenAIError),
        reraise=True
    )
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        functions: Optional[List[Dict]] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Call OpenAI chat completion with retry logic
        
        Args:
            messages: List of chat messages
            functions: Optional function definitions for function calling
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens in response
        
        Returns:
            Response dict with content, function_call, usage, and cost
        """
        if self.mock_mode:
            return self._mock_response(messages, functions)
        
        max_tokens = max_tokens or settings.OPENAI_MAX_TOKENS
        
        try:
            # Build request parameters
            params = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            if functions:
                params["functions"] = functions
                params["function_call"] = "auto"
            
            # Make API call
            response = self.client.chat.completions.create(**params)
            
            # Extract response data
            choice = response.choices[0]
            message = choice.message
            
            # Calculate cost
            usage = response.usage
            cost = self.estimate_cost(usage.prompt_tokens, usage.completion_tokens)
            
            # Log metrics
            logger.info(
                f"OpenAI call: {usage.prompt_tokens} prompt tokens, "
                f"{usage.completion_tokens} completion tokens, "
                f"cost: ${cost:.4f}"
            )
            
            return {
                "content": message.content,
                "function_call": message.function_call if hasattr(message, "function_call") else None,
                "usage": {
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                    "total_tokens": usage.total_tokens
                },
                "cost": cost,
                "finish_reason": choice.finish_reason
            }
        
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in OpenAI call: {str(e)}")
            raise
    
    def _mock_response(self, messages: List[Dict], functions: Optional[List[Dict]]) -> Dict:
        """Generate mock response for development without API costs"""
        logger.info("Using MOCK OpenAI response (no API call)")
        
        # Simulate token usage
        prompt_text = " ".join([m["content"] for m in messages if m.get("content")])
        prompt_tokens = self.count_tokens(prompt_text)
        completion_tokens = 150  # Simulated
        
        # Generate mock content based on context
        if functions:
            # If functions are available, mock a function call
            mock_content = None
            mock_function_call = {
                "name": functions[0]["name"],
                "arguments": '{"result": "mock_data"}'
            }
        else:
            # Otherwise, return a generic helpful response
            mock_content = "Based on the current gate status, I recommend redistributing crowd flow from Gate 2 to Gate 1 to reduce wait times. Confidence: 0.85"
            mock_function_call = None
        
        return {
            "content": mock_content,
            "function_call": mock_function_call,
            "usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens
            },
            "cost": 0.0,  # No cost in mock mode
            "finish_reason": "stop"
        }

# Global client instance
openai_client = OpenAIClient()
