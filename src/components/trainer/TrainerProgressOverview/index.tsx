'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/models';
import { UserService } from '@/services/userService';
import { ProgressService } from '@/services/progressService';
import { TrendingUp, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

import StatsCard from './components/StatsCard';
import ClientCard from './components/ClientCard';
import Pagination from './components/Pagination';
import ProgressModal from './components/ProgressModal';
import type { ProgressRecord } from './types/progress.types';

const ITEMS_PER_PAGE = 10;
const userService = new UserService();
const progressService = new ProgressService();

const TrainerProgressOverview = () => {
  const { user } = useAuth();
  const currentTrainerId = (user as any)?._id ?? user?.id ?? '';

  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Progress modal state
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);

  // ─── Fetch clients ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await userService.getUsersByRole('member', { page: 1, limit: 1000 });
        const arr: any[] = Array.isArray(res) ? res : (res?.data || []);

        const normalizeId = (val: any): string => {
          if (!val) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'object') return (val._id || val.id || '') as string;
          return String(val);
        };

        const me = normalizeId(currentTrainerId);
        setClients(arr.filter((m) => normalizeId(m?.trainerId) === me));
      } catch {
        setError('تعذر جلب العملاء');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [currentTrainerId]);

  // ─── Open progress modal ────────────────────────────────────────────────────
  const handleViewProgress = async (client: User) => {
    setSelectedClient(client);
    setProgressLoading(true);
    setProgressRecords([]);
    try {
      const list = await progressService.getUserProgress(client._id);
      setProgressRecords(list);
    } catch {
      setProgressRecords([]);
    } finally {
      setProgressLoading(false);
    }
  };

  // ─── Export clients table ───────────────────────────────────────────────────
  const handleExportClients = () => {
    const data = clients.map((c) => ({
      'الاسم': c.name,
      'البريد الإلكتروني': c.email,
      'رقم الهاتف': c.phone || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'clients_progress_overview.xlsx');
  };

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentClients = clients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" dir="rtl">
      <StatsCard totalClients={clients.length} />

      {/* Clients Table */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">تقدم العملاء</h3>
          </div>
          <button
            onClick={handleExportClients}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            تصدير البيانات
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-10 h-10 bg-red-600/10 border border-red-500/30 rounded-xl flex items-center justify-center">
                <span className="text-red-400 font-bold">!</span>
              </div>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : currentClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-slate-500">لا يوجد عملاء</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentClients.map((client) => (
                <ClientCard
                  key={client._id}
                  client={client}
                  onViewProgress={handleViewProgress}
                />
              ))}
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={clients.length}
          startIndex={startIndex}
          endIndex={startIndex + ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Progress Modal */}
      {selectedClient && (
        <ProgressModal
          client={selectedClient}
          records={progressRecords}
          loading={progressLoading}
          currentTrainerId={currentTrainerId}
          onClose={() => setSelectedClient(null)}
          onRecordsChange={setProgressRecords}
          setLoading={setProgressLoading}
        />
      )}
    </div>
  );
};

export default TrainerProgressOverview;