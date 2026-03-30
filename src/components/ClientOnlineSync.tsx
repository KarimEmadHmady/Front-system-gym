'use client'

import { useEffect } from 'react';
import { initOnlineSync } from '@/lib/offlineSync';

export default function ClientOnlineSync() {
  useEffect(() => {
    const dispose = initOnlineSync('');
    return () => dispose();
  }, []);
  return null;
}


