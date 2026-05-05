// hooks/useBarcodeScanner.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { getCharFromCode } from '@/components/Attendancescanner/keyboardUtils';

export interface UseBarcodeOptions {
  onScan: (barcode: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  minLength?: number;
  scanDelay?: number;
}

export interface UseBarcodeReturn {}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBarcodeScanner({
  onScan,
  inputRef,
  disabled = false,
  minLength = 3,
  scanDelay = 50,
}: UseBarcodeOptions): UseBarcodeReturn {

  const onScanRef   = useRef(onScan);
  const disabledRef = useRef(disabled);
  const bufferRef      = useRef('');
  const lastKeyTime    = useRef(0);
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { onScanRef.current   = onScan;   }, [onScan]);

  useEffect(() => {
    if (disabled) {
      bufferRef.current = '';
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    disabledRef.current = disabled;
  }, [disabled]);


  // helper: flush buffer
  const flushBuffer = useCallback(() => {
    const val = bufferRef.current.trim();
    bufferRef.current = '';
    if (val.length >= minLength) onScanRef.current(val);
  }, [minLength]);


useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (disabledRef.current) return;

    const target = e.target as HTMLElement;

    if (inputRef?.current && target === inputRef.current) return;

    const inOtherInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;
    if (inOtherInput) return;

    const now = Date.now();
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

    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const char = getCharFromCode(e.code, e.shiftKey);
    if (!char) return;

    // ✅ FIX: لو البافر فاضي والحرف جه ببطء (يدوي) — اتجاهله
    // السكانر بيبعت الحروف بسرعة < scanDelay ms
    // الكتابة اليدوية بتيجي بـ timeDiff كبير
    const isFirstChar = bufferRef.current.length === 0;
    const isFastInput = timeDiff < scanDelay;

    if (isFirstChar) {
      // ✅ الحرف الأول — خزّنه وانتظر الحرف التاني
      bufferRef.current += char;
      if (timerRef.current) clearTimeout(timerRef.current);
      // ✅ لو ما جاش حرف تاني سريع، امسح البافر (كتابة يدوية)
      timerRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, scanDelay * 2);
    } else if (isFastInput) {
      // ✅ حروف سريعة = سكانر
      bufferRef.current += char;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushBuffer, 200);
    }
    // ✅ حروف بطيئة بعد الأول = كتابة يدوية — اتجاهلها في البافر
  };

  window.addEventListener('keydown', handler);
  return () => {
    window.removeEventListener('keydown', handler);
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, [flushBuffer, scanDelay, inputRef]);

  return {};
}

