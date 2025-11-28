"""
Metrics Aggregator - Calculates rolling metrics and trends
"""
import asyncio
import logging
from datetime import datetime, timedelta
from collections import deque
from typing import Dict, List

logger = logging.getLogger(__name__)


class MetricsAggregator:
    """Aggregates gate metrics over time"""
    
    def __init__(self):
        self.running = False
        self.metrics_history: Dict[str, deque] = {}
        self.max_history = 1440  # 24 hours at 1-minute intervals
        
    async def start(self):
        """Start metrics aggregation"""
        self.running = True
        logger.info("📊 Metrics aggregator started")
        
        while self.running:
            try:
                await self._aggregate_metrics()
                await asyncio.sleep(60)  # Aggregate every minute
            except Exception as e:
                logger.error(f"Error in metrics aggregator: {e}")
                await asyncio.sleep(60)
    
    async def stop(self):
        """Stop metrics aggregation"""
        self.running = False
        logger.info("🛑 Metrics aggregator stopped")
    
    async def _aggregate_metrics(self):
        """Collect and store metrics snapshot"""
        # This would collect from stream processor
        # For now, placeholder
        pass
    
    async def get_metrics(self, stadium_id: str, period: str) -> dict:
        """Get aggregated metrics for a period"""
        
        # Parse period
        minutes = self._parse_period(period)
        
        # Calculate metrics
        metrics = {
            "stadium_id": stadium_id,
            "period": period,
            "timestamp": datetime.utcnow().isoformat(),
            "summary": {
                "avg_wait_time": 0,
                "max_wait_time": 0,
                "min_wait_time": 0,
                "anomaly_count": 0,
                "gate_count": 0
            },
            "trends": {
                "wait_time_trend": "stable",  # increasing, decreasing, stable
                "anomaly_trend": "stable"
            }
        }
        
        return metrics
    
    def _parse_period(self, period: str) -> int:
        """Convert period string to minutes"""
        mapping = {
            "5m": 5,
            "15m": 15,
            "1h": 60,
            "1d": 1440
        }
        return mapping.get(period, 60)
