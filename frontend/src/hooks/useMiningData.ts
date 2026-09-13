import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DashboardData } from '../types';

export const useMiningData = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { dashboard, loading, error, refresh };
};
