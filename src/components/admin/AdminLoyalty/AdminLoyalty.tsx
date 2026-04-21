'use client';

import React, { useEffect, useState } from 'react';
import { LoyaltyService } from '@/services/loyaltyService';
import type { RewardsStatsResponse, LoyaltyPointsStatsResponse, RedeemableReward } from '@/types';
import { UserService } from '@/services/userService';
import { useLoyaltyStats } from '@/hooks/useLoyaltyStats';
import type { User } from '@/types/models';
import * as XLSX from 'xlsx';
import VideoTutorial from '@/components/VideoTutorial';

// Import new components
import TopUsers from './components/TopUsers';
import RewardModal from './components/RewardModal';
import DeleteRewardDialog from './components/DeleteRewardDialog';
import AddPointsForm from './components/AddPointsForm';
import PointsHistory from './components/PointsHistory';
import RedemptionsTable from './components/RedemptionsTable';
import RewardsList from './components/RewardsList';
import LoyaltyStats from './components/LoyaltyStats';

// Types
type TopUser = {
  _id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  avatarUrl?: string;
};

const loyaltyService = new LoyaltyService();
const userService = new UserService();

const initialRewardForm = {
  name: '',
  description: '',
  pointsRequired: 0,
  category: 'discount',
  isActive: true,
  stock: 1,
  minMembershipLevel: 'basic',
  maxRedemptionsPerUser: 1,
  value: 0,
  valueUnit: 'جنيه',
  conditions: '',
  imageUrl: '',
  validUntil: '',
};

