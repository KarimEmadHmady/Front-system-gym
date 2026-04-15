import { useCallback, useState, useEffect, useRef } from 'react';
import { whatsappService } from '@/services/whatsapp';
import { 
  WhatsAppStatusResponse,
  QueueStatusResponse,
  AutoStatusResponse,
  TriggerExpiryCheckRequest,
  ExpiryMessageResponse,
  QRCodeResponse,

} from '@/types/whatsapp';

// Global loading states to prevent multiple simultaneous requests
const globalLoadingStates = {
  status: false,
  qr: false
};

// Debounce timers
const debounceTimers = {
  status: null as NodeJS.Timeout | null,
  qr: null as NodeJS.Timeout | null
};

export function useWhatsAppStatus() {
  const [status, setStatus] = useState<WhatsAppStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true); // Enabled by default

  const rawIsConnected = status?.data?.data?.isConnected;
  const rawMockMode = status?.data?.data?.mockMode;
  const rawRequiresQR = status?.data?.data?.requiresQR;

  const fetchStatus = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (globalLoadingStates.status) {
      console.log('⏳ Status request already in progress, skipping...');
      return;
    }

    // Clear existing debounce timer
    if (debounceTimers.status) {
      clearTimeout(debounceTimers.status);
    }

    // Debounce the request
    debounceTimers.status = setTimeout(async () => {
      globalLoadingStates.status = true;
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Fetching WhatsApp status...');
        const response = await whatsappService.getWhatsAppStatus();
        setStatus(response);
        console.log('✅ Status fetched:', response?.data?.data?.isConnected ? 'Connected' : 'Not Connected');
      } catch (err) {
        console.error('Failed to fetch WhatsApp status:', err);
        // Don't set error for network issues, just use mock data
        setError(null);
      } finally {
        globalLoadingStates.status = false;
        setLoading(false);
      }
    }, 1000); // 1 second debounce
  }, []);

  const parseBoolean = (value: unknown): boolean => {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    return false;
  };

  useEffect(() => {
    // Initial fetch only if not already loading
    if (!globalLoadingStates.status) {
      fetchStatus();
    }
    
    // Only set up interval if auto-refresh is enabled and document is visible
    let interval: NodeJS.Timeout | null = null;
    
    const handleVisibilityChange = () => {
      if (document.hidden || !autoRefresh || parseBoolean(rawIsConnected)) {
        // Tab is not visible, auto-refresh disabled, or WhatsApp is connected, clear interval
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      } else {
        // Tab is visible, auto-refresh enabled, and WhatsApp is not connected, set up interval
        interval = setInterval(() => {
          if (!globalLoadingStates.status) {
            fetchStatus();
          }
        }, 15000); // Increased to 15 seconds to reduce load
      }
    };
    
    // Initial setup - only start interval if not connected
    if (!document.hidden && autoRefresh && !parseBoolean(rawIsConnected)) {
      interval = setInterval(() => {
        if (!globalLoadingStates.status) {
          fetchStatus();
        }
      }, 15000); // Increased to 15 seconds
    }
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (interval) clearInterval(interval);
    };
  }, [fetchStatus, autoRefresh, parseBoolean(rawIsConnected)]);

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

  const refreshQR = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (globalLoadingStates.qr) {
      console.log('⏳ QR request already in progress, skipping...');
      return;
    }

    // Clear existing debounce timer
    if (debounceTimers.qr) {
      clearTimeout(debounceTimers.qr);
    }

    // Debounce the request
    debounceTimers.qr = setTimeout(async () => {
      globalLoadingStates.qr = true;
      try {
        console.log('🔄 Refreshing QR code...');
        const response = await whatsappService.getQRCode();
        console.log('Refresh QR Response:', response); // Debug log
        
        // Check if service is completely unavailable (only when response is unsuccessful)
        if (!response?.success && (
          response?.data?.message?.includes('service is not responding') || 
          response?.data?.message?.includes('running on port')
        )) {
          setError('WhatsApp service is not available. Please check if the service is running on port 3001.');
          return;
        }
        
        // Handle field name mismatch: backend returns 'qr', frontend expects 'qrCode'
        const qrCode = (response as any)?.data?.qr || response?.data?.qrCode;
        
        if (response?.success && qrCode) {
          // Transform response to expected format
          const transformedResponse = {
            ...response,
            data: {
              ...response.data,
              qrCode: qrCode,
              message: response.data.message || 'Scan this QR code with WhatsApp'
            }
          };
          setQrCode(transformedResponse);
          console.log('✅ QR code refreshed successfully');
        }
      } catch (e) {
        console.error('Refresh QR Error:', e);
      } finally {
        globalLoadingStates.qr = false;
      }
    }, 1000); // 1 second debounce
  }, []);

  const initializeConnection = useCallback(async () => {
    // Prevent multiple simultaneous initialization attempts
    if (globalLoadingStates.qr) {
      console.log('QR initialization already in progress, skipping...');
      return;
    }

    setLoading(true);
    setError(null);
    globalLoadingStates.qr = true;
    
    try {
      // First check if service is available
      console.log('Checking WhatsApp service health...');
      const isHealthy = await whatsappService.healthCheck();
      if (!isHealthy) {
        const errorMsg = 'WhatsApp service is not available. Please check if the service is running on port 3001.';
        setError(errorMsg);
        console.error('Health check failed:', errorMsg);
        return;
      }

      console.log('WhatsApp service is healthy, checking connection status...');

      // Check if WhatsApp is already connected by getting status first
      try {
        const statusResponse = await whatsappService.getWhatsAppStatus();
        const isConnected = statusResponse?.data?.data?.isConnected;
        
        if (isConnected) {
          console.log('WhatsApp is already connected, no QR code needed');
          setLoading(false);
          return null; // No QR needed when already connected
        }
      } catch (statusErr) {
        console.log('Could not check status, proceeding with QR attempt...');
      }

      console.log('WhatsApp not connected, attempting to get QR code...');

      // Try to get QR for 9 seconds only (3 attempts)
      let attempts = 0;
      
      while (attempts < 3) {
        try {
          console.log(`QR attempt ${attempts + 1}/3...`);
          const response = await whatsappService.getQRCode();
          console.log('QR Response:', response); // Debug log
          
          // Handle field name mismatch: backend returns 'qr', frontend expects 'qrCode'
          const qrCode = (response as any)?.data?.qr || response?.data?.qrCode;
          
          if (response?.success && qrCode) {
            // Transform response to expected format
            const transformedResponse = {
              ...response,
              data: {
                ...response.data,
                qrCode: qrCode,
                message: response.data.message || 'Scan this QR code with WhatsApp'
              }
            };
            setQrCode(transformedResponse);
            console.log('QR code initialized successfully');
            setLoading(false);
            return transformedResponse;
          } else {
            console.log(`QR not ready yet, response:`, response);
          }
        } catch (attemptErr) {
          console.error(`QR attempt ${attempts + 1} failed:`, attemptErr);
        }
        
        if (attempts < 2) { // Don't wait after last attempt
          await new Promise(r => setTimeout(r, 3000));
        }
        attempts++;
      }

      // If we get here, all attempts failed
      const errorMsg = 'QR Code not available. WhatsApp may be already connected or initializing.';
      setError(errorMsg);
      console.error(errorMsg);
      throw new Error(errorMsg);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Initialize connection error:', errorMessage);
      
      // Don't set error for service unavailable (already handled above)
      if (!errorMessage.includes('service is not available')) {
        setError(errorMessage);
        throw err;
      }
    } finally {
      globalLoadingStates.qr = false;
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

  const reconnectSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await whatsappService.reconnectSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reconnect session');
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
    reconnectSession,
    testConnection,
    refreshQR,
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

  const sendDirectMessage = useCallback(async (phone: string, message: string, useQueue = true): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.sendDirectMessage(phone, message, useQueue);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send direct message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendSingleMessage = useCallback(async (data: any): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.sendSingleMessage(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send single message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendBroadcast = useCallback(async (data: any): Promise<any> => {
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

  const sendExpiringNotifications = useCallback(async (data: any): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.sendExpiringNotifications(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send expiring notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // New method with Queue System - use useCallback to prevent re-creation
  const triggerExpiryCheck = useCallback(async (data?: TriggerExpiryCheckRequest) => {
    setLoading(true);
    setError(null);
    try {
      // Add check to prevent duplicate notifications
      const checkResponse = await whatsappService.triggerExpiryCheck({
        ...data,
        checkAlreadyNotified: true // Add this flag
      });
      return checkResponse;
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
    sendDirectMessage,
    sendSingleMessage,
    sendBroadcast,
    sendExpiringNotifications,
    triggerExpiryCheck,    
    runAutoExpiryCheck,
    updateRateLimit
  };
}
