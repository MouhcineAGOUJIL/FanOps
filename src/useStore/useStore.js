import { create } from 'zustand';

export const useStore = create((set) => ({
  // Gates data
  gates: [],
  setGates: (gates) => set({ gates }),
  
  // Stadium info
  stadiumId: 'AGADIR',
  matchId: 'CAN2025-MAR-G1',
  
  // User
  userType: 'fan', // 'fan' or 'admin'
  
  // Forecast
  forecast: [],
  setForecast: (forecast) => set({ forecast }),
  
  // Promotions
  activePromo: null,
  setActivePromo: (promo) => set({ activePromo: promo }),
  
  // Loading states
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));