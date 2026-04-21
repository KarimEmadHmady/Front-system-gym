'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { User } from '@/types/models';

interface ClientCardProps {
  client: User;
  onViewProgress: (client: User) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onViewProgress }) => {
  const initials = client.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="group flex items-center justify-between bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/40 hover:bg-slate-800 rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-emerald-900/20 hover:shadow-md">
      <div className="flex items-center gap-3">
        {client.avatarUrl ? (
          <img
            src={client.avatarUrl}
            alt={client.name}
            className="w-11 h-11 rounded-xl object-cover border-2 border-slate-600 group-hover:border-emerald-500/50 transition-colors"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm ${client.avatarUrl ? 'hidden' : 'flex'}`}
          style={{ display: client.avatarUrl ? 'none' : 'flex' }}
        >
          <span className="text-white font-bold text-base">{initials}</span>
        </div>

        <div>
          <h4 className="font-semibold text-white text-sm leading-tight">{client.name}</h4>
          <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-none">{client.email}</p>
          {client.phone && (
            <p className="text-xs text-slate-500 mt-0.5">{client.phone}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => onViewProgress(client)}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap sm:px-3 sm:py-2 px-2 py-2"
      >
        <TrendingUp className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">سجلات التقدم</span>
      </button>
    </div>
  );
};

export default ClientCard;