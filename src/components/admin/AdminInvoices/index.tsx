"use client";

import React, { useState } from "react";
import type { Invoice } from "@/services/invoiceService";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import CustomAlert from "@/components/ui/CustomAlert";
import { useCustomAlert } from "@/hooks/useCustomAlert";

import { useInvoices } from "./hooks/useInvoices";
import { useGymSettings } from "./hooks/useGymSettings";
import { printInvoice } from "./utils/printInvoice";

import InvoiceFilters from "./components/InvoiceFilters";
import InvoiceSummaryCards from "./components/InvoiceSummaryCards";
import InvoicesTable from "./components/InvoicesTable";
import CreateInvoiceModal from "./components/CreateInvoiceModal";
import ViewInvoiceModal from "./components/ViewInvoiceModal";
import EditInvoiceModal from "./components/EditInvoiceModal";

const AdminInvoices: React.FC = () => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const { logoUrl, gymName } = useGymSettings();

  const {
    filters, loading, invoices, count, summary, users, userMap,
    updatingId, creating, fmt,
    currentPage, totalPages, rangeStart, rangeEnd, canPaginate,
    fetchData, onChangeFilter, goNextPage, goPrevPage,
    createInvoice, updateInvoice, markPaid, deleteInvoice, exportToExcel,
  } = useInvoices(showSuccess, showError, showWarning);

  // ── modal state ──────────────────────────────────────────────────────────────
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const openView = (inv: Invoice) => { setSelectedInvoice(inv); setViewOpen(true); };
  const closeView = () => { setViewOpen(false); setSelectedInvoice(null); };

  const openEdit = (inv: Invoice) => { setSelectedInvoice(inv); setEditOpen(true); };
  const closeEdit = () => setEditOpen(false);

  const handleEdit = async (form: any) => {
    const ok = await updateInvoice(form);
    if (ok) { closeEdit(); closeView(); }
    return ok;
  };

  const handleDeleteRequest = (id: string) => { setDeleteTargetId(id); setDeleteDialogOpen(true); };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    closeView();
    await deleteInvoice(deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">

      <InvoiceFilters
        filters={filters}
        users={users}
        loading={loading}
        invoicesCount={invoices.length}
        onChangeFilter={onChangeFilter}
        onRefresh={fetchData}
        onExport={exportToExcel}
      />

      <InvoiceSummaryCards
        summary={summary}
        count={count}
        invoices={invoices}
        filters={filters}
        fmt={fmt}
      />

      {/* Create button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-center">
          <button
            onClick={() => setCreateOpen(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
          >
            إنشاء فاتورة جديدة
          </button>
        </div>
      </div>

      <InvoicesTable
        invoices={invoices}
        loading={loading}
        userMap={userMap}
        updatingId={updatingId}
        currentPage={currentPage}
        totalPages={totalPages}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        count={count}
        canPaginate={canPaginate}
        fmt={fmt}
        onView={openView}
        onMarkPaid={markPaid}
        onNextPage={goNextPage}
        onPrevPage={goPrevPage}
      />

      {/* Modals */}
      <CreateInvoiceModal
        open={createOpen}
        users={users}
        creating={creating}
        fmt={fmt}
        onClose={() => setCreateOpen(false)}
        onSubmit={createInvoice}
      />

      <ViewInvoiceModal
        open={viewOpen}
        invoice={selectedInvoice}
        userMap={userMap}
        updatingId={updatingId}
        fmt={fmt}
        onClose={closeView}
        onEdit={openEdit}
        onDelete={handleDeleteRequest}
        onPrint={(inv) => printInvoice(inv, userMap, logoUrl, gymName)}
      />

      <EditInvoiceModal
        open={editOpen}
        invoice={selectedInvoice}
        users={users}
        updatingId={updatingId}
        fmt={fmt}
        onClose={closeEdit}
        onSubmit={handleEdit}
      />

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTargetId(null); }}
        onConfirm={confirmDelete}
        title="تأكيد حذف الفاتورة"
        message="هل أنت متأكد أنك تريد حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف نهائي"
        cancelText="إلغاء"
        type="danger"
        isLoading={!!updatingId}
      />

      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />
    </div>
  );
};

export default AdminInvoices;