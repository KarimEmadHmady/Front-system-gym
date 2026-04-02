import React from 'react';
import { WhatsAppDashboard } from '@/components/whatsapp/WhatsAppDashboard';

interface WhatsAppNotificationsProps {
  className?: string;
}

export function WhatsAppNotifications({ className }: WhatsAppNotificationsProps) {
  return (
    <div className={className}>
      <WhatsAppDashboard />
    </div>
  );
}

export default WhatsAppNotifications;
