'use client';

import { use } from 'react';
import { useAuth } from "@/hooks/useAuth";
import AttendanceScanner from "@/components/Attendancescanner/Attendancescanner";

export default function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { user } = useAuth();
  const resolvedParams = use(params);
  
  // Determine role based on user's actual role
  const role = user?.role === 'admin' ? 'admin' : 
              user?.role === 'manager' ? 'manager' : 'admin'; // fallback to admin
  
  return (
    <AttendanceScanner
      userId={resolvedParams.userId}
      role={role}
    />
  );
}