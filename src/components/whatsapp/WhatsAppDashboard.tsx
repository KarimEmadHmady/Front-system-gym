import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppStatusCard } from './WhatsAppStatusCard';
import { WhatsAppQueueStatus } from './WhatsAppQueueStatus';
import { SendMessageForm } from './SendMessageForm';
import { DirectMessageForm } from './DirectMessageForm';
import { BroadcastForm } from './BroadcastForm';
import { ExpiryMessageEditor } from './ExpiryMessageEditor';
import WhatsAppErrorBoundary from './WhatsAppErrorBoundary';
import { useWhatsAppStatus } from '@/hooks/useWhatsApp';
import { useWhatsAppActions } from '@/hooks/useWhatsApp';
import { useAutoStatus } from '@/hooks/useWhatsApp';
import { useExpiryMessage } from '@/hooks/useWhatsApp';
import { 
  Settings, 
  RefreshCw,
  MessageSquare,
  Users,
  Smartphone,
  Activity,
  Bell,

} from 'lucide-react';

interface WhatsAppDashboardProps {
  className?: string;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

  .wad-root {
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    min-height: 100vh;
    background: #1e2939;
    padding: 32px;
    color: #e8f5e9;
    border-radius: 12px;
  }

  /* Header */
  .wad-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .wad-header-title {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    margin: 0 0 6px 0;
    letter-spacing: -0.8px;
  }
  .wad-header-title span {
    background: linear-gradient(135deg, #25d366, #128c7e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .wad-header-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.38);
    margin: 0;
  }
  .wad-badges {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .wad-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12.5px;
    font-weight: 700;
  }
  .wad-badge.green {
    background: rgba(37,211,102,0.1);
    border: 1px solid rgba(37,211,102,0.3);
    color: #25d366;
  }
  .wad-badge.red {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171;
  }
  .wad-badge.amber {
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.3);
    color: #fbbf24;
  }
  .wad-badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: currentColor;
  }
  .wad-badge-dot.pulse { animation: waDotPulse 2s infinite; }
  @keyframes waDotPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* Tabs */
  .wad-tabs-list {
    display: flex;
    gap: 4px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 5px;
    margin-bottom: 28px;
    overflow-x: auto;
  }
  .wad-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 11px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.45);
    font-size: 13.5px;
    font-weight: 600;
    font-family: 'Cairo', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .wad-tab:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.04); }
  .wad-tab.active {
    background: rgba(37,211,102,0.12);
    border: 1px solid rgba(37,211,102,0.25);
    color: #25d366;
  }

  /* Content */
  .wad-content { }
  .wad-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  @media (max-width: 768px) {
    .wad-grid-2 { grid-template-columns: 1fr; }
    .wad-root { padding: 16px; }
    .wad-tabs-list { border-radius: 12px; }
  }
  .wad-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 900px) {
    .wad-grid-3 { grid-template-columns: 1fr; }
  }

  /* Action card */
  .wad-action-card {
    background: linear-gradient(145deg, #0d1b2a 0%, #1b2838 100%);
    border: 1px solid rgba(37, 211, 102, 0.12);
    border-radius: 18px;
    padding: 22px;
    position: relative;
    overflow: hidden;
  }
  .wad-action-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(37,211,102,0.3), transparent);
  }
  .wad-action-title {
    font-size: 15px;
    font-weight: 700;
    color: #e8f5e9;
    margin: 0 0 16px 0;
  }

  /* Action buttons */
  .wad-action-btn {
    width: 100%;
    padding: 13px 18px;
    border-radius: 12px;
    border: none;
    font-size: 13.5px;
    font-weight: 700;
    font-family: 'Cairo', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .wad-action-btn.primary {
    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
    color: #fff;
    box-shadow: 0 4px 18px rgba(37,211,102,0.22);
  }
  .wad-action-btn.primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .wad-action-btn.outline {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.65);
  }
  .wad-action-btn.outline:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
  .wad-action-btn:disabled { opacity: 0.38; cursor: not-allowed; transform: none; }

  /* Expiry tab */
  .wad-expiry-card {
    background: linear-gradient(145deg, #0d1b2a 0%, #1b2838 100%);
    border: 1px solid rgba(37, 211, 102, 0.12);
    border-radius: 18px;
    padding: 22px;
    position: relative;
    overflow: hidden;
  }
  .wad-expiry-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(37,211,102,0.3), transparent);
  }
  .wad-expiry-title {
    font-size: 15px;
    font-weight: 700;
    color: #e8f5e9;
    margin: 0 0 16px 0;
  }
  .wad-msg-preview {
    padding: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    font-size: 13.5px;
    color: rgba(255,255,255,0.55);
    line-height: 1.7;
    margin-bottom: 14px;
  }
  .wad-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
  }
  .wad-status-pill.active {
    background: rgba(37,211,102,0.1);
    border: 1px solid rgba(37,211,102,0.3);
    color: #25d366;
  }
  .wad-status-pill.inactive {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.38);
  }
  .wad-status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .wad-status-dot.pulse { animation: waDotPulse 2s infinite; }
  .wad-status-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
  }
  .wad-status-info p {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    margin: 0;
  }
  .wad-actions-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Settings tab */
  .wad-settings-card {
    background: linear-gradient(145deg, #0d1b2a 0%, #1b2838 100%);
    border: 1px solid rgba(37, 211, 102, 0.12);
    border-radius: 18px;
    padding: 32px;
    text-align: center;
  }
  .wad-settings-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    background: rgba(37,211,102,0.07);
    border: 1px solid rgba(37,211,102,0.15);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  .wad-settings-title {
    font-size: 16px;
    font-weight: 700;
    color: rgba(255,255,255,0.6);
    margin: 0 0 8px;
  }
  .wad-settings-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.25);
    margin: 0;
  }

  /* Divider spacing */
  .wad-spacer { height: 20px; }

  /* Notifications */
  .wad-notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 8px;
    margin-top: 16px;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  }
  .wad-notification.success {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }
  .wad-notification.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }
  .wad-notification.info {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #3b82f6;
  }
  .wad-notification-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    flex: 1;
  }
  .wad-notification-text {
    font-size: 14px;
    font-weight: 600;
  }
  .wad-notification-count {
    font-size: 12px;
    opacity: 0.8;
    font-weight: 500;
  }
  .wad-notification-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
  }
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Data Display */
  .wad-data-display {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .wad-data-display h4 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255,255,255,0.8);
  }
  .wad-data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }
  .wad-data-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255,255,255,0.05);
    border-radius: 6px;
  }
  .wad-data-label {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
  }
  .wad-data-value {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
  }
  .wad-message {
    margin: 8px 0 0;
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    font-style: italic;
  }

  /* Queue Option Toggle */
  .wad-queue-option {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .wad-toggle-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    margin-bottom: 8px;
  }
  .wad-toggle-input {
    display: none;
  }
  .wad-toggle-slider {
    width: 48px;
    height: 24px;
    background: rgba(255,255,255,0.2);
    border-radius: 12px;
    position: relative;
    transition: all 0.3s;
  }
  .wad-toggle-slider::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s;
  }
  .wad-toggle-input:checked + .wad-toggle-slider {
    background: rgba(37,211,102,0.5);
  }
  .wad-toggle-input:checked + .wad-toggle-slider::before {
    transform: translateX(24px);
  }
  .wad-toggle-text {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
  }
  .wad-toggle-help {
    font-size: 12px;
    color: rgba(255,255,255,0.6);
    margin-top: 8px;
    line-height: 1.4;
  }

  /* Message Editor */
  .wad-message-editor {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .wad-message-editor h4 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255,255,255,0.8);
  }
  .wad-form-group {
    margin-bottom: 16px;
  }
  .wad-form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    margin-bottom: 8px;
  }
  .wad-form-textarea {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 12px;
    color: rgba(255,255,255,0.9);
    font-size: 14px;
    font-family: 'Cairo', sans-serif;
    resize: vertical;
    min-height: 100px;
  }
  .wad-form-textarea:focus {
    outline: none;
    border-color: rgba(37,211,102,0.5);
    box-shadow: 0 0 0 2px rgba(37,211,102,0.1);
  }
  .wad-form-help {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    margin-top: 8px;
    font-style: italic;
  }

  /* Current Message Display */
  .wad-current-message {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .wad-message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .wad-message-title {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.8);
  }
  .wad-default-badge {
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #3b82f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }
  .wad-message-content {
    color: rgba(255,255,255,0.9);
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    font-family: 'Cairo', sans-serif;
  }

  /* Variables Preview */
  .wad-variables-preview {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .wad-variables-preview h4 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255,255,255,0.8);
  }
  .wad-variables-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  .wad-variable-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255,255,255,0.05);
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .wad-variable-key {
    font-size: 13px;
    color: rgba(37,211,102,0.8);
    font-weight: 600;
    font-family: monospace;
  }
  .wad-variable-value {
    font-size: 13px;
    color: rgba(255,255,255,0.9);
    font-weight: 500;
  }
  .wad-message-preview {
    margin-top: 16px;
  }
  .wad-message-preview h5 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
  }
  .wad-preview-box {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 16px;
    color: rgba(255,255,255,0.9);
    font-size: 14px;
    line-height: 1.6;
    min-height: 60px;
  }
