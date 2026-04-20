'use client';

import React from 'react';
import VideoTutorial from '../../VideoTutorial';
import {
  useAttendance,
  AttendanceHeader,
  AttendanceTable,
  AttendanceModal,
  DeleteConfirmation,
} from './index';

const AdminAttendanceRefactored: React.FC = () => {
  const {
    // State
    records,
    userMap,
    filteredRecords,
    paginatedRecords,
    startIndex,
    endIndex,
    totalRecords,
    totalPages,
    currentPage,
    loading,
    error,
    deletingId,
    confirmOpen,
    editModalOpen,
    editForm,
    saving,
    addModalOpen,
    addForm,
    adding,
    searchQuery,
    addUserQuery,
    usersForSelect,
    filteredAddUsers,
    
    // Actions
    actions,
    
    // Methods
    handleDelete,
    confirmDelete,
    openEditModal,
    handleEditSave,
    openAddModal,
    handleAddSave,
    handleExportToExcel,
  } = useAttendance();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <VideoTutorial 
        videoId="3twvHJa2A6k"
        title="Track member and trainer attendance easily" 
        position="bottom-right"
        buttonText="Tutorial"
      />
      
      <AttendanceHeader
        searchQuery={searchQuery}
        setSearchQuery={actions.setSearchQuery}
        onExportToExcel={handleExportToExcel}
        onOpenAddModal={openAddModal}
        filteredRecordsCount={filteredRecords.length}
      />

      <AttendanceTable
        records={paginatedRecords}
        userMap={userMap}
        loading={loading}
        error={error}
        onEdit={openEditModal}
        onDelete={handleDelete}
        deletingId={deletingId}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={totalRecords}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={actions.setCurrentPage}
      />

      <AttendanceModal
        isOpen={editModalOpen}
        onClose={() => actions.setEditModalOpen(false)}
        mode="edit"
        form={editForm}
        setForm={actions.setEditForm}
        users={usersForSelect}
        addUserQuery=""
        setAddUserQuery={() => {}} // Not needed for edit mode
        onSubmit={handleEditSave}
        loading={saving}
        title="Edit Attendance Record"
      />

      <AttendanceModal
        isOpen={addModalOpen}
        onClose={() => actions.setAddModalOpen(false)}
        mode="add"
        form={addForm}
        setForm={actions.setAddForm}
        users={filteredAddUsers}
        addUserQuery={addUserQuery}
        setAddUserQuery={actions.setAddUserQuery}
        onSubmit={handleAddSave}
        loading={adding}
        title="Add Attendance Record"
      />

      <DeleteConfirmation
        isOpen={confirmOpen}
        onClose={() => {
          actions.setConfirmOpen(false);
          actions.setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
        loading={!!deletingId}
      />
    </div>
  );
};

export default AdminAttendanceRefactored;
