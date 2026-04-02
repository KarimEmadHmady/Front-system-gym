import React, { useEffect, useState } from 'react';
import { useWhatsAppActions } from '@/hooks/useWhatsApp';
import { useUsers } from '@/hooks/useUsers';
import { validateWhatsAppFormData, previewMessage } from '@/lib/whatsapp';
import { WhatsAppFormData } from '@/types/whatsapp';
import type { User as AppUser } from '@/types/models';
import { Send, User, Phone, Eye, AlertCircle } from 'lucide-react';

interface SendMessageFormProps {
  className?: string;
  onSuccess?: () => void;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

  .waf-card {
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
  .waf-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #25d366 50%, transparent 100%);
  }
  .waf-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .waf-icon-ring {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(37, 211, 102, 0.1);
    border: 1px solid rgba(37, 211, 102, 0.22);
    display: flex; align-items: center; justify-content: center;
  }
  .waf-title {
    font-size: 17px;
    font-weight: 700;
    color: #e8f5e9;
    margin: 0;
  }
  .waf-field { margin-bottom: 18px; }
  .waf-label {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
    margin-bottom: 8px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  
  /* Radio group */
  .waf-radio-group {
    display: flex;
    gap: 10px;
  }
  .waf-radio-option {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }
  .waf-radio-option:hover {
    border-color: rgba(37, 211, 102, 0.3);
    background: rgba(37, 211, 102, 0.05);
  }
  .waf-radio-option.selected {
    border-color: rgba(37, 211, 102, 0.5);
    background: rgba(37, 211, 102, 0.08);
  }
  .waf-radio-dot {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.25);
    background: transparent;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .waf-radio-option.selected .waf-radio-dot {
    border-color: #25d366;
    background: #25d366;
  }
  .waf-radio-option.selected .waf-radio-dot::after {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #0d1b2a;
  }
  .waf-radio-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    display: flex; align-items: center; gap: 7px;
  }
  .waf-radio-option.selected .waf-radio-label { color: #e8f5e9; }

  /* User selector */
  .waf-user-list {
    max-height: 210px;
    overflow-y: auto;
    margin-top: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 6px;
    background: rgba(255,255,255,0.03);
  }
  .waf-user-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    background: rgba(255,255,255,0.02);
    color: #e8f5e9;
    padding: 8px 10px;
    margin-bottom: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .waf-user-item:hover {
    border-color: rgba(37,211,102,0.35);
    background: rgba(37,211,102,0.07);
  }
  .waf-user-item.selected {
    border-color: #25d366;
    background: rgba(37,211,102,0.15);
  }

  /* Input */
  .waf-input, .waf-textarea {
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
    direction: rtl;
  }
  .waf-input::placeholder, .waf-textarea::placeholder {
    color: rgba(255,255,255,0.2);
    font-family: 'Cairo', sans-serif;
  }
  .waf-input:focus, .waf-textarea:focus {
    border-color: rgba(37, 211, 102, 0.4);
    background: rgba(37, 211, 102, 0.04);
    box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.08);
  }
  .waf-textarea { resize: vertical; min-height: 110px; line-height: 1.7; }
  .waf-hint {
    font-size: 11px;
    color: rgba(255,255,255,0.28);
    margin-top: 6px;
    display: block;
  }

  /* Char count row */
  .waf-count-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }
  .waf-count { font-size: 11px; color: rgba(255,255,255,0.28); }
  .waf-preview-btn {
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
  .waf-preview-btn:hover { background: rgba(37,211,102,0.14); }

  /* Preview box */
  .waf-preview {
    padding: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    margin-bottom: 14px;
  }
  .waf-preview-title {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin: 0 0 8px 0;
  }
  .waf-preview-text { font-size: 13.5px; color: rgba(255,255,255,0.65); margin: 0; line-height: 1.7; }

  /* Queue toggle */
  .waf-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    margin-bottom: 16px;
  }
  .waf-toggle-info {}
  .waf-toggle-label {
    font-size: 13.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    margin: 0 0 3px 0;
  }
  .waf-toggle-desc {
    font-size: 11.5px;
    color: rgba(255,255,255,0.3);
    margin: 0;
    line-height: 1.5;
  }
  .waf-switch {
    width: 44px; height: 24px;
    border-radius: 99px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .waf-switch.on {
    background: #25d366;
    border-color: #25d366;
  }
  .waf-switch-thumb {
    position: absolute;
    top: 2px; right: 2px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: all 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .waf-switch.on .waf-switch-thumb { right: auto; left: 2px; }

  /* Errors */
  .waf-errors { margin-bottom: 14px; }
  .waf-error-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: #f87171;
    margin-bottom: 6px;
  }

  /* Submit */
  .waf-submit-btn {
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
  .waf-submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 30px rgba(37,211,102,0.35); }
  .waf-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .waf-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: wafSpin 0.7s linear infinite;
  }
  @keyframes wafSpin { to { transform: rotate(360deg); } }
