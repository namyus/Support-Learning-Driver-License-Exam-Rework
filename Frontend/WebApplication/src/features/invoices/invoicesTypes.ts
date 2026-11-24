export interface InvoiceRecord {
  invoiceId: number;
  staffName: string;
  memberName: string;
  courseId: string;
  invoiceTime: string;
  amountPaid: number;
}

export interface CreateInvoicePayload {
  staffId: number | string;
  memberId: number | string;
  amountPaid: number;
  amountInWords: string;
}

export interface InvoicesState {
  list: InvoiceRecord[];
  loading: {
    list: boolean;
    create: boolean;
  };
  errors: {
    list: string | null;
    create: string | null;
  };
}
