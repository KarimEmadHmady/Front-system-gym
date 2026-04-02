import React from 'react';
import { useQueueStatus } from '@/hooks/useWhatsApp';
import { formatTimeRemaining, calculateEstimatedTime } from '@/lib/whatsapp';
import {
  MessageSquare,
  Clock,
  Send,
  AlertCircle,
  Activity,
  Timer,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface WhatsAppQueueStatusProps {
  className?: string;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

  .waq-card {
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
  .waq-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #128c7e 30%, #25d366 70%, transparent 100%);
  }
  .waq-glow {
    position: absolute;
    bottom: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(18,140,126,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .waq-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }
  .waq-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .waq-icon-ring {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(37, 211, 102, 0.1);
    border: 1px solid rgba(37, 211, 102, 0.22);
    display: flex; align-items: center; justify-content: center;
  }
  .waq-title {
    font-size: 16px;
    font-weight: 700;
    color: #e8f5e9;
    margin: 0;
  }
  .waq-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .waq-status-pill.processing {
    background: rgba(37, 211, 102, 0.1);
    border: 1px solid rgba(37, 211, 102, 0.3);
    color: #25d366;
  }
  .waq-status-pill.pending {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #fbbf24;
  }
  .waq-status-pill.idle {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.45);
  }
  .waq-dot-pulse {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: qDotPulse 1.5s infinite;
  }
  @keyframes qDotPulse {
    0%, 100% { opacity: 1; } 50% { opacity: 0.35; }
  }
  .waq-refresh-btn {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.45);
    transition: all 0.2s;
    margin-right: 8px;
  }
  .waq-refresh-btn:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.8); }
  .waq-refresh-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  
  /* Progress bar */
  .waq-progress-wrap {
    margin-bottom: 20px;
  }
  .waq-progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .waq-progress-label span {
    font-size: 12px;
    color: rgba(255,255,255,0.45);
  }
  .waq-progress-label .waq-pct {
    color: #25d366;
    font-weight: 700;
  }
  .waq-progress-track {
    height: 6px;
    background: rgba(255,255,255,0.06);
    border-radius: 99px;
    overflow: hidden;
  }
  .waq-progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #128c7e, #25d366);
    transition: width 0.5s ease;
    position: relative;
  }
  .waq-progress-fill::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    animation: shimmer 2s infinite;
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* Stats */
  .waq-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .waq-stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .waq-stat-icon-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .waq-stat-label {
    font-size: 11.5px;
    color: rgba(255,255,255,0.4);
    margin: 0;
  }
  .waq-stat-number {
    font-size: 30px;
    font-weight: 800;
    margin: 0;
    line-height: 1;
  }
  .waq-stat-number.green { color: #25d366; }
  .waq-stat-number.amber { color: #fbbf24; }
  .waq-stat-number.blue  { color: #60a5fa; }

  /* Rate limits */
  .waq-rate-box {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .waq-rate-title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    margin: 0 0 12px 0;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .waq-rate-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .waq-rate-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .waq-rate-item span:first-child {
    font-size: 11.5px;
    color: rgba(255,255,255,0.35);
  }
  .waq-rate-item span:last-child {
    font-size: 12px;
    font-weight: 700;
    color: #25d366;
  }

  /* Alerts */
  .waq-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 13px;
    border-radius: 12px;
    margin-bottom: 12px;
  }
  .waq-alert.blue {
    background: rgba(96, 165, 250, 0.07);
    border: 1px solid rgba(96, 165, 250, 0.2);
  }
  .waq-alert.amber {
    background: rgba(245, 158, 11, 0.07);
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
  .waq-alert-content {}
  .waq-alert-title {
    font-size: 12.5px;
    font-weight: 700;
    margin: 0 0 3px 0;
  }
  .waq-alert.blue .waq-alert-title { color: #93c5fd; }
  .waq-alert.amber .waq-alert-title { color: #fbbf24; }
  .waq-alert-sub {
    font-size: 12px;
    margin: 0;
  }
  .waq-alert.blue .waq-alert-sub { color: rgba(147, 197, 253, 0.7); }
  .waq-alert.amber .waq-alert-sub { color: rgba(251, 191, 36, 0.7); }

  /* Empty state */
  .waq-empty {
    text-align: center;
    padding: 40px 0;
    color: rgba(255,255,255,0.2);
  }
  .waq-empty p {
    margin: 12px 0 0;
    font-size: 13px;
  }
`;

export function WhatsAppQueueStatus({ className }: WhatsAppQueueStatusProps) {
  const { queueStatus, loading, error, refetch, autoRefresh, setAutoRefresh, queueLength, isProcessing, sentCount, pendingCount } = useQueueStatus();

  const totalMessages = sentCount + pendingCount + (queueStatus?.data.processingCount || 0);
  const progressPercentage = totalMessages > 0 ? (sentCount / totalMessages) * 100 : 0;
  const estimatedTime = queueStatus ? calculateEstimatedTime(pendingCount, queueStatus.data.rateLimit) : 0;

  const getStatusClass = () => {
    if (loading) return 'idle';
    if (isProcessing) return 'processing';
    if (pendingCount > 0) return 'pending';
    return 'idle';
  };

  const getStatusText = () => {
    if (loading) return 'جاري التحميل...';
    if (isProcessing) return 'قيد المعالجة';
    if (pendingCount > 0) return 'في الانتظار';
    return 'مكتمل';
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw size={14} className="animate-spin" />;
    if (isProcessing) return <Activity size={14} />;
    if (pendingCount > 0) return <Clock size={14} />;
    return <CheckCircle size={14} />;
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`waq-card ${className ?? ''}`}>
        <div className="waq-glow" />

        {/* Header */}
        <div className="waq-header">
          <div className="waq-title-row">
            <h3 className="waq-title">حالة الطابور</h3>
            <span className={`waq-status ${getStatusClass()}`}>
            <div className="flex items-center gap-2">
             <span>{getStatusIcon()}</span>
             <span>{getStatusText()}</span>
            </div>
            </span>
          </div>
          <div className="waq-actions">
            <button 
              onClick={refetch} 
              disabled={loading}
              className="waq-btn"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`waq-btn ${autoRefresh ? 'active' : ''}`}
              title={`Auto-refresh ${autoRefresh ? 'ON' : 'OFF'}`}
            >
              <Activity size={14} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="waq-progress-wrap">
          <div className="waq-progress-label">
            <span>تقدم الإرسال</span>
            <span className="waq-pct">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="waq-progress-track">
            <div className="waq-progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="waq-stats-grid">
          <div className="waq-stat">
            <div className="waq-stat-icon-row">
              <Send size={15} color="#25d366" />
              <p className="waq-stat-label">تم الإرسال</p>
            </div>
            <p className="waq-stat-number green">{sentCount}</p>
          </div>
          <div className="waq-stat">
            <div className="waq-stat-icon-row">
              <Clock size={15} color="#fbbf24" />
              <p className="waq-stat-label">في الانتظار</p>
            </div>
            <p className="waq-stat-number amber">{pendingCount}</p>
          </div>
        </div>

        {/* Processing count */}
        {queueStatus?.data.processingCount && queueStatus.data.processingCount > 0 && (
          <div className="waq-stat" style={{ marginBottom: '12px' }}>
            <div className="waq-stat-icon-row">
              <Activity size={15} color="#60a5fa" />
              <p className="waq-stat-label">قيد المعالجة</p>
            </div>
            <p className="waq-stat-number blue">{queueStatus.data.processingCount}</p>
          </div>
        )}

        {/* Rate limits */}
        {queueStatus?.data.rateLimit && (
          <div className="waq-rate-box">
            <p className="waq-rate-title">معدل الإرسال</p>
            <div className="waq-rate-grid">
              <div className="waq-rate-item">
                <span>في الثانية</span>
                <span>{queueStatus.data.rateLimit.messagesPerSecond}</span>
              </div>
              <div className="waq-rate-item">
                <span>في الدقيقة</span>
                <span>{queueStatus.data.rateLimit.messagesPerMinute}</span>
              </div>
              <div className="waq-rate-item">
                <span>في الساعة</span>
                <span>{queueStatus.data.rateLimit.messagesPerHour}</span>
              </div>
              <div className="waq-rate-item">
                <span>حجم الدفعة</span>
                <span>{queueStatus.data.rateLimit.batchSize}</span>
              </div>
            </div>
          </div>
        )}

        {/* Estimated time */}
        {pendingCount > 0 && estimatedTime > 0 && (
          <div className="waq-alert blue">
            <Timer size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />
            <div className="waq-alert-content">
              <p className="waq-alert-title">الوقت المقدر للإنهاء</p>
              <p className="waq-alert-sub">{formatTimeRemaining(estimatedTime)}</p>
            </div>
          </div>
        )}

        {/* Long queue warning */}
        {queueLength > 100 && (
          <div className="waq-alert amber">
            <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
            <p className="waq-alert-sub" style={{ color: 'rgba(251,191,36,0.8)' }}>
              الطابور طويل جداً ({queueLength} رسالة) — قد يستغرق وقتاً أطول للإرسال
            </p>
          </div>
        )}

        {/* Empty state */}
        {totalMessages === 0 && !loading && (
          <div className="waq-empty">
            <MessageSquare size={44} />
            <p>لا توجد رسائل في الطابور</p>
          </div>
        )}
      </div>
    </>
  );
}