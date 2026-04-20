'use client';

import React, { useState } from 'react';
import VideoTutorial from '../../VideoTutorial';
import AdminUsersTableHeader from './AdminUsersTableHeader';
import AdminUsersTableList from './AdminUsersTableList';
import AdminUsersTablePagination from './AdminUsersTablePagination';
import AdminUserModalsRefactored from './AdminUserModalsRefactored';
import { useAdminUsers } from './hooks/useAdminUsers';
import { useUserActions } from './hooks/useUserActions';

const AdminUsersTableRefactored = () => {
  // Main data and state management
  const {
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    currentPage,
    setCurrentPage,
    loading,
    listError,
    refresh,
    setRefresh,
    users,
    totalUsers,
    totalPages,
    safeUsers,
    hasPermission,
    currentUser,
    PAGE_SIZE,
    getRoleText,
    getRoleColor,
    getStatusColor,
    getSubscriptionColor,
  } = useAdminUsers();

  // Search state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [useServerSearch, setUseServerSearch] = useState(false);

  // Handle search results from header
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    setUseServerSearch(results.length > 0);
  };

  // Handle search loading state
  const handleSearchLoading = (loading: boolean) => {
    setIsSearchLoading(loading);
  };

  // Get display users (either search results or regular users)
  const displayUsers = useServerSearch ? searchResults : safeUsers;

  // User actions (CRUD operations)
  const userActions = useUserActions(() => setRefresh(r => !r), (loading: boolean) => {
    // This would need to be connected to the loading state
    // For now, we'll handle loading in the main hook
  });

  // userViewFields (all fields from User Schema)
  const userViewFields: { key: string; label: string; type?: 'object' }[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'phone', label: 'Phone' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'avatarUrl', label: 'Avatar URL' },
    { key: 'address', label: 'Address' },
    { key: 'balance', label: 'Balance' },
    { key: 'status', label: 'Status' },
    { key: 'isEmailVerified', label: 'Email Verified' },
    { key: 'emailVerificationToken', label: 'Email Verification Token' },
    { key: 'failedLoginAttempts', label: 'Failed Login Attempts' },
    { key: 'lockUntil', label: 'Lock Until' },
    { key: 'isDeleted', label: 'Deleted?' },
    { key: 'subscriptionStartDate', label: 'Subscription Start Date' },
    { key: 'subscriptionEndDate', label: 'Subscription End Date' },
    { key: 'subscriptionFreezeDays', label: 'Subscription Freeze Days' },
    { key: 'subscriptionFreezeUsed', label: 'Subscription Freeze Used' },
    { key: 'subscriptionStatus', label: 'Subscription Status' },
    { key: 'subscriptionRenewalReminderSent', label: 'Renewal Reminder Sent' },
    { key: 'lastPaymentDate', label: 'Last Payment Date' },
    { key: 'nextPaymentDueDate', label: 'Next Payment Due Date' },
    { key: 'loyaltyPoints', label: 'Loyalty Points' },
    { key: 'membershipLevel', label: 'Membership Level' },
    { key: 'goals', label: 'Goals', type: 'object' },
    { key: 'trainerId', label: 'Trainer ID' },
    { key: 'metadata', label: 'Metadata', type: 'object' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Last Updated' },
    { key: 'barcode', label: 'Membership Barcode' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <VideoTutorial 
        videoId="WHeSQMRiUjU" 
        title="User Management in Gym System - Create, Edit, Delete + Barcode Assignment and Subscription Expiration Alerts"
        position="bottom-right"
        buttonText="شرح"
      />
      
      <AdminUsersTableHeader
        searchTerm={searchTerm}
        setSearchTerm={(v: string) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        filterRole={filterRole}
        setFilterRole={(v: string) => {
          setFilterRole(v);
          setCurrentPage(1);
        }}
        onOpenCreate={userActions.openCreate}
        onExportData={() => userActions.exportToExcel(safeUsers, getRoleText)}
        onSearchResults={handleSearchResults}
        onSearchLoading={handleSearchLoading}
      />
      
      <AdminUsersTableList
        users={displayUsers}
        loading={loading || isSearchLoading}
        error={listError}
        openViewUser={(id) => userActions.openViewUser(id, displayUsers)}
        canEdit={hasPermission('users:write')}
        canChangeRole={hasPermission('users:write')}
        canDelete={hasPermission('users:delete')}
        canHardDelete={currentUser?.role === 'admin' || currentUser?.role === 'manager'}
        handleEdit={(id) => userActions.handleEdit(id, users)}
        handleChangeRole={(id, currentRole) => userActions.handleChangeRole(id, currentRole, users)}
        openDeleteModal={userActions.openDeleteModal}
        getRoleText={getRoleText}
        getRoleColor={getRoleColor}
        getStatusColor={getStatusColor}
        getSubscriptionColor={getSubscriptionColor}
      />
      
      <AdminUsersTablePagination
        currentPage={currentPage}
        setCurrentPage={(p) => {
          const next = Math.max(1, Math.min(totalPages || 1, p));
          setCurrentPage(next);
        }}
        PAGE_SIZE={PAGE_SIZE}
        totalUsers={totalUsers}
        loading={loading}
      />
      
      <AdminUserModalsRefactored
        isCreateOpen={userActions.isCreateOpen}
        setIsCreateOpen={userActions.setIsCreateOpen}
        isSubmitting={userActions.isSubmitting}
        formError={userActions.formError}
        newUser={userActions.newUser}
        handleCreateChange={userActions.handleCreateChange}
        handleCreateSubmit={userActions.handleCreateSubmit}
        isRoleOpen={userActions.isRoleOpen}
        roleUser={userActions.roleUser}
        roleForm={userActions.roleForm}
        setRoleForm={userActions.setRoleForm}
        roleError={userActions.roleError}
        isRoleSubmitting={userActions.isRoleSubmitting}
        setIsRoleOpen={userActions.setIsRoleOpen}
        handleRoleSubmit={userActions.handleRoleSubmit}
        isEditOpen={userActions.isEditOpen}
        editUser={userActions.editUser}
        editForm={userActions.editForm}
        handleEditChange={userActions.handleEditChange}
        handleEditSubmit={userActions.handleEditSubmit}
        isEditSubmitting={userActions.isEditSubmitting}
        editError={userActions.editError}
        setIsEditOpen={userActions.setIsEditOpen}
        isDeleteOpen={userActions.isDeleteOpen}
        setIsDeleteOpen={userActions.setIsDeleteOpen}
        deleteType={userActions.deleteType}
        confirmDelete={userActions.confirmDelete}
        isViewOpen={userActions.isViewOpen}
        setIsViewOpen={userActions.setIsViewOpen}
        viewUser={userActions.viewUser}
        viewLoading={userActions.viewLoading}
        userViewFields={userViewFields}
      />
    </div>
  );
};

export default AdminUsersTableRefactored;
