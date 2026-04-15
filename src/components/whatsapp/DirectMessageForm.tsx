import React, { useState } from 'react';
import { useWhatsAppActions } from '@/hooks/useWhatsApp';
import { Send, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface DirectMessageFormProps {
  className?: string;
  onSuccess?: () => void;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

  .dmf-card {
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
  .dmf-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #25d366 50%, transparent 100%);
  }
  .dmf-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .dmf-icon-ring {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(37, 211, 102, 0.1);
    border: 1px solid rgba(37, 211, 102, 0.22);
    display: flex; align-items: center; justify-content: center;
  }
  .dmf-title {
    font-size: 17px;
    font-weight: 700;
    color: #e8f5e9;
    margin: 0;
  }
  .dmf-field { margin-bottom: 18px; }
  .dmf-label {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
    margin-bottom: 8px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .dmf-input, .dmf-textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.09);
    color: #e8f5e9;
    font-size: 14px;
    font-family: 'Cairo', sans-serif;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
    direction: ltr; /* Phone number should be LTR */
  }
  .dmf-input::placeholder, .dmf-textarea::placeholder {
    color: rgba(255,255,255,0.2);
    font-family: 'Cairo', sans-serif;
  }
  .dmf-input:focus, .dmf-textarea:focus {
    border-color: rgba(37, 211, 102, 0.4);
    background: rgba(37, 211, 102, 0.04);
    box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.08);
  }
  .dmf-textarea { 
    resize: vertical; 
    min-height: 110px; 
    line-height: 1.7; 
    direction: rtl; /* Message should be RTL */
  }
  .dmf-hint {
    font-size: 11px;
    color: rgba(255,255,255,0.28);
    margin-top: 6px;
    display: block;
  }

  /* Char count row */
  .dmf-count-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }
  .dmf-count { font-size: 11px; color: rgba(255,255,255,0.28); }

  /* Queue toggle */
  .dmf-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    margin-bottom: 16px;
  }
  .dmf-toggle-info {}
  .dmf-toggle-label {
    font-size: 13.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    margin: 0 0 3px 0;
  }
  .dmf-toggle-desc {
    font-size: 11.5px;
    color: rgba(255,255,255,0.3);
    margin: 0;
    line-height: 1.5;
  }
  .dmf-switch {
    width: 44px; height: 24px;
    border-radius: 99px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .dmf-switch.on {
    background: #25d366;
    border-color: #25d366;
  }
  .dmf-switch-thumb {
    position: absolute;
    top: 2px; right: 2px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: all 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .dmf-switch.on .dmf-switch-thumb { right: auto; left: 2px; }

  /* Success message */
  .dmf-success {
    padding: 12px 16px;
    background: rgba(37, 211, 102, 0.1);
    border: 1px solid rgba(37, 211, 102, 0.3);
    border-radius: 12px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #25d366;
    font-size: 13px;
    font-weight: 600;
  }

  /* Errors */
  .dmf-errors { margin-bottom: 14px; }
  .dmf-error-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: #f87171;
    margin-bottom: 6px;
  }

  /* Submit */
  .dmf-submit-btn {
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
  .dmf-submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 30px rgba(37,211,102,0.35); }
  .dmf-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .dmf-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: dmfSpin 0.7s linear infinite;
  }
  @keyframes dmfSpin { to { transform: rotate(360deg); } }
`;

export function DirectMessageForm({ className, onSuccess }: DirectMessageFormProps) {
  const { sendDirectMessage, loading } = useWhatsAppActions();
  
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [useQueue, setUseQueue] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrors([]);
    setSuccess(null);
    
    // Validate phone
    if (!phone.trim()) {
      setErrors(['????? ?????? ?????']);
      return;
    }
    
    // Validate phone format: 11 digits starting with 01
    const phoneRegex = /^01\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setErrors(['????? ?????? ?? ???? 11 ???? ?? ???? ?? 01']);
      return;
    }
    
    // Validate message
    if (!message.trim()) {
      setErrors(['????? ?????? ?????']);
      return;
    }
    
    if (message.length > 1000) {
      setErrors(['الرسالة طويلة جداً (أقصى 1000 حرف)']);
      return;
    }

    try {
      console.log('📱 Sending direct message:', { phone, message, useQueue });
      
      const response = await sendDirectMessage(phone, message, useQueue);
      
      console.log('✅ Direct message response:', response);
      
      // Show success message
      if (response?.success) {
        const messageId = response?.data?.result?.messageId;
        setSuccess(`تم إرسال الرسالة بنجاح! ${messageId ? `(ID: ${messageId})` : ''}`);
        
        // Reset form
        setPhone('');
        setMessage('');
        setUseQueue(false);
        
        onSuccess?.();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }
      
    } catch (error) {
      console.error('Failed to send direct message:', error);
      setErrors(['فشل إرسال الرسالة، حاول مرة أخرى']);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`dmf-card ${className ?? ''}`}>
        <div className="dmf-title-row">
          <div className="dmf-icon-ring">
            <Phone size={20} color="#25d366" />
          </div>
          <p className="dmf-title">رسالة مباشرة</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Phone Number */}
          <div className="dmf-field">
            <label className="dmf-label">رقم الهاتف</label>
            <input
              className="dmf-input"
              type="tel"
              placeholder="01234567890"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              maxLength={11}
              pattern="01\d{9}"
              required
            />
            <span className="dmf-hint">أدخل رقم الهاتف مكون من 11 رقم يبدأ بـ 01 (مثال: 01234567890)</span>
          </div>

          {/* Message */}
          <div className="dmf-field">
            <label className="dmf-label">الرسالة</label>
            <textarea
              className="dmf-textarea"
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              required
            />
            <div className="dmf-count-row">
              <span className="dmf-count">{message.length}/1000 حرف</span>
            </div>
          </div>

          {/* Queue toggle */}
          <div className="dmf-toggle-row">
            <div className="dmf-toggle-info">
              <p className="dmf-toggle-label">استخدام الطابور</p>
              <p className="dmf-toggle-desc">يضمن عدم تجاوز حدود الإرسال ويحمي الرقم من الحظر</p>
            </div>
            <div
              className={`dmf-switch ${useQueue ? 'on' : ''}`}
              onClick={() => setUseQueue(!useQueue)}
            >
              <div className="dmf-switch-thumb" />
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="dmf-success">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="dmf-errors">
              {errors.map((err, i) => (
                <div key={i} className="dmf-error-item">
                  <AlertCircle size={14} />
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="dmf-submit-btn"
            disabled={loading || !phone.trim() || !message.trim()}
          >
            {loading ? (
              <><div className="dmf-spinner" /> جاري الإرسال...</>
            ) : (
              <><Send size={16} /> إرسال الرسالة</>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
