import React, { useState } from 'react';
import { useWhatsAppActions } from '@/hooks/useWhatsApp';
import { validateWhatsAppMessage, previewMessage } from '@/lib/whatsapp';
import { WhatsAppBroadcastFormData } from '@/types/whatsapp';
import { Send, Users, Eye, AlertCircle } from 'lucide-react';

interface BroadcastFormProps {
  className?: string;
  onSuccess?: () => void;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

  .wab-card {
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    background: linear-gradient(145deg, #0d1b2a 0%, #1b2838 60%, #0a1628 100%);
    border: 1px solid rgba(37, 211, 102, 0.15);
    border-radius: 20px;
    padding: 28px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 25px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .wab-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #128c7e 20%, #25d366 50%, #128c7e 80%, transparent 100%);
  }
  .wab-card-glow {
    position: absolute;
    top: -80px; left: -80px;
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(37,211,102,0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .wab-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }
  .wab-icon-ring {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(37, 211, 102, 0.1);
    border: 1px solid rgba(37, 211, 102, 0.22);
    display: flex; align-items: center; justify-content: center;
  }
  .wab-title {
    font-size: 17px;
    font-weight: 700;
    color: #e8f5e9;
    margin: 0;
  }
  .wab-subtitle {
    font-size: 12.5px;
    color: rgba(255,255,255,0.35);
    margin: 0 56px 20px 0;
    line-height: 1.6;
  }
  .wab-field { margin-bottom: 18px; }
  .wab-label {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
    margin-bottom: 8px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .wab-textarea {
    width: 100%;
    padding: 13px 16px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.09);
    color: #e8f5e9;
    font-size: 14px;
    font-family: 'Cairo', sans-serif;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
    direction: rtl;
    resize: vertical;
    min-height: 115px;
    line-height: 1.7;
  }
  .wab-textarea::placeholder { color: rgba(255,255,255,0.2); font-family: 'Cairo', sans-serif; }
  .wab-textarea:focus {
    border-color: rgba(37, 211, 102, 0.4);
    background: rgba(37, 211, 102, 0.04);
    box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.08);
  }
  .wab-count-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 7px;
  }
  .wab-count { font-size: 11px; color: rgba(255,255,255,0.28); }
  .wab-preview-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(37,211,102,0.08);
    border: 1px solid rgba(37,211,102,0.22);
    color: #25d366;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Cairo', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }
  .wab-preview-btn:hover { background: rgba(37,211,102,0.14); }

  .wab-preview {
    padding: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    margin-bottom: 14px;
  }
  .wab-preview-title {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.38);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin: 0 0 8px;
  }
  .wab-preview-text { font-size: 13.5px; color: rgba(255,255,255,0.62); margin: 0; line-height: 1.7; }

  .wab-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    margin-bottom: 14px;
  }
  .wab-toggle-label {
    font-size: 13.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    margin: 0 0 3px 0;
  }
  .wab-toggle-desc {
    font-size: 11.5px;
    color: rgba(255,255,255,0.3);
    margin: 0;
    line-height: 1.5;
  }
  .wab-switch {
    width: 44px; height: 24px;
    border-radius: 99px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .wab-switch.on { background: #25d366; border-color: #25d366; }
  .wab-switch-thumb {
    position: absolute;
    top: 2px; right: 2px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: all 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .wab-switch.on .wab-switch-thumb { right: auto; left: 2px; }

  .wab-warning {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px;
    background: rgba(245, 158, 11, 0.07);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 12px;
    margin-bottom: 16px;
  }
  .wab-warning p {
    font-size: 12.5px;
    color: rgba(251, 191, 36, 0.82);
    margin: 0;
    line-height: 1.65;
  }

  .wab-errors { margin-bottom: 14px; }
  .wab-error-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: #f87171;
    margin-bottom: 6px;
  }

  .wab-submit-btn {
    width: 100%;
    padding: 13px 20px;
    border-radius: 13px;
    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
    border: none;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Cairo', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 6px 24px rgba(37,211,102,0.25);
    letter-spacing: -0.2px;
  }
  .wab-submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 30px rgba(37,211,102,0.35); }
  .wab-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .wab-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: wabSpin 0.7s linear infinite;
  }
  @keyframes wabSpin { to { transform: rotate(360deg); } }
