'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userService, progressService } from '@/services';

// Import extracted components
import ProgressHeader from './ProgressHeader';
import ProgressList from './ProgressList';
import CreateProgressModal from './CreateProgressModal';
import EditProgressModal from './EditProgressModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { formatDate, formatProgressValue, getProgressStatus } from './utils';

const TrainerProgressOverview = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [progressModalClient, setProgressModalClient] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProgress, setEditingProgress] = useState<any>(null);
  const [progressModalList, setProgressModalList] = useState<any[]>([]);
  const [progressModalLoading, setProgressModalLoading] = useState(false);
  const [progressDeleteId, setProgressDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const res = await userService.getUsersByRole('member', { page: 1, limit: 1000 });
        const clientList = Array.isArray(res) ? res : (res?.data || []);
        setClients(clientList);
      } catch (err: any) {
        setError(err.message || 'فشل تحميل العملاء');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleClientClick = async (client: any) => {
    try {
      setProgressModalLoading(true);
      const list = await progressService.getUserProgress(client._id);
      setProgressModalList(list);
      setProgressModalClient(client);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل سجلات التقدم');
    } finally {
      setProgressModalLoading(false);
    }
  };

  const handleCreateProgress = (progressData: any) => {
    setProgressModalList(prev => [progressData, ...prev]);
  };

  const handleUpdateProgress = (progressData: any) => {
    setProgressModalList(prev => prev.map(p => p._id === progressData._id ? progressData : p));
  };

  const handleDeleteProgress = async (id: string) => {
    try {
      await progressService.delete(id);
      setProgressModalList(prev => prev.filter(p => p._id !== id));
      setProgressDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'فشل حذف سجل التقدم');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProgressHeader
        progressModalClient={progressModalClient}
        onShowCreateModal={() => setShowCreateModal(true)}
      />

      {/* Progress Modal */}
      {progressModalClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProgressModalClient(null)} />
          <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                سجل تقدم {progressModalClient?.name}
              </h3>
              <button
                onClick={() => setProgressModalClient(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {progressModalLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
              </div>
            ) : (
              <ProgressList
                progressModalList={progressModalList}
                progressModalClient={progressModalClient}
                onProgressModalClientChange={setProgressModalClient}
                onProgressDeleteIdChange={setProgressDeleteId}
                onDeleteProgress={handleDeleteProgress}
              />
            )}
          </div>
        </div>
      )}

      {/* Create Progress Modal */}
      <CreateProgressModal
        showCreateModal={showCreateModal}
        progressModalClient={progressModalClient}
        onShowCreateModal={setShowCreateModal}
        onCreateProgress={handleCreateProgress}
      />

      {/* Edit Progress Modal */}
      <EditProgressModal
        showEditModal={showEditModal}
        editingProgress={editingProgress}
        onShowEditModal={setShowEditModal}
        onUpdateProgress={handleUpdateProgress}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        progressDeleteId={progressDeleteId}
        onProgressDeleteIdChange={setProgressDeleteId}
        onDeleteProgress={handleDeleteProgress}
      />
    </div>
  );
};

export default TrainerProgressOverview;
