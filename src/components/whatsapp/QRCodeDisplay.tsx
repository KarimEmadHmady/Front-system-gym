import React, { useEffect, useState } from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ value, size = 200, className }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!value) {
      setError(true);
      return;
    }

    try {
      // Use QR Server API (better for long strings)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=png&bgcolor=FFFFFF&color=000000`;
      setQrDataUrl(qrUrl);
      setError(false);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(true);
    }
  }, [value, size]);

  if (!value || error) {
    return (
      <div className={`qr-placeholder ${className || ''}`} style={{ 
        width: size, 
        height: size, 
        border: '2px dashed #666', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        background: '#f5f5f5'
      }}>
        <span style={{ color: '#666', fontSize: '14px' }}>No QR Code</span>
      </div>
    );
  }

  return (
    <div className={`qr-container ${className || ''}`} style={{ 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 0'
    }}>
      <img 
        src={qrDataUrl}
        alt="QR Code"
        style={{ 
          width: size, 
          height: size,
          borderRadius: '8px',
          background: 'white',
          padding: '8px',
          border: '1px solid #ddd'
        }}
        onError={() => setError(true)}
      />
    </div>
  );
}
