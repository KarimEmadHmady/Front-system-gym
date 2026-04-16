// hooks/useBarcodeScanner.ts
import { useEffect, useRef, useCallback, useState } from 'react';

// ─── HID Key Map (خارج الـ hook علشان متتعملش في كل render) ──────────────────
const HID_KEY_MAP: Record<number, string> = {
  0x04:'a',0x05:'b',0x06:'c',0x07:'d',0x08:'e',0x09:'f',0x0A:'g',0x0B:'h',
  0x0C:'i',0x0D:'j',0x0E:'k',0x0F:'l',0x10:'m',0x11:'n',0x12:'o',0x13:'p',
  0x14:'q',0x15:'r',0x16:'s',0x17:'t',0x18:'u',0x19:'v',0x1A:'w',0x1B:'x',
  0x1C:'y',0x1D:'z',0x1E:'1',0x1F:'2',0x20:'3',0x21:'4',0x22:'5',0x23:'6',
  0x24:'7',0x25:'8',0x26:'9',0x27:'0',0x2D:'-',0x2E:'=',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface HIDDevice {
  opened: boolean;
  open(): Promise<void>;
  close(): Promise<void>;
  addEventListener(type: 'inputreport', listener: (event: HIDInputReportEvent) => void): void;
  removeEventListener(type: 'inputreport', listener: (event: HIDInputReportEvent) => void): void;
}

interface HIDInputReportEvent {
  data: DataView;
  device: HIDDevice;
}

export interface UseBarcodeOptions {
  onScan: (barcode: string) => void;

  /**
   * ref للـ input اللي بيكتب فيه المستخدم يدوياً.
   * لو اتحدد، الـ hook مش هيستقبل keydown events
   * لما يكون الـ focus على الـ input ده علشان يتجنب التكرار.
   */
  inputRef?: React.RefObject<HTMLInputElement | null>;

  disabled?: boolean;
  minLength?: number;

  /**
   * الفرق بالمللي ثانية بين كل حرف علشان نفرق بين
   * الماسح (سريع جداً < 50ms) والإنسان (بطيء > 100ms).
   * Default: 50ms
   */
  scanDelay?: number;
}

export interface UseBarcodeReturn {
  hidConnected: boolean;
  connectHID: () => Promise<boolean>;
  disconnectHID: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBarcodeScanner({
  onScan,
  inputRef,
  disabled = false,
  minLength = 3,
  scanDelay = 50,
}: UseBarcodeOptions): UseBarcodeReturn {

  const [hidConnected, setHidConnected] = useState(false);

  // ✅ FIX 1: onScan في ref علشان مش محتاجين نضيفه في dependency array
  // ده بيمنع إعادة تسجيل الـ event listener في كل re-render
  const onScanRef   = useRef(onScan);
  const disabledRef = useRef(disabled);
  useEffect(() => { onScanRef.current   = onScan;   }, [onScan]);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);

  const bufferRef      = useRef('');
  const lastKeyTime    = useRef(0);
  const deviceRef      = useRef<HIDDevice | null>(null);
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hidConnectedRef = useRef(false);

  // helper: flush buffer
  const flushBuffer = useCallback(() => {
    const val = bufferRef.current.trim();
    bufferRef.current = '';
    if (val.length >= minLength) onScanRef.current(val);
  }, [minLength]);

  // ─── HID Direct Connection ─────────────────────────────────────────────────
  const connectHID = useCallback(async (): Promise<boolean> => {
    if (!('hid' in navigator)) {
      console.warn('WebHID غير مدعوم في هذا المتصفح. استخدم Chrome أو Edge.');
      return false;
    }
    try {
      const devices = await (navigator as any).hid.requestDevice({ filters: [] });
      const device: HIDDevice = devices[0];
      if (!device) return false;

      await device.open();
      deviceRef.current   = device;
      hidConnectedRef.current = true;
      setHidConnected(true);

      const hidHandler = (event: HIDInputReportEvent) => {
        if (disabledRef.current) return;

        const data = new Uint8Array(event.data.buffer);
        // Byte 0 = modifier, Byte 1 = reserved, Byte 2+ = key codes
        for (let i = 2; i < data.length; i++) {
          const code = data[i];
          if (code === 0) continue;

          if (code === 0x28) { // Enter = نهاية الباركود
            if (timerRef.current) clearTimeout(timerRef.current);
            flushBuffer();
            return;
          }

          const char = HID_KEY_MAP[code];
          if (char) bufferRef.current += char;
        }
      };

      device.addEventListener('inputreport', hidHandler);
      return true;
    } catch (err) {
      console.error('فشل الاتصال بـ HID:', err);
      return false;
    }
  }, [flushBuffer]);

  const disconnectHID = useCallback(async (): Promise<void> => {
    if (deviceRef.current) {
      try { await deviceRef.current.close(); } catch {}
      deviceRef.current   = null;
      hidConnectedRef.current = false;
      setHidConnected(false);
    }
  }, []);

  // ─── Keyboard Fallback ─────────────────────────────────────────────────────
  // يشتغل بس لما HID مش متوصل
  // ✅ FIX 2: الـ dependency array فاضية تقريباً — بنستخدم refs بدل values
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // لو HID متوصل، الـ HID handler هو اللي يشتغل
      if (hidConnectedRef.current) return;
      if (disabledRef.current) return;

      const target = e.target as HTMLElement;

      // ✅ FIX 3: لو الـ focus على الـ barcode input بتاعنا — سيب الـ onChange يشتغل
      // ده بيحل مشكلة التكرار المزدوج
      if (inputRef?.current && target === inputRef.current) return;

      // لو في input تاني (مش input الباركود) — تجاهل
      const inOtherInput = target.tagName === 'INPUT'
                        || target.tagName === 'TEXTAREA'
                        || target.isContentEditable;
      if (inOtherInput) return;

      const now      = Date.now();
      const timeDiff = now - lastKeyTime.current;
      lastKeyTime.current = now;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        flushBuffer();
        return;
      }

      if (e.key === 'Backspace') {
        bufferRef.current = bufferRef.current.slice(0, -1);
        return;
      }

      // حروف قابلة للطباعة فقط
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

      const isScanner = timeDiff < scanDelay;

      // لو الـ focus مش على أي input → اقبل الحرف دايماً (قد يكون ماسح)
      // لو الـ focus على input الباركود → اتكلنا على onChange (FIX 3 فوق)
      // لو تايمنج الماسح → اقبل
      if (isScanner) {
        bufferRef.current += e.key;

        // Auto-flush لو مافيش Enter بعد 200ms
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(flushBuffer, 200);
      }
      // لو بطيء (إنسان) ومش في input → مش ماسح، تجاهل
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // ✅ FIX 2: dependency array ثابتة — مش بتتغير
  }, [flushBuffer, scanDelay, inputRef]);

  return { hidConnected, connectHID, disconnectHID };
}