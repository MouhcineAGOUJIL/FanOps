import { useStore } from '../useStore/useStore';

const shouldUseTestData = import.meta.env.VITE_USE_TEST_DATA === 'true';
const TEST_ENDPOINTS = {
  fan: '/test/fan-experience.sample.json',
  operations: '/test/operations-suite.sample.json',
};

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[test-data] Unable to load ${url}`, error);
    return null;
  }
}

export async function loadTestData() {
  if (!shouldUseTestData) return;

  const [fanData, operationsData] = await Promise.all([
    fetchJson(TEST_ENDPOINTS.fan),
    fetchJson(TEST_ENDPOINTS.operations),
  ]);

  if (fanData) {
    useStore.setState((current) => ({
      ...current,
      gates: fanData.dashboard?.gates ?? current.gates,
      fanMetrics: fanData.dashboard?.metrics ?? current.fanMetrics,
      activePromo: fanData.promotions?.[0] ?? current.activePromo,
      promotions: fanData.promotions ?? current.promotions,
    }));
  }

  if (operationsData) {
    useStore.setState((current) => ({
      ...current,
      operationsData,
      forecast: operationsData.forecast?.series ?? current.forecast,
    }));
  }
}
