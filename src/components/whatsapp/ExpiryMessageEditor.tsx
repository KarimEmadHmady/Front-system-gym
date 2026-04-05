import React, { useState, useEffect } from 'react';
import { useExpiryMessage } from '@/hooks/useWhatsApp';

interface ExpiryMessageEditorProps {
  className?: string;
}

const VARIABLES = [
  { key: '{name}',     label: 'اسم العضو',       example: 'أحمد محمد',       color: '#25d366' },
  { key: '{planName}', label: 'اسم الباقة',       example: 'باقة برو',  color: '#f59e0b' },
  { key: '{endDate}',  label: 'تاريخ الانتهاء',   example: '31/12/2025',      color: '#3b82f6' },
];

function replaceVars(template: string) {
  return template
    .replace(/{name}/g,     'أحمد محمد')
    .replace(/{planName}/g, 'باقة برو')
    .replace(/{endDate}/g,  '31/12/2025');
}

export function ExpiryMessageEditor({ className }: ExpiryMessageEditorProps) {
  const {
    updateExpiryMessage,
    resetExpiryMessage,
    currentMessage,
    isDefault,
    loading: hookLoading,
  } = useExpiryMessage();

  const [draft, setDraft]           = useState(currentMessage);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab]   = useState<'edit' | 'preview'>('edit');

  useEffect(() => { setDraft(currentMessage); }, [currentMessage]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const insertVar = (key: string) => {
    setDraft(prev => prev + key);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateExpiryMessage(draft);
      if (res?.success) {
        showToast('success', 'تم حفظ الرسالة بنجاح ✓');
      } else {
        showToast('error', 'فشل الحفظ — حاول مجدداً');
      }
    } catch {
      showToast('error', 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      const res = await resetExpiryMessage();
      if (res?.success) {
        showToast('success', 'تم إعادة تعيين الرسالة إلى الافتراضية ✓');
      } else {
        showToast('error', 'فشل إعادة التعيين — حاول مجدداً');
      }
    } catch {
      showToast('error', 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const isDirty    = draft !== currentMessage;
  const isLoading  = saving || hookLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');

        .eme-root {
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          color: rgba(255,255,255,0.88);
        }

        /* ── TOAST ── */
        .eme-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Cairo', sans-serif;
          animation: emeToastIn .25s ease;
          white-space: nowrap;
        }
        .eme-toast.success {
          background: rgba(37,211,102,.15);
          border: 1px solid rgba(37,211,102,.4);
          color: #25d366;
        }
        .eme-toast.error {
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.35);
          color: #f87171;
        }
        @keyframes emeToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* ── CARD ── */
        .eme-card {
          background: linear-gradient(160deg, #0d1b2a 0%, #111d2e 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
        }

        /* ── HEADER ── */
        .eme-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .eme-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .eme-header-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .eme-header h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #e8f5e9;
        }
        .eme-header p {
          margin: 2px 0 0;
          font-size: 12px;
          color: rgba(255,255,255,0.38);
        }
        .eme-badge-default {
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.25);
          color: #60a5fa;
          font-size: 11px;
          font-weight: 600;
        }

        /* ── TABS ── */
        .eme-tabs {
          display: flex;
          gap: 4px;
          padding: 14px 20px 0;
        }
        .eme-tab {
          padding: 7px 18px;
          border-radius: 8px 8px 0 0;
          border: 1px solid transparent;
          border-bottom: none;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all .2s;
          background: transparent;
          color: rgba(255,255,255,0.38);
        }
        .eme-tab.active {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.85);
        }
        .eme-tab:hover:not(.active) { color: rgba(255,255,255,0.6); }

        /* ── BODY ── */
        .eme-body {
          padding: 16px 20px 20px;
          background: rgba(255,255,255,0.025);
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ── VARIABLES CHIPS ── */
        .eme-vars-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          letter-spacing: .5px;
          text-transform: uppercase;
          margin: 0 0 8px;
        }
        .eme-vars-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
        }
        .eme-var-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          font-size: 12px;
          font-family: 'Cairo', sans-serif;
          transition: all .15s;
        }
        .eme-var-chip:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .eme-var-chip-key  { font-family: monospace; font-size: 11px; }
        .eme-var-chip-label{ color: rgba(255,255,255,0.5); font-size: 11px; }

        /* ── TEXTAREA ── */
        .eme-textarea {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 14px;
          color: rgba(255,255,255,0.9);
          font-size: 14px;
          font-family: 'Cairo', sans-serif;
          line-height: 1.7;
          resize: vertical;
          min-height: 120px;
          transition: border-color .2s;
        }
        .eme-textarea:focus {
          outline: none;
          border-color: rgba(37,211,102,0.45);
          box-shadow: 0 0 0 3px rgba(37,211,102,0.07);
        }
        .eme-char-count {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-align: left;
          margin-top: 5px;
        }

        /* ── PREVIEW ── */
        .eme-preview-bubble {
          background: rgba(37,211,102,0.07);
          border: 1px solid rgba(37,211,102,0.15);
          border-radius: 12px 12px 4px 12px;
          padding: 16px;
          font-size: 14px;
          line-height: 1.75;
          color: rgba(255,255,255,0.88);
          white-space: pre-wrap;
          min-height: 80px;
        }
        .eme-preview-empty {
          color: rgba(255,255,255,0.25);
          font-style: italic;
        }
        .eme-preview-meta {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }
        .eme-preview-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
        }
        .eme-preview-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        /* ── FOOTER ── */
        .eme-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .eme-footer-hint {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
        }
        .eme-footer-hint.dirty { color: rgba(245,158,11,0.7); }
        .eme-footer-buttons {
          display: flex;
          gap: 10px;
        }
        .eme-reset-btn {
          padding: 9px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 600;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .eme-reset-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.25);
        }
        .eme-reset-btn:disabled {
          opacity: .35;
          cursor: not-allowed;
        }
        .eme-save-btn {
          padding: 9px 22px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #25d366, #128c7e);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all .2s;
          box-shadow: 0 3px 14px rgba(37,211,102,0.2);
        }
        .eme-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 18px rgba(37,211,102,0.3);
        }
        .eme-save-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      {toast && (
        <div className={`eme-toast ${toast.type}`}>{toast.text}</div>
      )}

      <div className={`eme-root eme-card ${className ?? ''}`}>

        {/* Header */}
        <div className="eme-header">
          <div className="eme-header-left">
            <div className="eme-header-icon">📝</div>
            <div>
              <h3>رسالة انتهاء الاشتراك</h3>
              <p>تُرسل تلقائياً قبل يوم من انتهاء الاشتراك</p>
            </div>
          </div>
          {isDefault && <span className="eme-badge-default">افتراضية</span>}
        </div>

        {/* Tabs */}
        <div className="eme-tabs">
          <button className={`eme-tab ${activeTab === 'edit'    ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>✏️ تحرير</button>
          <button className={`eme-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>👁 معاينة</button>
        </div>

        {/* Body */}
        <div className="eme-body">

          {activeTab === 'edit' && (
            <>
              {/* Variable chips */}
              <p className="eme-vars-label">أدرج متغير</p>
              <div className="eme-vars-row">
                {VARIABLES.map(v => (
                  <button key={v.key} className="eme-var-chip" onClick={() => insertVar(v.key)} title={`مثال: ${v.example}`}>
                    <span className="eme-var-chip-key" style={{ color: v.color }}>{v.key}</span>
                    <span className="eme-var-chip-label">{v.label}</span>
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                className="eme-textarea"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="مثال: مرحباً {name}، اشتراكك في {planName} ينتهي بتاريخ {endDate} 🔔"
                rows={5}
              />
              <div className="eme-char-count">{draft.length} حرف</div>
            </>
          )}

          {activeTab === 'preview' && (
            <>
              <div className="eme-preview-bubble">
                {draft
                  ? replaceVars(draft)
                  : <span className="eme-preview-empty">اكتب رسالة لرؤية المعاينة...</span>
                }
              </div>
              <div className="eme-preview-meta">
                {VARIABLES.map(v => (
                  <div key={v.key} className="eme-preview-meta-item">
                    <div className="eme-preview-dot" style={{ color: v.color }} />
                    <span style={{ color: v.color, fontFamily: 'monospace' }}>{v.key}</span>
                    <span>← {v.example}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="eme-footer">
          <span className={`eme-footer-hint ${isDirty ? 'dirty' : ''}`}>
            {isDirty ? '● يوجد تغييرات غير محفوظة' : 'لا توجد تغييرات'}
          </span>
          <div className="eme-footer-buttons">
            <button
              className="eme-reset-btn"
              onClick={handleReset}
              disabled={isLoading || isDefault}
              title={isDefault ? 'الرسالة حالياً افتراضية' : 'إعادة تعيين إلى الرسالة الافتراضية'}
            >
              {isLoading ? 'جاري...' : 'إعادة تعيين'}
            </button>
            <button
              className="eme-save-btn"
              onClick={handleSave}
              disabled={isLoading || !isDirty || !draft.trim()}
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ الرسالة'}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}