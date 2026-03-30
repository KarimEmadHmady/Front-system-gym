import { useState, useEffect, useCallback } from 'react';
import { LoyaltyService } from '@/services/loyaltyService';
import type { LoyaltyPointsStatsResponse, RewardsStatsResponse } from '@/types';

const loyaltyService = new LoyaltyService();

// Global state for loyalty stats
let globalLoyaltyStats: LoyaltyPointsStatsResponse | null = null;
let globalRewardsStats: RewardsStatsResponse | null = null;
let listeners: Set<() => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const useLoyaltyStats = () => {
  const [loyaltyStats, setLoyaltyStats] = useState<LoyaltyPointsStatsResponse | null>(globalLoyaltyStats);
  const [rewardsStats, setRewardsStats] = useState<RewardsStatsResponse | null>(globalRewardsStats);
  const [loading, setLoading] = useState(!globalLoyaltyStats);

  const updateStats = useCallback(async () => {
    try {
      const [loyaltyRes, rewardsRes] = await Promise.all([
        loyaltyService.getLoyaltyStats(),
        loyaltyService.getRewardsStats(),
      ]);
      
      globalLoyaltyStats = loyaltyRes;
      globalRewardsStats = rewardsRes;
      
      setLoyaltyStats(loyaltyRes);
      setRewardsStats(rewardsRes);
      notifyListeners();
    } catch (error) {
      console.log('Error fetching loyalty stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    updateStats();
  }, [updateStats]);

  useEffect(() => {
    const listener = () => {
      setLoyaltyStats(globalLoyaltyStats);
      setRewardsStats(globalRewardsStats);
    };
    
    listeners.add(listener);
    
    // Fetch initial data if not already loaded
    if (!globalLoyaltyStats) {
      updateStats();
    } else {
      setLoyaltyStats(globalLoyaltyStats);
      setRewardsStats(globalRewardsStats);
      setLoading(false);
    }

    return () => {
      listeners.delete(listener);
    };
  }, [updateStats]);

  return {
    loyaltyStats,
    rewardsStats,
    loading,
    refreshStats
  };
};