`;

export function BroadcastForm({ className, onSuccess }: BroadcastFormProps) {
  const { sendBroadcast, loading } = useWhatsAppActions();
  const [formData, setFormData] = useState<WhatsAppBroadcastFormData>({ message: '', useQueue: true });
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setError('الرجاء إدخال الرسالة');
      return;
    }

    setError(null);

    try {
      await sendBroadcast({
        message: formData.message,
        useQueue: formData.useQueue
      });
      
      // Reset form
      setFormData({ message: '', useQueue: true });
      onSuccess?.();
      
      // Trigger immediate queue status refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('whatsapp-message-sent'));
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إرسال الرسالة');
    }
  };

  const handleChange = (field: keyof WhatsAppBroadcastFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const msgPreview = previewMessage(formData.message);
  const hasVariables = formData.message.includes('{') && formData.message.includes('}');

  return (
    <>
      <style>{styles}</style>
      <div className={`wab-card ${className ?? ''}`}>
        <div className="wab-card-glow" />
        <div className="wab-title-row">
          <div className="wab-icon-ring">
            <Users size={20} color="#25d366" />
          </div>
          <p className="wab-title">إرسال رسالة عامة</p>
        </div>
        <p className="wab-subtitle">سيتم إرسال هذه الرسالة إلى جميع الأعضاء النشطين</p>

        <form onSubmit={handleSubmit}>
          {/* Message */}
          <div className="wab-field">
            <label className="wab-label">الرسالة</label>
            <textarea
              className="wab-textarea"
              placeholder="اكتب رسالتك هنا... يمكنك استخدام متغيرات مثل {name}, {planName}, {endDate}"
              value={formData.message}
              onChange={e => handleChange('message', e.target.value)}
              rows={4}
              required
            />
            <div className="wab-count-row">
              <span className="wab-count">{formData.message.length}/1000 حرف</span>
              {hasVariables && (
                <button 
                  type="button" 
                  className="wab-preview-btn" 
                  onClick={() => setShowPreview(p => !p)}
                >
                  <Eye size={13} />
                  {showPreview ? 'إخفاء' : 'معاينة'}
                </button>
              )}
            </div>
          </div>

          {showPreview && hasVariables && (
            <div className="wab-preview">
              <p className="wab-preview-title">معاينة الرسالة</p>
              <p className="wab-preview-text">{msgPreview}</p>
            </div>
          )}

          {/* Queue toggle */}
          <div className="wab-toggle-row">
            <div>
              <p className="wab-toggle-label">استخدام الطابور</p>
              <p className="wab-toggle-desc">يضمن عدم تجاوز حدود الإرسال ويُفضّل للرسائل العامة</p>
            </div>
            <div
              className={`wab-switch ${formData.useQueue ? 'on' : ''}`}
              onClick={() => handleChange('useQueue', !formData.useQueue)}
            >
              <div className="wab-switch-thumb" />
            </div>
          </div>

          {/* Warning */}
          <div className="wab-warning">
            <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
            <p>سيتم إرسال هذه الرسالة إلى جميع الأعضاء. يرجى التأكد من المحتوى قبل الإرسال.</p>
          </div>

          {/* Errors */}
          {error && (
            <div className="wab-errors">
              <div className="wab-error-item">
                <AlertCircle size={14} />
                {error}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="wab-submit-btn"
            disabled={loading || !formData.message}
          >
            {loading ? (
              <><div className="wab-spinner" /> جاري الإرسال...</>
            ) : (
              <><Send size={16} /> إرسال إلى جميع الأعضاء</>
            )}
          </button>
        </form>
      </div>
    </>
  );
}