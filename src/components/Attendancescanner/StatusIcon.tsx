'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusIconProps {
  status: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  if (status === 'present') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (status === 'absent')  return <XCircle     className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
};

export default StatusIcon;
