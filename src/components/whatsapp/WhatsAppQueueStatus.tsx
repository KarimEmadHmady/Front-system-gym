import React from 'react';
import { useQueueStatus } from '@/hooks/useWhatsApp';
import { useWhatsAppActions } from '@/hooks/useWhatsApp';
import { formatTimeRemaining, calculateEstimatedTime, DEFAULT_RATE_LIMIT } from '@/lib/whatsapp';
import {
  MessageSquare,
  Send,
  Clock,
  Activity,
  CheckCircle,
  RefreshCw,
  Timer,
  AlertCircle,
  Settings,
  Save,
  X
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
  .waq-title {
    font-size: 16px;
    font-weight: 700;
    color: #e8f5e9;
    margin: 0;
  }
  .waq-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Status Badge */
  .waq-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 20px;
    width: 100%;
    justify-content: center;
    transition: all 0.4s ease;
  }
  .waq-status-badge.processing {
    background: rgba(37, 211, 102, 0.08);
    border: 1px solid rgba(37, 211, 102, 0.25);
    color: #25d366;
  }
  .waq-status-badge.pending {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
    color: #fbbf24;
  }
  .waq-status-badge.idle {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.4);
  }
  .waq-status-badge.done {
    background: rgba(96, 165, 250, 0.08);
    border: 1px solid rgba(96, 165, 250, 0.25);
    color: #60a5fa;
  }
  .waq-dot-pulse {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: qDotPulse 1.2s infinite;
    flex-shrink: 0;
  }
  .waq-dot-pulse.fast { animation-duration: 0.7s; }
  @keyframes qDotPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.7); }
  }

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
    transition: width 0.6s ease;
    position: relative;
  }
  .waq-progress-fill.animating::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 1.5s infinite;
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
  .waq-rate-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .waq-rate-title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    margin: 0;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .waq-edit-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 6px;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: all 0.2s;
  }
  .waq-edit-btn:hover {
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.8);
    border-color: rgba(255,255,255,0.2);
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
    padding: 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
  }
  .waq-rate-item span:first-child {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
  }
  .waq-rate-item span:last-child {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
  }
  .waq-rate-item label {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 4px;
    display: block;
  }
  .waq-rate-input {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 4px;
    padding: 6px 8px;
    color: rgba(255,255,255,0.9);
    font-size: 13px;
    font-weight: 600;
    width: 100%;
    transition: border-color 0.2s;
  }
  .waq-rate-input:focus {
    outline: none;
    border-color: rgba(37,211,102,0.4);
    box-shadow: 0 0 0 2px rgba(37,211,102,0.1);
  }
  .waq-rate-edit-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .waq-rate-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .waq-rate-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Cairo', sans-serif;
  }
  .waq-rate-btn.save {
    background: rgba(37,211,102,0.2);
    color: #25d366;
    border: 1px solid rgba(37,211,102,0.3);
  }
  .waq-rate-btn.save:hover:not(:disabled) {
    background: rgba(37,211,102,0.3);
    border-color: rgba(37,211,102,0.4);
  }
  .waq-rate-btn.cancel {
    background: transparent;
    color: rgba(255,255,255,0.6);
    border: 1px solid rgba(255,255,255,0.15);
  }
  .waq-rate-btn.cancel:hover:not(:disabled) {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.8);
    border-color: rgba(255,255,255,0.25);
  }
  .waq-rate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Refresh button */
  .waq-refresh-btn {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.45);
    transition: all 0.2s;
  }
  .waq-refresh-btn:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.8); }
  .waq-refresh-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .waq-refresh-btn.auto-on {
    background: rgba(37,211,102,0.08);
    border-color: rgba(37,211,102,0.2);
    color: #25d366;
  }

  /* Polling indicator */
  .waq-polling-bar {
    height: 2px;
    background: rgba(37,211,102,0.15);
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .waq-polling-fill {
    height: 100%;
    background: linear-gradient(90deg, #128c7e, #25d366);
    border-radius: 99px;
    animation: pollingProgress 1s linear infinite;
  }
  @keyframes pollingProgress {
    0% { width: 0%; margin-left: 0; }
    50% { width: 60%; }
    100% { width: 0%; margin-left: 100%; }
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

  /* Done state */
  .waq-done-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 14px;
    background: rgba(37,211,102,0.06);
    border: 1px solid rgba(37,211,102,0.2);
    margin-bottom: 16px;
  }
  .waq-done-banner p {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #25d366;
  }
  .waq-done-banner span {
    font-size: 12px;
    color: rgba(37,211,102,0.6);
    font-weight: 400;
  }
`;

type QueuePhase = 'idle' | 'triggered' | 'processing' | 'pending' | 'done';

export function WhatsAppQueueStatus({ className }: WhatsAppQueueStatusProps) {
  const { queueStatus, loading, error, refetch, autoRefresh, setAutoRefresh, queueLength, isProcessing, sentCount, pendingCount } = useQueueStatus();
  const { updateRateLimit } = useWhatsAppActions();

  const [editMode, setEditMode] = React.useState(false);
  const [editLoading, setEditLoading] = React.useState(false);
  const [rateLimitForm, setRateLimitForm] = React.useState(
    queueStatus?.data?.rateLimit || DEFAULT_RATE_LIMIT
  );

  // Active polling state
  const [isPolling, setIsPolling] = React.useState(false);
  const [phase, setPhase] = React.useState<QueuePhase>('idle');
  const [finalSentCount, setFinalSentCount] = React.useState<number | null>(null);
  const pollingRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = React.useRef(0);

  const totalMessages = sentCount + pendingCount + (queueStatus?.data?.processingCount || 0);
  const progressPercentage = totalMessages > 0 ? (sentCount / totalMessages) * 100 : 0;
  const estimatedTime = queueStatus ? calculateEstimatedTime(pendingCount, queueStatus.data.rateLimit) : 0;

  // Start aggressive polling after an action
  const startPolling = React.useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setIsPolling(true);
    setPhase('triggered');
    pollCountRef.current = 0;

    pollingRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      await refetch();
    }, 1000); // poll every 1 second
  }, [refetch]);

  // Stop polling when queue is done
  const stopPolling = React.useCallback((sent: number) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
    setFinalSentCount(sent);
    setPhase('done');

    // Reset done state after 8 seconds
    setTimeout(() => {
      setPhase('idle');
      setFinalSentCount(null);
    }, 8000);
  }, []);

  // Watch queue status changes while polling
  React.useEffect(() => {
    if (!isPolling) return;

    const procCount = queueStatus?.data?.processingCount || 0;

    if (isProcessing || procCount > 0) {
      setPhase('processing');
    } else if (pendingCount > 0) {
      setPhase('pending');
    } else if (phase === 'processing' || phase === 'pending' || phase === 'triggered') {
      // Was active, now empty → done
      stopPolling(sentCount);
    }

    // Safety: stop after 5 minutes of polling
    if (pollCountRef.current > 300) {
      stopPolling(sentCount);
    }
  }, [queueStatus, isProcessing, pendingCount, sentCount, isPolling, phase, stopPolling]);

  // Listen for expiry actions from dashboard
  React.useEffect(() => {
    const handleExpiryAction = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (
        customEvent.detail?.action === 'send-expiring' ||
        customEvent.detail?.action === 'auto-check'
      ) {
        // Small delay then start polling
        setTimeout(() => startPolling(), 500);
      }
    };

    window.addEventListener('whatsapp-expiry-action', handleExpiryAction);
    return () => window.removeEventListener('whatsapp-expiry-action', handleExpiryAction);
  }, [startPolling]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const getStatusInfo = (): { label: string; cls: string; showDot: boolean; dotFast: boolean } => {
    if (loading && phase === 'idle') return { label: 'جاري التحميل...', cls: 'idle', showDot: false, dotFast: false };
    switch (phase) {
      case 'triggered':
        return { label: 'جاري الإضافة للطابور...', cls: 'pending', showDot: true, dotFast: true };
      case 'processing':
        return { label: 'قيد المعالجة والإرسال', cls: 'processing', showDot: true, dotFast: true };
      case 'pending':
        return { label: 'في الانتظار', cls: 'pending', showDot: true, dotFast: false };
      case 'done':
        return { label: 'اكتمل الإرسال', cls: 'done', showDot: false, dotFast: false };
      default:
        if (isProcessing) return { label: 'قيد المعالجة', cls: 'processing', showDot: true, dotFast: true };
        if (pendingCount > 0) return { label: 'في الانتظار', cls: 'pending', showDot: true, dotFast: false };
        return { label: 'مكتمل', cls: 'idle', showDot: false, dotFast: false };
    }
  };

  const statusInfo = getStatusInfo();

  const handleSaveRateLimit = async () => {
    try {
      setEditLoading(true);
      await updateRateLimit(rateLimitForm);
      setEditMode(false);
      await refetch();
    } catch (error) {
      console.error('Failed to update rate limit:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setRateLimitForm(queueStatus?.data?.rateLimit || DEFAULT_RATE_LIMIT);
    setEditMode(false);
  };

  React.useEffect(() => {
    if (queueStatus?.data?.rateLimit && !editMode) {
      setRateLimitForm(queueStatus.data.rateLimit);
    }
  }, [queueStatus, editMode]);

  return (
    <>
      <style>{styles}</style>
      <div className={`waq-card ${className ?? ''}`}>
        <div className="waq-glow" />

        {/* Header */}
        <div className="waq-header">
          <div className="waq-title-row">
            <h3 className="waq-title">حالة الطابور</h3>
          </div>
          <div className="waq-header-actions">
            <button
              onClick={() => { refetch(); }}
              disabled={loading}
              className="waq-refresh-btn"
              title="تحديث"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`waq-refresh-btn ${autoRefresh ? 'auto-on' : ''}`}
              title={`تحديث تلقائي ${autoRefresh ? 'مفعل' : 'معطل'}`}
            >
              <Activity size={14} />
            </button>
          </div>
        </div>

        {/* Active polling indicator */}
        {isPolling && (
          <div className="waq-polling-bar">
            <div className="waq-polling-fill" />
          </div>
        )}

        {/* Status Badge — always visible */}
        <div className={`waq-status-badge ${statusInfo.cls}`}>
          {statusInfo.showDot && (
            <span className={`waq-dot-pulse ${statusInfo.dotFast ? 'fast' : ''}`} />
          )}
          {phase === 'processing' && <Activity size={15} />}
          {phase === 'done' && <CheckCircle size={15} />}
          {phase === 'triggered' && <RefreshCw size={15} className="animate-spin" />}
          {statusInfo.label}
        </div>

        {/* Done banner with final count */}
        {phase === 'done' && finalSentCount !== null && (
          <div className="waq-done-banner">
            <CheckCircle size={18} color="#25d366" />
            <div>
              <p>تم الإرسال بنجاح</p>
              <span>إجمالي الرسائل المُرسَلة: {finalSentCount}</span>
            </div>
          </div>
        )}

        {/* Progress */}
        {(phase !== 'idle' || totalMessages > 0) && (
          <div className="waq-progress-wrap">
            <div className="waq-progress-label">
              <span>تقدم الإرسال</span>
              <span className="waq-pct">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="waq-progress-track">
              <div
                className={`waq-progress-fill ${isPolling ? 'animating' : ''}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats — only show when there's real data */}
        {totalMessages > 0 && (
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
        )}

        {(queueStatus?.data?.processingCount ?? 0) > 0 && (
          <div className="waq-stat" style={{ marginBottom: '12px' }}>
            <div className="waq-stat-icon-row">
              <Activity size={15} color="#60a5fa" />
              <p className="waq-stat-label">قيد المعالجة</p>
            </div>
            <p className="waq-stat-number blue">{queueStatus?.data.processingCount}</p>
          </div>
        )}

        {/* Rate limits */}
        {queueStatus?.data?.rateLimit && (
          <div className="waq-rate-box">
            <div className="waq-rate-header">
              <p className="waq-rate-title">معدل الإرسال</p>
              {!editMode && (
                <button
                  className="waq-edit-btn"
                  onClick={() => setEditMode(true)}
                  title="تعديل معدلات الإرسال"
                >
                  <Settings size={14} />
                </button>
              )}
            </div>

            {editMode ? (
              <div className="waq-rate-edit-form">
                <div className="waq-rate-grid">
                  <div className="waq-rate-item">
                    <label>في الثانية</label>
                    <input
                      type="number" min="1" max="10"
                      value={rateLimitForm.messagesPerSecond}
                      onChange={(e) => setRateLimitForm(prev => ({ ...prev, messagesPerSecond: parseInt(e.target.value) || 1 }))}
                      className="waq-rate-input"
                    />
                  </div>
                  <div className="waq-rate-item">
                    <label>في الدقيقة</label>
                    <input
                      type="number" min="10" max="100"
                      value={rateLimitForm.messagesPerMinute}
                      onChange={(e) => setRateLimitForm(prev => ({ ...prev, messagesPerMinute: parseInt(e.target.value) || 10 }))}
                      className="waq-rate-input"
                    />
                  </div>
                  <div className="waq-rate-item">
                    <label>في الساعة</label>
                    <input
                      type="number" min="100" max="5000"
                      value={rateLimitForm.messagesPerHour}
                      onChange={(e) => setRateLimitForm(prev => ({ ...prev, messagesPerHour: parseInt(e.target.value) || 100 }))}
                      className="waq-rate-input"
                    />
                  </div>
                  <div className="waq-rate-item">
                    <label>حجم الدفعة</label>
                    <input
                      type="number" min="1" max="50"
                      value={rateLimitForm.batchSize}
                      onChange={(e) => setRateLimitForm(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 1 }))}
                      className="waq-rate-input"
                    />
                  </div>
                </div>
                <div className="waq-rate-actions">
                  <button className="waq-rate-btn save" onClick={handleSaveRateLimit} disabled={editLoading}>
                    <Save size={14} />
                    {editLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                  <button className="waq-rate-btn cancel" onClick={handleCancelEdit} disabled={editLoading}>
                    <X size={14} />
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
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
            )}
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
        {totalMessages === 0 && !loading && phase === 'idle' && (
          <div className="waq-empty">
            <MessageSquare size={44} />
            <p>لا توجد رسائل في الطابور</p>
          </div>
        )}
      </div>
    </>
  );
}