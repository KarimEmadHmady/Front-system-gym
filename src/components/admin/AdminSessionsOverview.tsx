'use client';

import React from 'react';
import SessionSchedulesManagement from './SessionSchedulesManagement';

const AdminSessionsOverview = () => {
  return (
    <SessionSchedulesManagement 
      userRole="admin" 
      viewMode="management" 
    />
  );
};

export default AdminSessionsOverview;