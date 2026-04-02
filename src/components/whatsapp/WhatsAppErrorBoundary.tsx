import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface WhatsAppErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface WhatsAppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class WhatsAppErrorBoundary extends React.Component<WhatsAppErrorBoundaryProps, WhatsAppErrorBoundaryState> {
  constructor(props: WhatsAppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WhatsAppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WhatsApp Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="wa-error-wrapper">
          <style>{`
            .wa-error-wrapper {
              font-family: 'Cairo', 'Tajawal', sans-serif;
              direction: rtl;
            }
            .wa-error-card {
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              border: 1px solid rgba(255, 107, 53, 0.3);
              border-radius: 16px;
              padding: 28px;
              position: relative;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
            }
            .wa-error-card::before {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0;
              height: 2px;
              background: linear-gradient(90deg, transparent, #ff6b35, transparent);
            }
            .wa-error-card::after {
              content: '';
              position: absolute;
              top: -60px; right: -60px;
              width: 150px; height: 150px;
              background: radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%);
              border-radius: 50%;
            }
            .wa-error-icon-ring {
              width: 52px; height: 52px;
              border-radius: 14px;
              background: rgba(255, 107, 53, 0.12);
              border: 1px solid rgba(255, 107, 53, 0.3);
              display: flex; align-items: center; justify-content: center;
              flex-shrink: 0;
            }
            .wa-error-title {
              font-size: 17px;
              font-weight: 700;
              color: #ff8c5a;
              margin: 0;
              letter-spacing: -0.3px;
            }
            .wa-error-body {
              font-size: 13.5px;
              color: rgba(255,255,255,0.55);
              line-height: 1.7;
              margin: 0;
            }
            .wa-retry-btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 9px 20px;
              border-radius: 10px;
              background: rgba(255,107,53,0.12);
              border: 1px solid rgba(255,107,53,0.35);
              color: #ff8c5a;
              font-size: 13px;
              font-weight: 600;
              font-family: 'Cairo', sans-serif;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .wa-retry-btn:hover {
              background: rgba(255,107,53,0.22);
              border-color: rgba(255,107,53,0.6);
              transform: translateY(-1px);
            }
            .wa-error-devbox {
              margin-top: 16px;
              padding: 12px;
              background: rgba(0,0,0,0.3);
              border: 1px solid rgba(255,255,255,0.07);
              border-radius: 10px;
            }
            .wa-error-devbox summary {
              font-size: 11px;
              color: rgba(255,255,255,0.35);
              cursor: pointer;
              user-select: none;
              letter-spacing: 0.5px;
            }
            .wa-error-devbox pre {
              font-size: 10.5px;
              color: rgba(255,150,100,0.7);
              margin-top: 10px;
              overflow: auto;
              white-space: pre-wrap;
              word-break: break-all;
              line-height: 1.6;
            }
          `}</style>
          <div className="wa-error-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div className="wa-error-icon-ring">
                <AlertTriangle size={22} color="#ff8c5a" />
              </div>
              <div>
                <p className="wa-error-title">حدث خطأ في نظام WhatsApp</p>
                <p className="wa-error-body" style={{ marginTop: '6px' }}>
                  لا يمكن الاتصال بخدمة WhatsApp حالياً. قد يكون النظام في وضع التجربة أو غير متاح.
                </p>
              </div>
            </div>
            <button className="wa-retry-btn" onClick={() => window.location.reload()}>
              <RefreshCw size={14} />
              إعادة المحاولة
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="wa-error-devbox">
                <summary>تفاصيل الخطأ (Development)</summary>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WhatsAppErrorBoundary;