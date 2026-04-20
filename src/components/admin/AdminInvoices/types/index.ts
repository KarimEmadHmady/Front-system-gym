export type CreateInvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

export type InvoiceFormData = {
  userId: string;
  amount: number;
  issueDate: string;
  dueDate?: string;
  status: "paid" | "pending" | "overdue";
  items: CreateInvoiceItem[];
  notes?: string;
  paidAmount?: number;
};

export type EditInvoiceFormData = InvoiceFormData & { _id?: string };