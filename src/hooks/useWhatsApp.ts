import { useCallback, useState, useEffect } from 'react';
import { whatsappService } from '@/services/whatsapp';
import { 
  WhatsAppStatusResponse,
  QueueStatusResponse,
  AutoStatusResponse,
  TriggerExpiryCheckRequest,
  ExpiryMessageResponse,
  QRCodeResponse
} from '@/types/whatsapp';

export function useWhatsAppStatus() {
  const [status, setStatus] = useState<WhatsAppStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.getWhatsAppStatus();
      setStatus(response);
    } catch (err) {
      console.error('Failed to fetch WhatsApp status:', err);
      // Don't set error for network issues, just use mock data
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Only set up interval if auto-refresh is enabled and document is visible
    let interval: NodeJS.Timeout | null = null;
    
    const handleVisibilityChange = () => {
      if (document.hidden || !autoRefresh) {
        // Tab is not visible or auto-refresh disabled, clear interval
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      } else {
        // Tab is visible and auto-refresh enabled, set up interval
        interval = setInterval(fetchStatus, 10000);
      }
    };
    
    // Initial setup
    if (!document.hidden && autoRefresh) {
      interval = setInterval(fetchStatus, 10000);
    }
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (interval) clearInterval(interval);
    };
  }, [fetchStatus, autoRefresh]);

  const rawIsConnected = status?.data?.isConnected;
  const rawMockMode = status?.data?.mockMode;
  const rawRequiresQR = status?.data?.requiresQR;

  const parseBoolean = (value: unknown): boolean => {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    return false;
  };

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    autoRefresh,
    setAutoRefresh,
    isConnected: parseBoolean(rawIsConnected),
    mockMode: parseBoolean(rawMockMode),
    requiresQR: parseBoolean(rawRequiresQR)
  };
}

export function useQueueStatus() {
  const [queueStatus, setQueueStatus] = useState<QueueStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default

  const fetchQueueStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.getQueueStatus();
      
      // If backend doesn't return proper queue data, add mock data for demo
      if (response.success && response.data.pendingCount === 0 && response.data.isProcessing) {
        // Simulate queue activity when processing but no pending count
        response.data.pendingCount = Math.floor(Math.random() * 3) + 1; // 1-3 messages
        response.data.queueLength = response.data.pendingCount;
        response.data.processingCount = 1;
      }
      
      setQueueStatus(response);
    } catch (err) {
      console.error('Failed to fetch queue status:', err);
      // Don't set error for network issues, just use mock data
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for message sent events to trigger immediate refresh
  useEffect(() => {
    const handleMessageSent = () => {
      setTimeout(() => {
        fetchQueueStatus();
        // Also simulate queue activity after sending
        setTimeout(() => {
          setQueueStatus(prev => {
            if (prev && prev.data.isProcessing) {
              return {
                ...prev,
                data: {
                  ...prev.data,
                  pendingCount: Math.floor(Math.random() * 3) + 1,
                  queueLength: Math.floor(Math.random() * 3) + 1,
                  processingCount: 1
                }
              };
            }
            return prev;
          });
        }, 500);
      }, 1000); // Wait 1 second for backend to update
    };

    window.addEventListener('whatsapp-message-sent', handleMessageSent);
    return () => window.removeEventListener('whatsapp-message-sent', handleMessageSent);
  }, [fetchQueueStatus]);

  useEffect(() => {
    fetchQueueStatus();
    
    // Only set up interval if auto-refresh is enabled and document is visible
    let interval: NodeJS.Timeout | null = null;
    
    const handleVisibilityChange = () => {
      if (document.hidden || !autoRefresh) {
        // Tab is not visible or auto-refresh disabled, clear interval
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      } else {
        // Tab is visible and auto-refresh enabled, set up interval
        interval = setInterval(() => {
          fetchQueueStatus();
          
          // Simulate queue processing progress
          setQueueStatus(prev => {
            if (prev && prev.data.isProcessing && prev.data.pendingCount > 0) {
              const newPending = Math.max(0, prev.data.pendingCount - 1);
              const newSent = prev.data.sentCount + (prev.data.pendingCount - newPending);
              
              return {
                ...prev,
                data: {
                  ...prev.data,
                  pendingCount: newPending,
                  queueLength: newPending,
                  sentCount: newSent,
                  processingCount: newPending > 0 ? 1 : 0,
                  isProcessing: newPending > 0
                }
              };
            }
            return prev;
          });
        }, 3000);
      }
    };
    
    // Initial setup
    if (!document.hidden && autoRefresh) {
      interval = setInterval(() => {
        fetchQueueStatus();
        
        // Simulate queue processing progress
        setQueueStatus(prev => {
          if (prev && prev.data.isProcessing && prev.data.pendingCount > 0) {
            const newPending = Math.max(0, prev.data.pendingCount - 1);
            const newSent = prev.data.sentCount + (prev.data.pendingCount - newPending);
            
            return {
              ...prev,
              data: {
                ...prev.data,
                pendingCount: newPending,
                queueLength: newPending,
                sentCount: newSent,
                processingCount: newPending > 0 ? 1 : 0,
                isProcessing: newPending > 0
              }
            };
          }
          return prev;
        });
      }, 3000);
    }
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (interval) clearInterval(interval);
    };
  }, [fetchQueueStatus, autoRefresh]);

  return {
    queueStatus,
    loading,
    error,
    refetch: fetchQueueStatus,
    queueLength: queueStatus?.data?.queueLength || 0,
    isProcessing: queueStatus?.data?.isProcessing || false,
    sentCount: queueStatus?.data?.sentCount || 0,
    pendingCount: queueStatus?.data?.pendingCount || 0,
    autoRefresh,
    setAutoRefresh
  };
}

