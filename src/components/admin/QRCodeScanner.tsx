'use client';

import React, { useState, useRef, useEffect } from 'react';
// Simple UI components
const Button = ({ children, onClick, disabled = false, className = '', variant = 'default', size = 'md' }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean; 
  className?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md';
}) => {
  const baseClasses = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    default: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Alert = ({ children, className = '', variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'destructive' }) => {
  const variantClasses = variant === 'destructive'
    ? 'border border-red-200 bg-red-50 text-red-800'
    : 'border border-gray-200 bg-gray-50 text-gray-800';
  return (
    <div className={`p-4 rounded-md ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">
    {children}
  </div>
);
import { QrCode, Camera, X, CheckCircle, XCircle } from 'lucide-react';
// Simple toast implementation
const toast = {
  success: (message: string) => {
    // You can replace this with your preferred toast library
    alert(`Success: ${message}`);
  },
  error: (message: string) => {
    alert(`Error: ${message}`);
  },
  warning: (message: string) => {
    alert(`Warning: ${message}`);
  }
};

import { BrowserMultiFormatReader } from '@zxing/browser';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const barcodeBufferRef = useRef<string>("");
  const barcodeResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInputValue, setManualInputValue] = useState('');
  const scannedRef = useRef(false);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setIsScanning(true);
    scannedRef.current = false;
    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      const deviceId = videoInputDevices.length > 1
        ? videoInputDevices.find(d => d.label.toLowerCase().includes('back'))?.deviceId || videoInputDevices[0].deviceId
        : videoInputDevices[0]?.deviceId;
      if (!deviceId) throw new Error('لم يتم العثور على كاميرا');
      codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, err) => {
        if (result && !scannedRef.current) {
          scannedRef.current = true;
          setLastScannedData(result.getText());
          stopScanning();
          onScan(result.getText());
          onClose(); // أغلق نافذة الكاميرا فورًا بعد أول قراءة ناجحة
        }
        // تجاهل جميع الأخطاء أثناء المسح (لا تعرض رسالة)
      });
    } catch (err: any) {
      setError('تعذر الوصول إلى الكاميرا أو بدء المسح.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    scannedRef.current = false;
    if (codeReaderRef.current) {
      if (typeof (codeReaderRef.current as any).reset === 'function') {
        (codeReaderRef.current as any).reset();
      } else {
        // fallback: إيقاف الكاميرا يدويًا
        try {
          codeReaderRef.current.decodeFromVideoDevice(undefined, undefined, () => {});
        } catch {}
      }
      codeReaderRef.current = null;
    }
  };

  // Keyboard wedge barcode scanner handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if focused on an input/textarea/contenteditable
      const target = event.target as HTMLElement | null;
      const isEditable = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).isContentEditable
      );
      if (isEditable) {
        return;
      }

      // Most barcode scanners type fast characters then send Enter
      if (event.key === 'Enter') {
        const buffered = barcodeBufferRef.current.trim();
        if (buffered.length > 0) {
          barcodeBufferRef.current = '';
          if (barcodeResetTimeoutRef.current) {
            clearTimeout(barcodeResetTimeoutRef.current);
            barcodeResetTimeoutRef.current = null;
          }
          // This part of the logic is now handled by the BrowserMultiFormatReader
          // If you want to keep the manual input functionality, you'd need to
          // re-implement the barcode detection logic here or pass the input to onScan.
          // For now, we'll just clear the buffer.
        }
        return;
      }

      // Accept only visible characters
      if (event.key.length === 1) {
        barcodeBufferRef.current += event.key;
        if (barcodeResetTimeoutRef.current) {
          clearTimeout(barcodeResetTimeoutRef.current);
        }
        // Reset buffer if no keys within 300ms (separates manual typing from scanner bursts)
        barcodeResetTimeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = '';
          barcodeResetTimeoutRef.current = null;
        }, 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (barcodeResetTimeoutRef.current) {
        clearTimeout(barcodeResetTimeoutRef.current);
        barcodeResetTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" dir="rtl">
      <Card className="w-full max-w-lg mx-4 rounded-xl shadow-lg">
        <CardHeader className="bg-gradient-to-l from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              <span>ماسح رمز الاستجابة السريعة</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isScanning ? (
            <div className="space-y-4">
              <div className="text-center text-gray-700">
                <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>اضغط لبدء المسح بالكاميرا</p>
                <p className="text-xs text-gray-500 mt-1">يمكنك أيضاً استخدام ماسح الباركود الموصل بلوحة المفاتيح</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={startScanning}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 ml-2" />
                  تشغيل الكاميرا
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowManualInput(true)}
                  className="flex-1"
                >
                  إدخال يدوي
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative flex justify-center items-center ">
                <video
                  ref={videoRef}
                  className="w-full max-w-[95vw] max-h-[40vh] sm:max-w-[400px] sm:max-h-[250px] aspect-[16/10] bg-gray-100 rounded-lg border border-gray-200"
                  playsInline
                  muted
                  style={{ objectFit: 'cover' }}
                />
                {/* Overlay لإطار الكارت */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[95vw] max-h-[40vh] sm:max-w-[400px] sm:max-h-[250px] aspect-[16/10] border-4 border-gray-500 rounded-lg pointer-events-none"
                />
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  وجّه الكاميرا نحو رمز QR
                </p>
                <Button
                  variant="outline"
                  onClick={stopScanning}
                  className="w-full"
                >
                  إيقاف المسح
                </Button>
              </div>
            </div>
          )}

          {lastScannedData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>تم المسح:</strong> {lastScannedData}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      {showManualInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs mx-2">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">إدخال الباركود يدويًا</h3>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-700"
              placeholder="أدخل الباركود أو رمز QR..."
              value={manualInputValue}
              onChange={e => setManualInputValue(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && manualInputValue.trim()) {
                  onScan(manualInputValue.trim());
                  setManualInputValue('');
                  setShowManualInput(false);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (manualInputValue.trim()) {
                    onScan(manualInputValue.trim());
                    setManualInputValue('');
                    setShowManualInput(false);
                  }
                }}
                className="flex-1"
              >
                تأكيد
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowManualInput(false);
                  setManualInputValue('');
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