`;

const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: Activity },
  { id: 'single',   label: 'رسالة فردية', icon: MessageSquare },
  { id: 'direct',    label: 'رسالة مباشرة', icon: Smartphone },
  { id: 'broadcast',label: 'رسالة عامة', icon: Users },
  { id: 'expiry',   label: 'انتهاء الاشتراك', icon: Bell },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

export function WhatsAppDashboard({ className }: WhatsAppDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { isConnected, mockMode } = useWhatsAppStatus();
  const { sendExpiringNotifications, triggerExpiryCheck, runAutoExpiryCheck, loading } = useWhatsAppActions();
  const hasTriggeredRef = useRef(false);
  const { isRunning, lastCheck } = useAutoStatus();
  const { currentMessage } = useExpiryMessage();
  const [expiryLoading, setExpiryLoading] = useState(false);
  const [expiryNotification, setExpiryNotification] = useState<string | null>(null);
  const [expiryData, setExpiryData] = useState<any>(null);
  const [expirySuccess, setExpirySuccess] = useState<boolean | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [useQueue, setUseQueue] = useState(true); // New state for queue option

  // Determine if auto system is active - either running directly or queue is enabled (which is the normal state)
  const isAutoSystemActive = isRunning || useQueue;

  // Automatic expiry check when component mounts
  useEffect(() => {
    // Only run once when component mounts and WhatsApp is connected
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      // Wait a bit for connection to stabilize, then check
      const timer = setTimeout(() => {
        if (isConnected) {
          console.log("Checking for expiring subscriptions automatically...");
          
          triggerExpiryCheck({ useQueue: true, checkAlreadyNotified: true })
            .then((res: any) => {
              console.log("Auto-check done:", res);
              
              // Handle both queue and direct response structures
              if (res?.success) {
                // Queue response structure
                if (res.queueStatus) {
                  const queued = res.queueStatus.queue || 0;
                  const completed = res.queueStatus.completed || 0;
                  
                  if (completed > 0) {
                    console.log('Sent ' + completed + ' expiring notifications automatically');
                  }
                  if (queued > 0) {
                    console.log('Queued ' + queued + ' expiring notifications for processing');
                  }
                }
                // Direct response structure
                else if (res.data) {
                  const sent = res.data.sent || 0;
                  const total = res.data.total || 0;
                  
                  if (sent > 0) {
                    console.log('Sent ' + sent + ' out of ' + total + ' expiring notifications automatically');
                  }
                }
              }
            })
            .catch(err => {
              console.error("Auto-check failed:", err);
            });
        }
      }, 2000); // Wait 2 seconds for connection to stabilize
      
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array - run only once on mount


  
  const handleAutoCheck = async () => {
    try { 
      setExpiryLoading(true);
      setExpiryNotification('جاري تشغيل فحص انتهاء الاشتراكات...');
      
      // Use the new triggerExpiryCheck method
      const response = await triggerExpiryCheck({ 
        useQueue: useQueue,
        messageTemplate: currentMessage 
      });
      
      setExpiryData(response);
      setExpiryNotification('تم تشغيل الفحص التلقائي بنجاح!');
      
      // Trigger auto-refresh in queue status
      window.dispatchEvent(new CustomEvent('whatsapp-expiry-action', {
        detail: { action: 'auto-check' }
      }));
      
      setTimeout(() => {
        setExpiryNotification(null);
        setExpiryData(null);
      }, 3000);
    } catch (e) { 
      console.error(e); 
      setExpiryNotification('❌ فشل تشغيل الفحص');
      setTimeout(() => setExpiryNotification(null), 3000);
    } finally {
      setExpiryLoading(false);
    }
  };
  
  const handleReconnect = async () => {
    try { 
      // Call clear session endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notify/clear-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`
        }
      });
      
      if (response.ok) {
        // Trigger status refresh
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (e) { console.error(e); }
  };
  
  const handleSuccess = () => console.log('Operation completed');

  return (
    <>
      <style>{styles}</style>
      <WhatsAppErrorBoundary>
        <div className={`wad-root ${className ?? ''}`}>
          {/* Header */}
          <div className="wad-header">
            <div>
              <h1 className="wad-header-title">
                إشعارات <span>WhatsApp</span>
              </h1>
              <p className="wad-header-sub">إدارة وإرسال إشعارات WhatsApp للأعضاء</p>
            </div>
            <div className="wad-badges">
              <span className={`wad-badge ${mockMode ? 'amber' : 'green'}`}>
                <span className={`wad-badge-dot ${!mockMode ? 'pulse' : ''}`} />
                {mockMode ? 'وضع تجريبي' : 'وضع فعلي'}
              </span>
              <span className={`wad-badge ${isConnected ? 'green' : 'red'}`}>
                <span className={`wad-badge-dot ${isConnected ? 'pulse' : ''}`} />
                {isConnected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="wad-tabs-list">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`wad-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div>
              <div className="wad-grid-2">
                <WhatsAppErrorBoundary>
                  <WhatsAppStatusCard />
                </WhatsAppErrorBoundary>
                <WhatsAppErrorBoundary>
                  <WhatsAppQueueStatus />
                </WhatsAppErrorBoundary>
              </div>
              <div className="wad-action-card">
                <p className="wad-action-title">إجراءات سريعة</p>
                
                {/* Notification */}
                {expiryNotification && (
                  <div className={`wad-notification ${expiryNotification.includes('✅') ? 'success' : expiryNotification.includes('❌') ? 'error' : 'info'}`}>
                    {expiryNotification}
                  </div>
                )}

                {/* Data Display */}
                {expiryData && (
                  <div className="wad-data-display">
                    <h4>📊 نتيجة الفحص:</h4>
                    
                    {/* Queue Response Display */}
                    {'queueStatus' in expiryData && (
                      <div className="wad-data-grid">
                        <div className="wad-data-item">
                          <span className="wad-data-label">في الطابور:</span>
                          <span className="wad-data-value">{expiryData.queueStatus.queue}</span>
                        </div>
                        <div className="wad-data-item">
                          <span className="wad-data-label">قيد المعالجة:</span>
                          <span className="wad-data-value">{expiryData.queueStatus.processing}</span>
                        </div>
                        <div className="wad-data-item">
                          <span className="wad-data-label">تم الإرسال:</span>
                          <span className="wad-data-value">{expiryData.queueStatus.completed}</span>
                        </div>
                        <div className="wad-data-item">
                          <span className="wad-data-label">فشل:</span>
                          <span className="wad-data-value">{expiryData.queueStatus.failed}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Direct Response Display */}
                    {'data' in expiryData && (
                      <div className="wad-data-grid">
                        <div className="wad-data-item">
                          <span className="wad-data-label">تم الإرسال:</span>
                          <span className="wad-data-value">{expiryData.data.sent}</span>
                        </div>
                        <div className="wad-data-item">
                          <span className="wad-data-label">الإجمالي:</span>
                          <span className="wad-data-value">{expiryData.data.total}</span>
                        </div>
                        <div className="wad-data-item">
                          <span className="wad-data-label">فشل:</span>
                          <span className="wad-data-value">{expiryData.data.failed}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Queue Option Toggle */}
                <div className="wad-queue-option">
                  <label className="wad-toggle-label">
                    <input
                      type="checkbox"
                      checked={useQueue}
                      onChange={(e) => setUseQueue(e.target.checked)}
                      className="wad-toggle-input"
                    />
                    <span className="wad-toggle-slider"></span>
                    <span className="wad-toggle-text">
                      {useQueue ? '📋 استخدام الطابور (مستحسن)' : '⚡ إرسال مباشر'}
                    </span>
                  </label>
                  <div className="wad-toggle-help">
                    {useQueue 
                      ? '📋 الطابور: إرسال منظم ومستقر للعدد الكبير'
                      : '⚡ مباشر: إرسال فوري للعدد المحدود (تجربة)'
                    }
                  </div>
                </div>

                <div className="wad-grid-2">

                  <button
                    className="wad-action-btn outline"
                    onClick={handleAutoCheck}
                    disabled={expiryLoading || loading || !isConnected}
                  >
                    <RefreshCw size={15} className={expiryLoading ? 'animate-spin' : ''} />
                    {expiryLoading ? 'جاري الفحص...' : 'تشغيل الفحص التلقائي'}
                  </button>
                  <button
                    className="wad-action-btn outline"
                    onClick={handleReconnect}
                    disabled={!isConnected}
                  >
                    <Smartphone size={15} />
                    إعادة الاتصال
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'single' && (
            <WhatsAppErrorBoundary>
              <SendMessageForm onSuccess={handleSuccess} />
            </WhatsAppErrorBoundary>
          )}

          {activeTab === 'direct' && (
            <WhatsAppErrorBoundary>
              <DirectMessageForm onSuccess={handleSuccess} />
            </WhatsAppErrorBoundary>
          )}

          {activeTab === 'broadcast' && (
            <WhatsAppErrorBoundary>
              <BroadcastForm onSuccess={handleSuccess} />
            </WhatsAppErrorBoundary>
          )}

          {activeTab === 'expiry' && (
            <div className="wad-grid-2">
              <div className="wad-expiry-card">
                <p className="wad-expiry-title">رسالة انتهاء الاشتراك الحالية</p>
                <div className="wad-msg-preview">{currentMessage}</div>
                <div className="wad-status-info">
                  <span className={`wad-status-pill ${isAutoSystemActive ? 'active' : 'inactive'}`}>
                    <span className={`wad-status-dot ${isAutoSystemActive ? 'pulse' : ''}`} />
                    {isAutoSystemActive ? 'نشط' : 'غير نشط'}
                  </span>
                  <p>
                    النظام التلقائي لإرسال الإشعارات
                    {useQueue && <span style={{ color: '#25d366', fontSize: '12px' }}> (طابور)</span>}
                  </p>
                </div>
              </div>
              <div className="wad-expiry-card">
                <p className="wad-expiry-title">الإجراءات</p>
                <div className="wad-actions-col">
                  <button className="wad-action-btn outline" onClick={handleAutoCheck} disabled={loading || !isConnected}>
                    <RefreshCw size={15} />
                    تشغيل الفحص التلقائي
                  </button>
                  <button 
                    className="wad-action-btn outline" 
                    onClick={() => setActiveTab('settings')}
                    disabled={!isConnected}
                  >
                    <Settings size={15} />
                    تعديل الرسالة الافتراضية
                  </button>
                </div>
                
                {/* Notification Feedback */}
                {expiryNotification && (
                  <div className={`wad-notification ${expirySuccess === true ? 'success' : expirySuccess === false ? 'error' : 'info'}`}>
                    <div className="wad-notification-content">
                      <span className="wad-notification-text">{expiryNotification}</span>
                      {sentCount !== null && sentCount > 0 && (
                        <span className="wad-notification-count">{sentCount} رسالة</span>
                      )}
                    </div>
                    {expiryLoading && (
                      <div className="wad-notification-spinner">
                        <RefreshCw size={14} className="animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="wad-settings-card">
              <div className="wad-settings-icon">
                <Settings size={28} color="rgba(37,211,102,0.5)" />
              </div>
              <p className="wad-settings-title">إعدادات WhatsApp</p>
              
              {/* Notification */}
              {expiryNotification && (
                <div className={`wad-notification ${expiryNotification.includes('✅') ? 'success' : expiryNotification.includes('❌') ? 'error' : 'info'}`}>
                  {expiryNotification}
                </div>
              )}

              {/* Expiry Message Editor Component */}
              <WhatsAppErrorBoundary>
                <ExpiryMessageEditor />
              </WhatsAppErrorBoundary>
            </div>
          )}
        </div>
      </WhatsAppErrorBoundary>
    </>
  );
}