'use client';

import React, { useState, useEffect } from 'react';
import { attendanceService } from '@/services';

interface CrowdLevelData {
  count: number;
  crowdLevel: 'low' | 'light' | 'moderate' | 'busy' | 'very_busy';
  crowdStatus: string;
  timeRange: string;
  timestamp: string;
}

const levelConfig = {
  low:      { label: 'هادئ',        fill: 10,  color: '#22c55e', glow: '#bbf7d0', ring: '#16a34a', arabic: 'منخفضة جداً' },
  light:    { label: 'خفيف',        fill: 20,  color: '#38bdf8', glow: '#bae6fd', ring: '#0284c7', arabic: 'منخفضة' },
  moderate: { label: 'متوسط',       fill: 45,  color: '#facc15', glow: '#fef08a', ring: '#ca8a04', arabic: 'متوسطة' },
  busy:     { label: 'مزدحم',       fill: 75,  color: '#fb923c', glow: '#fed7aa', ring: '#ea580c', arabic: 'عالية' },
  very_busy:{ label: 'مزدحم جداً', fill: 100, color: '#f43f5e', glow: '#fecdd3', ring: '#be123c', arabic: 'عالية جداً' },
};

const MemberCrowdLevel: React.FC = () => {
  const [crowdData, setCrowdData] = useState<CrowdLevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCrowdLevel = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getCrowdLevel();
        setCrowdData(data);
        setError(null);
      } catch (err) {
        setError('فشل في جلب بيانات الزحام');
      } finally {
        setLoading(false);
      }
    };
    fetchCrowdLevel();
    const interval = setInterval(fetchCrowdLevel, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cfg = crowdData ? levelConfig[crowdData.crowdLevel] ?? levelConfig.low : levelConfig.low;
  const displayFill = crowdData?.count === 0 ? 0 : cfg.fill;
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference - (circumference * (displayFill / 100));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

        .crowd-card {
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          background: #0f1117;
          border: 1px solid #1e2130;
          border-radius: 20px;
          padding: 28px;
          width: 100%;
          max-width: 360px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .crowd-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .noise-layer {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: 20px;
        }

        .glow-blob {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.12;
          top: -40px;
          left: -40px;
          transition: background 0.6s ease;
          pointer-events: none;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .card-title {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1a1f2e;
          border: 1px solid #2a3040;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          color: #6b7280;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .main-content {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .ring-container {
          position: relative;
          flex-shrink: 0;
        }

        .ring-svg {
          transform: rotate(-90deg);
          filter: drop-shadow(0 0 8px var(--ring-glow));
          transition: filter 0.6s ease;
        }

        .ring-track {
          fill: none;
          stroke: #1e2130;
          stroke-width: 6;
        }

        .ring-fill {
          fill: none;
          stroke-width: 6;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.6s ease;
        }

        .ring-center-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .ring-count {
          font-size: 22px;
          font-weight: 800;
          color: #f9fafb;
          line-height: 1;
          transition: color 0.6s ease;
        }

        .ring-unit {
          font-size: 9px;
          color: #6b7280;
          margin-top: 2px;
        }

        .text-section {
          flex: 1;
          min-width: 0;
        }

        .crowd-number {
          font-size: 42px;
          font-weight: 800;
          color: #f9fafb;
          line-height: 1;
          margin-bottom: 4px;
          transition: color 0.4s;
        }

        .crowd-label {
          font-size: 13px;
          color: #9ca3af;
          margin-bottom: 10px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
          transition: background 0.4s, border-color 0.4s, color 0.4s;
        }

        .bar-section {
          position: relative;
          z-index: 1;
          margin-bottom: 20px;
        }

        .bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .bar-track {
          height: 6px;
          background: #1e2130;
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.6s ease;
        }

        .bar-segments {
          display: flex;
          gap: 3px;
          margin-top: 8px;
        }

        .bar-segment {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          transition: background 0.4s;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
          padding-top: 16px;
          border-top: 1px solid #1e2130;
        }

        .footer-time {
          font-size: 11px;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .footer-range {
          font-size: 11px;
          color: #4b5563;
        }

        /* loading */
        .skeleton {
          background: linear-gradient(90deg, #1a1f2e 25%, #232838 50%, #1a1f2e 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* pulse for very busy */
        .pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid;
          animation: ring-pulse 2s infinite;
          pointer-events: none;
        }
        @keyframes ring-pulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.25); }
        }
      `}</style>

      {loading ? (
        <div className="crowd-card">
          <div className="noise-layer" />
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="skeleton" style={{ height:16, width:'40%' }} />
            <div style={{ display:'flex', gap:16, alignItems:'center', margin:'12px 0' }}>
              <div className="skeleton" style={{ width:88, height:88, borderRadius:'50%' }} />
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                <div className="skeleton" style={{ height:36, width:'60%' }} />
                <div className="skeleton" style={{ height:14, width:'80%' }} />
                <div className="skeleton" style={{ height:24, width:'50%', borderRadius:20 }} />
              </div>
            </div>
            <div className="skeleton" style={{ height:8 }} />
          </div>
        </div>
      ) : error ? (
        <div className="crowd-card" style={{ border:'1px solid #3f1f23' }}>
          <div className="noise-layer" />
          <div style={{ display:'flex', alignItems:'center', gap:12, color:'#f87171' }}>
            <span style={{ fontSize:28 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#fca5a5' }}>خطأ في تحميل البيانات</div>
              <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>{error}</div>
            </div>
          </div>
        </div>
      ) : crowdData ? (
        <div className="crowd-card" style={{ '--ring-glow': cfg.glow } as React.CSSProperties}>
          <div className="noise-layer" />
          <div className="glow-blob" style={{ background: cfg.color }} />

          {/* Header */}
          <div className="card-header">
            <span className="card-title">مستوى الزحام</span>
            <div className="live-badge">
              <span className="live-dot" />
              مباشر
            </div>
          </div>

          {/* Main */}
          <div className="main-content">
            {/* Ring */}
            <div className="ring-container">
              {crowdData.crowdLevel === 'very_busy' && (
                <div className="pulse-ring" style={{ borderColor: cfg.color }} />
              )}
              <svg width="88" height="88" className="ring-svg">
                <circle className="ring-track" cx="44" cy="44" r="38" />
                <circle
                  className="ring-fill"
                  cx="44" cy="44" r="38"
                  stroke={cfg.color}
                  strokeDasharray={circumference}
                  strokeDashoffset={mounted ? dashOffset : circumference}
                />
              </svg>
              <div className="ring-center-text">
                <span className="ring-count" style={{ color: cfg.color }}>{displayFill}%</span>
                <span className="ring-unit">كثافة</span>
              </div>
            </div>

            {/* Text */}
            <div className="text-section">
              <div className="crowd-number">{crowdData.count}</div>
              <div className="crowd-label">شخص حالياً</div>
              <div
                className="status-pill"
                style={{
                  background: cfg.color + '15',
                  borderColor: cfg.color + '40',
                  color: cfg.color,
                }}
              >
                <span style={{ fontSize:8 }}>●</span>
                {crowdData.crowdStatus}
              </div>
            </div>
          </div>

          {/* Bar */}
          <div className="bar-section">
            <div className="bar-labels">
              <span>كثافة الحضور</span>
              <span style={{ color: cfg.color }}>{cfg.arabic}</span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: mounted ? `${displayFill}%` : '0%',
                  background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                }}
              />
            </div>
            <div className="bar-segments">
              {['low','light','moderate','busy','very_busy'].map((lvl) => {
                const active = ['low','light','moderate','busy','very_busy'].indexOf(lvl) <=
                               ['low','light','moderate','busy','very_busy'].indexOf(crowdData.crowdLevel);
                return (
                  <div
                    key={lvl}
                    className="bar-segment"
                    style={{ background: active ? levelConfig[lvl as keyof typeof levelConfig].color : '#1e2130' }}
                  />
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-time">
              <span>🕒</span>
              {new Date(crowdData.timestamp).toLocaleTimeString('ar-EG')}
            </div>
            <div className="footer-range">{crowdData.timeRange}</div>
          </div>
        </div>
      ) : null}
    </>
  );
};


export default MemberCrowdLevel;