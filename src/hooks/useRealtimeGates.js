import { useEffect } from 'react';
import { useStore } from '../useStore/useStore';
import { flowService } from '../services/flowService';

export const useRealtimeGates = (stadiumId, interval = 3000) => {
  const { setGates, setLoading } = useStore();

  useEffect(() => {
    if (!stadiumId) return;

    const fetchGates = async () => {
      try {
        setLoading(true);
        const data = await flowService.getGateStatus(stadiumId);
        setGates(data?.gates || []);
      } catch (error) {
        console.error('Error fetching gates:', error);
        // Set empty array on error to prevent crashes
        setGates([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immédiatement
    fetchGates();

    // Puis toutes les X secondes
    const timer = setInterval(fetchGates, interval);

    return () => clearInterval(timer);
  }, [stadiumId, interval, setGates, setLoading]);
};