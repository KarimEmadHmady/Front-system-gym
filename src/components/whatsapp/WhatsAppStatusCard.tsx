import React, { useState, useEffect } from 'react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useWhatsAppStatus } from '@/hooks/useWhatsApp';
import { useWhatsAppConnection } from '@/hooks/useWhatsApp';
import { 
  RefreshCw,
  Smartphone,
  Activity,
  AlertCircle,
  QrCode
} from 'lucide-react';

interface WhatsAppStatusCardProps {
  className?: string;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
  
  .wa-card {
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    background: linear-gradient(145deg, #0d1b2a 0%, #1b2838 60%, #0a1628 100%);
    border: 1px solid rgba(37, 211, 102, 0.15);
    border-radius: 20px;
    padding: 24px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 25px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .wa-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #25d366 40%, #128c7e 70%, transparent 100%);
  }
  .wa-card-glow {
    position: absolute;
    top: -40px; left: -40px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(37,211,102,0.07) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  .wa-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .wa-title-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .wa-icon-ring {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(37, 211, 102, 0.1);
    border: 1px solid rgba(37, 211, 102, 0.25);
    display: flex; align-items: center; justify-content: center;
  }
  .wa-title {
    font-size: 16px;
    font-weight: 700;
    color: #e8f5e9;
    margin: 0;
    letter-spacing: -0.2px;
  }
  .wa-badge-connected {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(37, 211, 102, 0.12);
    border: 1px solid rgba(37, 211, 102, 0.3);
    color: #25d366;
    font-size: 12px;
    font-weight: 600;
  }
  .wa-badge-disconnected {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    font-size: 12px;
    font-weight: 600;
  }
  .wa-badge-mock {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #fbbf24;
    font-size: 12px;
    font-weight: 600;
  }
  .wa-badge-error {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(220, 38, 38, 0.15);
    border: 1px solid rgba(220, 38, 38, 0.4);
    color: #ef4444;
    font-size: 12px;
    font-weight: 600;
  }
  .wa-dot-pulse {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #25d366;
    animation: waPulse 2s infinite;
  }
  .wa-dot-off {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #f87171;
  }
  .wa-dot-amber {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #fbbf24;
    animation: waPulse 2s infinite;
  }
  .wa-dot-red {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #ef4444;
    animation: waPulse 1.5s infinite;
  }
  @keyframes waPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }
  .wa-refresh-btn {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.5);
    transition: all 0.2s;
    margin-right: 8px;
  }
  .wa-refresh-btn:hover {
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.8);
  }
  .wa-refresh-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .wa-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 18px;
  }
  .wa-stat-item {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px;
  }
  .wa-stat-label {
    font-size: 11px;
    color: rgba(255,255,255,0.38);
    margin: 0 0 6px 0;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .wa-stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #e8f5e9;
    margin: 0;
  }
  .wa-stat-value.green { color: #25d366; }
  .wa-stat-value.amber { color: #fbbf24; }
  .wa-alert-warning {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px;
    background: rgba(245, 158, 11, 0.07);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 12px;
    margin-bottom: 14px;
  }
  .wa-alert-warning p {
    font-size: 12.5px;
    color: rgba(251, 191, 36, 0.85);
    margin: 0;
    line-height: 1.4;
  }
  .wa-alert-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(220, 38, 38, 0.08);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 12px;
    margin-bottom: 14px;
  }
  .wa-alert-error p {
    font-size: 12.5px;
    color: rgba(239, 68, 68, 0.9);
    margin: 0;
    line-height: 1.4;
  }
  .wa-qr-text {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    margin: 0 0 12px 0;
  }
  .wa-connect-btn {
    width: 100%;
    padding: 11px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
    border: none;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Cairo', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(37,211,102,0.25);
  }
  .wa-connect-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .wa-connect-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .wa-qr-box {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
  }
  .wa-qr-placeholder {
    width: 160px; height: 160px;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .wa-attempts {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    margin-top: 12px;
  }

  /* QR Code Styles */
  .wa-qr-container {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    margin: 12px 0;
  }
  .wa-qr-image {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    background: white;
    padding: 8px;
    margin: 0 auto 12px;
  }
  .wa-qr-message {
    font-size: 12px;
    color: rgba(255,255,255,0.6);
    margin: 0;
  }
`;

export function WhatsAppStatusCard({ className }: WhatsAppStatusCardProps) {
  const { status, loading, isConnected, mockMode, requiresQR, refetch } = useWhatsAppStatus();
  const { initializeConnection, loading: connectionLoading, hasQR, qrCode, refreshQR, error: connectionError } = useWhatsAppConnection();
  
  // Check if service is unavailable
  const isServiceUnavailable = connectionError?.includes('service is not available') || 
                                connectionError?.includes('QR Code not available');

  // Auto-initialize QR when disconnected and service is available - but limit attempts
  useEffect(() => {
    // Only try to get QR if WhatsApp is NOT connected AND requires QR
    if (!isConnected && requiresQR && !connectionLoading && !hasQR && !isServiceUnavailable) {
      console.log('Auto-initializing QR connection...');
      
      // Add a small delay to avoid immediate attempts on component load
      const timer = setTimeout(() => {
        initializeConnection().catch(err => {
          console.error('Auto QR initialization failed:', err);
          // Don't show error to user for auto-attempts, just log it
        });
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    } else if (isConnected && hasQR) {
      // Clear QR if WhatsApp becomes connected
      console.log('WhatsApp is connected, clearing QR code...');
      // The QR should be cleared automatically when connection is established
    } else if (isConnected && !requiresQR) {
      console.log('WhatsApp is connected and does not require QR, skipping initialization');
    }
  }, [isConnected, requiresQR, connectionLoading, hasQR, initializeConnection, isServiceUnavailable]);

  const handleConnect = async () => {
    try {
      await initializeConnection();
    } catch (error) {
      console.error('Failed to initialize connection:', error);
    }
  };

  const renderBadge = () => {
    if (mockMode) {
      return (
        <span className="wa-badge-mock">
          <span className="wa-dot-amber" />
          تجريبي
        </span>
      );
    }
    if (isConnected) {
      return (
        <span className="wa-badge-connected">
          <span className="wa-dot-pulse" />
          متصل
        </span>
      );
    }
    if (isServiceUnavailable) {
      return (
        <span className="wa-badge-error">
          <span className="wa-dot-red" />
          الخدمة غير متوفرة
        </span>
      );
    }
    return (
      <span className="wa-badge-disconnected">
        <span className="wa-dot-off" />
        غير متصل
      </span>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`wa-card ${className ?? ''}`}>
        <div className="wa-card-glow" />

        <div className="wa-header">
          <div className="wa-title-group">
            <div className="wa-icon-ring">
              <Smartphone size={20} color="#25d366" />
            </div>
            <p className="wa-title">حالة WhatsApp</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderBadge()}
            <button
              className="wa-refresh-btn"
              onClick={refetch}
              disabled={loading}
              title="تحديث الحالة"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="wa-grid">
          <div className="wa-stat-item">
            <p className="wa-stat-label">الاتصال</p>
            <p className={`wa-stat-value ${isConnected ? 'green' : ''}`}>
              {isConnected ? 'متصل' : 'غير متصل'}
            </p>
          </div>
          <div className="wa-stat-item">
            <p className="wa-stat-label">الوضع</p>
            <p className={`wa-stat-value ${mockMode ? 'amber' : 'green'}`}>
              {mockMode ? 'تجريبي' : 'فعلي'}
            </p>
          </div>
        </div>

        {mockMode && (
          <div className="wa-alert-warning">
            <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
            <p>النظام يعمل في الوضع التجريبي — لن يتم إرسال رسائل حقيقية</p>
          </div>
        )}

        
        {(!isConnected && (requiresQR || qrCode?.data?.qrCode)) && (
          <div>
            <p className="wa-qr-text">تحتاج لمسح رمز QR للاتصال بـ WhatsApp</p>
            {qrCode?.data?.qrCode ? (
              <div className="wa-qr-container">
                <QRCodeDisplay value={qrCode.data.qrCode} size={200} />
                <p className="wa-qr-message">{qrCode.data.message}</p>
              </div>
            ) : (
              <div className="wa-qr-container">
                <QRCodeDisplay value="https://wa.me/201234567890" size={200} />
                <p className="wa-qr-message">جاري تحميل رمز QR...</p>
              </div>
            )}
            <button className="wa-connect-btn" onClick={handleConnect} disabled={connectionLoading}>
              <QrCode size={16} />
              {connectionLoading ? 'جاري الاتصال...' : 'مسح رمز QR'}
            </button>
          </div>
        )}

        {status?.data?.data?.connectionAttempts !== undefined && status.data.data.connectionAttempts > 0 && (
          <p className="wa-attempts">محاولات الاتصال: {status.data.data.connectionAttempts}</p>
        )}
      </div>
    </>
  );
}