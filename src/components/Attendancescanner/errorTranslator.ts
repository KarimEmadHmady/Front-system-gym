function translateError(msg: string | undefined, barcode?: string): string {
  const m = (msg || '').toLowerCase();
  if (m.includes('already') || m.includes('duplicate') || m.includes('scanned') || (m.includes('تم') && m.includes('الحضور')))
    return 'تم تسجيل الحضور مسبقًا لهذا اليوم.';
  if (m.includes('not found') || m.includes('no user') || m.includes('invalid') || m.includes('غير موجود'))
    return `الباركود غير موجود${barcode ? `: ${barcode}` : ''}`;
  if (m.includes('inactive') || m.includes('suspended') || m.includes('محظور') || m.includes('غير نشط'))
    return 'الحساب غير نشط، لا يمكن تسجيل الحضور.';
  if (m.includes('انتهى الاشتراك') || m.includes('expired'))
    return 'انتهى الاشتراك، يرجى التجديد.';
  return msg && msg.trim() ? msg : 'حدث خطأ أثناء مسح الباركود.';
}

export { translateError };