const AdminLoyalty = () => {
  // Use shared loyalty stats hook
  const { loyaltyStats, rewardsStats, refreshStats } = useLoyaltyStats();
  
  // State
  const [rewards, setRewards] = useState<RedeemableReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editReward, setEditReward] = useState<RedeemableReward | null>(null);
  const [rewardForm, setRewardForm] = useState<any>(initialRewardForm);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'rewards' | 'redemptions' | 'history' | 'addPoints'>('rewards');

  // Add points state
  const [addPointsUserId, setAddPointsUserId] = useState('');
  const [addPointsValue, setAddPointsValue] = useState(1);
  const [addPointsReason, setAddPointsReason] = useState('');
  const [addPointsLoading, setAddPointsLoading] = useState(false);
  const [addPointsError, setAddPointsError] = useState<string | null>(null);
  const [addPointsSuccess, setAddPointsSuccess] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [confirmDeleteRewardId, setConfirmDeleteRewardId] = useState<string | null>(null);

  // Points history state
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyFilterUserId, setHistoryFilterUserId] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState('');
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyPageSize] = useState(10);
  const [historyTotalCount, setHistoryTotalCount] = useState(0);

  // Top users state
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topUsersLoading, setTopUsersLoading] = useState(false);

  // Redemptions state
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionsError, setRedemptionsError] = useState<string | null>(null);
  const [redemptionsFilter, setRedemptionsFilter] = useState({
    userId: '',
    rewardId: '',
    startDate: '',
    endDate: ''
  });
  const [redemptionsCurrentPage, setRedemptionsCurrentPage] = useState(1);
  const [redemptionsPageSize] = useState(10);
  const [redemptionsTotalCount, setRedemptionsTotalCount] = useState(0);

  // Users state
  const [users, setUsers] = useState<User[]>([]);

  // Effects
  useEffect(() => {
    fetchRewards();
    fetchUsers();
    fetchTopUsers();
    fetchPointsHistory();
    fetchRedemptions();
  }, []);

  useEffect(() => {
    if (historyFilterUserId || historyFilterType) {
      setHistoryCurrentPage(1);
    }
    fetchPointsHistory();
  }, [historyFilterUserId, historyFilterType, historyCurrentPage]);

  useEffect(() => {
    setRedemptionsCurrentPage(1);
    fetchRedemptions();
  }, [redemptionsFilter, redemptionsCurrentPage]);

  // Functions
  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await loyaltyService.getAllRedeemableRewards();
      setRewards(response || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch rewards');
      console.error('Error fetching rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers({ page: 1, limit: 200 } as any);
      const userList = Array.isArray(response) ? response : Array.isArray((response as any)?.data) ? (response as any).data : [];
      setUsers(userList);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchTopUsers = async () => {
    try {
      setTopUsersLoading(true);
      const response = await loyaltyService.getTopUsers(3);
      setTopUsers(response || []);
    } catch (err) {
      console.error('Error fetching top users:', err);
      setTopUsers([]);
    } finally {
      setTopUsersLoading(false);
    }
  };

  const fetchPointsHistory = async () => {
    try {
      setHistoryLoading(true);
      const params: any = {
        page: historyCurrentPage,
        limit: historyPageSize
      };
      
      if (historyFilterUserId) params.userId = historyFilterUserId;
      if (historyFilterType) params.type = historyFilterType;

      const response = await loyaltyService.getAllPointsHistory(params);
      setPointsHistory(response?.history || []);
      setHistoryTotalCount(response?.totalCount || 0);
      setHistoryError(null);
    } catch (err) {
      setHistoryError('Failed to fetch points history');
      setPointsHistory([]);
      setHistoryTotalCount(0);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      setRedemptionsLoading(true);
      const params: any = {
        page: redemptionsCurrentPage,
        limit: redemptionsPageSize
      };

      Object.keys(redemptionsFilter).forEach(key => {
        if (redemptionsFilter[key as keyof typeof redemptionsFilter]) {
          params[key] = redemptionsFilter[key as keyof typeof redemptionsFilter];
        }
      });

      const response = await loyaltyService.getAllPointsHistory(params);
      setRedemptions(response?.history || []);
      setRedemptionsTotalCount(response?.totalCount || 0);
      setRedemptionsError(null);
    } catch (err) {
      setRedemptionsError('Failed to fetch redemptions');
      setRedemptions([]);
      setRedemptionsTotalCount(0);
    } finally {
      setRedemptionsLoading(false);
    }
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      setModalError(null);
      setModalSuccess(null);
      
      if (editReward) {
        // Update existing reward - only send changed fields
        const updateData: Partial<RedeemableReward> = {
          name: rewardForm.name,
          pointsRequired: rewardForm.pointsRequired,
          category: rewardForm.category,
          value: rewardForm.value,
          valueUnit: rewardForm.valueUnit,
          stock: rewardForm.stock,
          validUntil: rewardForm.validUntil,
          description: rewardForm.description,
          conditions: rewardForm.conditions,
          isActive: rewardForm.isActive
        };
        
        const response = await loyaltyService.updateRedeemableReward(editReward._id, updateData);
        if (response) {
          setModalSuccess('تم تحديث المكافأة بنجاح');
          fetchRewards();
          setIsRewardModalOpen(false);
          setEditReward(null);
          setRewardForm({
            name: '',
            pointsRequired: 0,
            category: 'discount',
            value: 0,
            valueUnit: '',
            stock: 0,
            validUntil: '',
            description: '',
            conditions: '',
            isActive: true
          });
        }
      } else {
        // Create new reward - send complete form data
        const newRewardData = {
          name: rewardForm.name,
          pointsRequired: rewardForm.pointsRequired,
          category: rewardForm.category,
          value: rewardForm.value,
          valueUnit: rewardForm.valueUnit,
          stock: rewardForm.stock,
          validUntil: rewardForm.validUntil,
          description: rewardForm.description,
          conditions: rewardForm.conditions,
          isActive: rewardForm.isActive
        };
        
        const response = await loyaltyService.createRedeemableReward(newRewardData);
        if (response) {
          setModalSuccess('تم إنشاء المكافأة بنجاح');
          fetchRewards();
          setIsRewardModalOpen(false);
          setRewardForm({
            name: '',
            pointsRequired: 0,
            category: 'discount',
            value: 0,
            valueUnit: '',
            stock: 0,
            validUntil: '',
            description: '',
            conditions: '',
            isActive: true
          });
        }
      }
    } catch (err: any) {
      if (err?.message) {
        setModalError(err.message);
      } else if (err?.errors && Array.isArray(err.errors)) {
        setModalError(err);
      } else {
        setModalError('فشل حفظ المكافأة');
      }
      console.error('Error saving reward:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    try {
      await loyaltyService.deleteRedeemableReward(id);
      setDeleteSuccess('Reward deleted successfully');
      fetchRewards();
      refreshStats();
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete reward');
    }
  };

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPointsLoading(true);
    setAddPointsError(null);
    setAddPointsSuccess(null);

    try {
      await loyaltyService.addPoints(addPointsUserId, addPointsValue, addPointsReason);

      setAddPointsSuccess('Points added successfully');
      setAddPointsUserId('');
      setAddPointsValue(1);
      setAddPointsReason('');
      refreshStats();
      fetchTopUsers();
      fetchPointsHistory();
    } catch (err: any) {
      setAddPointsError(err?.message || 'Failed to add points');
    } finally {
      setAddPointsLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      const redemptionData = redemptions
        .filter(r => r.type === 'redeemed')
        .map((r) => {
          const user = users.find(u => u._id === r.userId);
          const rewardId = typeof r.rewardId === 'string' ? r.rewardId : 
                     r.rewardId?._id || r.rewardId?.toString() || '';
                    const reward = rewards.find(reward => reward._id === rewardId);
          
          return {
            'User Name': user?.name || '-',
            'Reward Name': reward ? reward.name : `ID: ${typeof r.rewardId === 'string' ? r.rewardId.slice(0, 8) : String(r.rewardId || '').slice(0, 8)}...`,
            'Points Used': Math.abs(r.points) || 0,
            'Status': r.reason || 'مكتملة',
            'Notes': r.notes || '-',
            'Date': new Date(r.createdAt).toLocaleDateString('ar-EG'),
          };
        });

      const ws = XLSX.utils.json_to_sheet(redemptionData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Redemptions');
      XLSX.writeFile(wb, `Redemptions_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">إدارة نقاط الولاء</h1>
        <p className="text-gray-600 dark:text-gray-300">إدارة نقاط الولاء والمكافآت واستبدالات المستخدمين</p>
      </div>

      {/* Stats */}
      <LoyaltyStats 
        loyaltyStats={loyaltyStats} 
        rewardsStats={rewardsStats} 
        loading={loading}
        onRefresh={refreshStats}
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {[
              { key: 'rewards', label: 'المكافآت' },
              { key: 'redemptions', label: 'الاستبدالات' },
              { key: 'history', label: 'السجل' },
              { key: 'addPoints', label: 'إضافة نقاط' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rewards' && (
            <RewardsList
              rewards={rewards}
              loading={loading}
              onAddReward={() => {
                setEditReward(null);
                setRewardForm(initialRewardForm);
                setIsRewardModalOpen(true);
              }}
              onEditReward={(reward) => {
                setEditReward(reward);
                setRewardForm({
                  _id: reward._id,
                  name: reward.name,
                  description: reward.description,
                  pointsRequired: reward.pointsRequired,
                  category: reward.category,
                  value: reward.value,
                  valueUnit: reward.valueUnit || 'جنيه',
                  stock: reward.stock,
                  validUntil: reward.validUntil,
                  conditions: reward.conditions,
                  isActive: reward.isActive,
                  minMembershipLevel: reward.minMembershipLevel,
                  maxRedemptionsPerUser: reward.maxRedemptionsPerUser,
                  imageUrl: reward.imageUrl
                });
                setIsRewardModalOpen(true);
              }}
              onDeleteReward={(id) => setConfirmDeleteRewardId(id)}
            />
          )}

          {activeTab === 'redemptions' && (
            <RedemptionsTable
              redemptions={redemptions}
              loading={redemptionsLoading}
              error={redemptionsError}
              filters={redemptionsFilter}
              setFilters={setRedemptionsFilter}
              currentPage={redemptionsCurrentPage}
              setCurrentPage={setRedemptionsCurrentPage}
              pageSize={redemptionsPageSize}
              totalCount={redemptionsTotalCount}
              users={users}
              rewards={rewards}
              onExport={exportToExcel}
            />
          )}

          {activeTab === 'history' && (
            <PointsHistory
              history={pointsHistory}
              loading={historyLoading}
              error={historyError}
              filterUserId={historyFilterUserId}
              setFilterUserId={setHistoryFilterUserId}
              filterType={historyFilterType}
              setFilterType={setHistoryFilterType}
              currentPage={historyCurrentPage}
              setCurrentPage={setHistoryCurrentPage}
              pageSize={historyPageSize}
              totalCount={historyTotalCount}
              users={users}
            />
          )}

          {activeTab === 'addPoints' && (
            <AddPointsForm
              users={users}
              addPointsUserId={addPointsUserId}
              setAddPointsUserId={setAddPointsUserId}
              addPointsValue={addPointsValue}
              setAddPointsValue={setAddPointsValue}
              addPointsReason={addPointsReason}
              setAddPointsReason={setAddPointsReason}
              loading={addPointsLoading}
              error={addPointsError}
              success={addPointsSuccess}
              onSubmit={handleAddPoints}
            />
          )}
        </div>
      </div>

      {/* Top Users */}
      <TopUsers topUsers={topUsers} loading={topUsersLoading} />

      {/* Modals */}
      <RewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        editReward={editReward}
        loading={modalLoading}
        error={modalError}
        success={modalSuccess}
        onSubmit={handleSaveReward}
        form={rewardForm}
        setForm={setRewardForm}
      />

      <DeleteRewardDialog
        isOpen={!!confirmDeleteRewardId}
        onClose={() => setConfirmDeleteRewardId(null)}
        onConfirm={() => {
          const id = confirmDeleteRewardId;
          setConfirmDeleteRewardId(null);
          if (id) handleDeleteReward(id);
        }}
        loading={loading}
      />

      {/* Success messages */}
      {deleteSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded shadow">
          {deleteSuccess}
        </div>
      )}

      <VideoTutorial 
        videoId="-v44li9Ho0w"
        title="إنشاء هدايا (Gifts) جديدة داخل النظام إضافة أو خصم النقاط لأي مستخدم بسهولة" 
        position="bottom-right"
        buttonText="شرح"
      />
    </div>
  );
};

export default AdminLoyalty;
