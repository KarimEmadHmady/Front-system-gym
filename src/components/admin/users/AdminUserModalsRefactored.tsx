import React, { useEffect } from 'react';
import type { AdminUserModalsProps } from './modals/types';
import {
  CreateUserModal,
  EditUserModal,
  ViewUserModal,
  RoleModal,
  DeleteModal,
  useUserModals,
} from './modals';

const AdminUserModalsRefactored: React.FC<AdminUserModalsProps> = (props) => {
  const {
    trainers,
    loadingTrainers,
    resolvedTrainerName,
    avatarFile,
    isAvatarUploading,
    avatarPreviewUrl,
    uploadSuccess,
    fileInputRef,
    loadTrainers,
    resolveTrainerName,
    updateAvatarPreview,
    setAvatarFile,
    setAvatarPreviewUrl,
    setIsAvatarUploading,
    setUploadSuccess,
  } = useUserModals();

  // Load trainers when any modal that needs them is open
  useEffect(() => {
    const needsTrainers = props.isEditOpen || props.isCreateOpen || props.isViewOpen;
    loadTrainers(needsTrainers);
  }, [props.isEditOpen, props.isCreateOpen, props.isViewOpen, loadTrainers]);

  // Update avatar preview when user or edit form changes
  useEffect(() => {
    updateAvatarPreview(props.viewUser, props.editForm);
  }, [props.viewUser, props.editForm, updateAvatarPreview]);

  // Resolve trainer name for View modal
  useEffect(() => {
    if (props.isViewOpen && props.viewUser) {
      resolveTrainerName(props.viewUser);
    }
  }, [props.isViewOpen, props.viewUser, resolveTrainerName]);

  return (
    <>
      {/* Create User Modal */}
      <CreateUserModal
        isOpen={props.isCreateOpen}
        onClose={() => props.setIsCreateOpen(false)}
        isSubmitting={props.isSubmitting}
        formError={props.formError}
        newUser={props.newUser}
        handleCreateChange={props.handleCreateChange}
        handleCreateSubmit={props.handleCreateSubmit}
        trainers={trainers}
        loadingTrainers={loadingTrainers}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        isAvatarUploading={isAvatarUploading}
        avatarPreviewUrl={avatarPreviewUrl}
        fileInputRef={fileInputRef}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={props.isEditOpen}
        onClose={() => props.setIsEditOpen(false)}
        isSubmitting={props.isEditSubmitting}
        editError={props.editError}
        editUser={props.editUser}
        editForm={props.editForm}
        handleEditChange={props.handleEditChange}
        handleEditSubmit={props.handleEditSubmit}
        trainers={trainers}
        loadingTrainers={loadingTrainers}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        isAvatarUploading={isAvatarUploading}
        setIsAvatarUploading={setIsAvatarUploading}
        avatarPreviewUrl={avatarPreviewUrl}
        setAvatarPreviewUrl={setAvatarPreviewUrl}
        fileInputRef={fileInputRef}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={props.isViewOpen}
        onClose={() => props.setIsViewOpen(false)}
        viewUser={props.viewUser}
        viewLoading={props.viewLoading}
        userViewFields={props.userViewFields}
        resolvedTrainerName={resolvedTrainerName}
        trainers={trainers}
      />

      {/* Role Modal */}
      <RoleModal
        isOpen={props.isRoleOpen}
        onClose={() => props.setIsRoleOpen(false)}
        roleUser={props.roleUser}
        roleForm={props.roleForm}
        setRoleForm={props.setRoleForm}
        roleError={props.roleError}
        isRoleSubmitting={props.isRoleSubmitting}
        handleRoleSubmit={props.handleRoleSubmit}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={props.isDeleteOpen}
        onClose={() => props.setIsDeleteOpen(false)}
        deleteType={props.deleteType}
        confirmDelete={props.confirmDelete}
        user={props.roleUser}
      />
    </>
  );
};

export default AdminUserModalsRefactored;
