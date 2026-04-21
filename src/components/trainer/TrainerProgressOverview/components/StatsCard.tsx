'use client';

import React from 'react';
import { Users } from 'lucide-react';

interface StatsCardProps {
  totalClients: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ totalClients }) => (
  <div className="flex justify-center my-4">
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-xl p-6 flex flex-col items-center w-full max-w-xs gap-2">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
        <Users className="w-6 h-6 text-white" />
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{totalClients}</p>
      <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">إجمالي العملاء</p>
    </div>
  </div>
);

export default StatsCard;