`;

export function SendMessageForm({ className, onSuccess }: SendMessageFormProps) {
  const { sendSingleMessage, loading } = useWhatsAppActions();
  const { list: loadUsers, isLoading: usersLoading, error: usersError } = useUsers();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const [formData, setFormData] = useState<WhatsAppFormData>({
    recipient: '',
    message: '',
    useQueue: true,
    isPhone: true
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await loadUsers();
        setUsers(usersList);
      } catch (err) {
        console.error('Failed to load users for WhatsApp selection', err);
      }
    };

    fetchUsers();
  }, [loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateWhatsAppFormData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await sendSingleMessage({
        identifier: formData.recipient,
        isPhone: formData.isPhone,
        message: formData.message,
        useQueue: formData.useQueue
      });
      
      // Reset form
      setFormData({
        recipient: '',
        message: '',
        useQueue: true,
        isPhone: true
      });
      setSelectedUser(null);
      setSearchTerm('');
      setShowPreview(false);
      setErrors([]);
      onSuccess?.();
      
      // Trigger immediate queue status refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('whatsapp-message-sent'));
      }, 500);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setErrors(['فشل إرسال الرسالة، حاول مرة أخرى']);
    }
  };

  const filteredUsers = users.filter(user => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const userName = (user.name ?? '').toLowerCase();
    const userPhone = (user.phone ?? '').toLowerCase();
    return userName.includes(q) || userPhone.includes(q);
  });

  const handleSelectUser = (user: AppUser) => {
    setSelectedUser(user);
    const normalizedPhone = user.phone?.replace(/[\s\-\+]/g, '') ?? '';

    setFormData(prev => ({
      ...prev,
      recipient: normalizedPhone,
      isPhone: !!normalizedPhone,
    }));

    if (errors.length > 0) setErrors([]);
  };

  const handleChange = (field: keyof WhatsAppFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const msgPreview = previewMessage(formData.message);
  const hasVariables = formData.message.includes('{') && formData.message.includes('}');

  return (
    <>
      <style>{styles}</style>
      <div className={`waf-card ${className ?? ''}`}>
        <div className="waf-title-row">
          <div className="waf-icon-ring">
            <Send size={20} color="#25d366" />
          </div>
          <p className="waf-title">إرسال رسالة فردية</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Recipient selector */}
          <div className="waf-field">
            <label className="waf-label">اختر المستخدم</label>
            <input
              className="waf-input"
              type="text"
              placeholder="ابحث باسم المستخدم أو رقم الهاتف..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="waf-hint">اختَر مستخدماً وسيتم تعبئة رقم الهاتف تلقائياً لإرسال الواتساب.</span>

            <div className="waf-user-list">
              {usersLoading && <p className="waf-hint">...جارٍ تحميل المستخدمين</p>}
              {!usersLoading && usersError && <p className="waf-hint">فشل تحميل المستخدمين</p>}
              {!usersLoading && !usersError && filteredUsers.length === 0 && (
                <p className="waf-hint">لم يتم العثور على نتائج</p>
              )}
              {!usersLoading && filteredUsers.map(user => (
                <button
                  key={user._id}
                  type="button"
                  className={`waf-user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <span>{user.name}</span>
                  <span>{user.phone || 'بدون رقم'}</span>
                </button>
              ))}
            </div>

            {selectedUser && (
              <p className="waf-hint">المستخدم المحدد: {selectedUser.name} - {selectedUser.phone || 'بدون رقم'}</p>
            )}
          </div>

          {/* Message */}
          <div className="waf-field">
            <label className="waf-label">الرسالة</label>
            <textarea
              className="waf-textarea"
              placeholder="اكتب رسالتك هنا... يمكنك استخدام متغيرات مثل {name}, {planName}, {endDate}"
              value={formData.message}
              onChange={e => handleChange('message', e.target.value)}
              rows={4}
              required
            />
            <div className="waf-count-row">
              <span className="waf-count">{formData.message.length}/1000 حرف</span>
              {hasVariables && (
                <button type="button" className="waf-preview-btn" onClick={() => setShowPreview(p => !p)}>
                  <Eye size={13} />
                  {showPreview ? 'إخفاء' : 'معاينة'}
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          {showPreview && hasVariables && (
            <div className="waf-preview">
              <p className="waf-preview-title">معاينة الرسالة</p>
              <p className="waf-preview-text">{msgPreview}</p>
            </div>
          )}

          {/* Queue toggle */}
          <div className="waf-toggle-row">
            <div className="waf-toggle-info">
              <p className="waf-toggle-label">استخدام الطابور</p>
              <p className="waf-toggle-desc">يضمن عدم تجاوز حدود الإرسال</p>
            </div>
            <div
              className={`waf-switch ${formData.useQueue ? 'on' : ''}`}
              onClick={() => handleChange('useQueue', !formData.useQueue)}
            >
              <div className="waf-switch-thumb" />
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="waf-errors">
              {errors.map((err, i) => (
                <div key={i} className="waf-error-item">
                  <AlertCircle size={14} />
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="waf-submit-btn"
            disabled={loading || !formData.recipient || !formData.message}
          >
            {loading ? (
              <><div className="waf-spinner" /> جاري الإرسال...</>
            ) : (
              <><Send size={16} /> إرسال الرسالة</>
            )}
          </button>
        </form>
      </div>
    </>
  );
}