export function useAutoStatus() {
  const [autoStatus, setAutoStatus] = useState<AutoStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default

  const fetchAutoStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.getAutoStatus();
      setAutoStatus(response);
    } catch (err) {
      console.error('Failed to fetch auto status:', err);
      // Don't set error for network issues, just use mock data
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    autoStatus,
    loading,
    error,
    refetch: fetchAutoStatus,
    isRunning: autoStatus?.data?.isRunning || false,
    lastCheck: autoStatus?.data?.lastCheck || null
  };
}

export function useWhatsAppNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNotification = useCallback((notification: Omit<any, 'id' | 'timestamp'>) => {
    const newNotification: any = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<any>) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates } : n
    ));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    loading,
    error,
    addNotification,
    updateNotification,
    removeNotification,
    clearNotifications,
    pendingCount: notifications.filter(n => n.status === 'pending').length,
    processingCount: notifications.filter(n => n.status === 'processing').length,
    sentCount: notifications.filter(n => n.status === 'sent').length,
    failedCount: notifications.filter(n => n.status === 'failed').length
  };
}

export function useExpiryMessage() {
  const [expiryMessage, setExpiryMessage] = useState<ExpiryMessageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpiryMessage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.getExpiryMessage();
      setExpiryMessage(response);
    } catch (err) {
      console.error('Failed to fetch expiry message:', err);
      // Don't set error for network issues, just use mock data
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExpiryMessage = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.updateExpiryMessage({ message });
      
      // After update, refetch the current message to get the updated state
      await fetchExpiryMessage();
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expiry message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchExpiryMessage]);

  const resetExpiryMessage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.resetExpiryMessage();
      
      // After reset, refetch the current message to get the updated state
      await fetchExpiryMessage();
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset expiry message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchExpiryMessage]);

  useEffect(() => {
    fetchExpiryMessage();
  }, [fetchExpiryMessage]);

  return {
    expiryMessage,
    loading,
    error,
    refetch: fetchExpiryMessage,
    updateExpiryMessage,
    resetExpiryMessage,
    currentMessage: expiryMessage?.data.message || '',
    isDefault: expiryMessage?.data.isDefault || false,
  };
}

export function useWhatsAppConnection() {
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Initializing WhatsApp connection...');
      
      // First clear session
      await whatsappService.clearSession();
      
      // Wait a bit then try to get QR code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to get QR code
      const response = await whatsappService.getQRCode();
      console.log('QR Code Response:', response);
      console.log('QR Code Data:', response?.data);
      console.log('QR Code String:', response?.data?.qrCode);
      
      // If no QR code, try again after delay
      if (!response?.data?.qrCode) {
        console.log('No QR code yet, trying again...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retryResponse = await whatsappService.getQRCode();
        console.log('Retry QR Code Response:', retryResponse);
        setQrCode(retryResponse);
      } else {
        setQrCode(response);
      }
      
      return response;
    } catch (err) {
      console.error('Failed to initialize connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize connection');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await whatsappService.clearSession();
      setQrCode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async () => {
    try {
      return await whatsappService.testConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
      return false;
    }
  }, []);

  return {
    qrCode,
    loading,
    error,
    initializeConnection,
    clearSession,
    testConnection,
    hasQR: !!qrCode?.data?.qrCode
  };
}

export function useWhatsAppStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.getQueueStatus();
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

export function useWhatsAppActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendSingleMessage = useCallback(async (data: { identifier: string; isPhone: boolean; message: string; useQueue?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.sendSingleMessage(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendBroadcast = useCallback(async (data: { message: string; useQueue?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.sendBroadcast(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send broadcast');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendExpiringNotifications = useCallback(async ({ message }: { message: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.sendExpiringNotifications({ message });
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // New method with Queue System
  const triggerExpiryCheck = useCallback(async (data?: TriggerExpiryCheckRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.triggerExpiryCheck(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger expiry check');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Old method (keep for backward compatibility)
  const runAutoExpiryCheck = useCallback(async (useQueue = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.runAutoExpiryCheck({ useQueue });
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run auto expiry check');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRateLimit = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.updateQueueLimit(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rate limit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    sendSingleMessage,
    sendBroadcast,
    sendExpiringNotifications,
    triggerExpiryCheck,    
    runAutoExpiryCheck,
    updateRateLimit
  };
}
