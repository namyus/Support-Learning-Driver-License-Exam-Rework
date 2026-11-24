import api from '../../config/axios';
import type { CreateInvoicePayload, InvoiceRecord } from './invoicesTypes';

export const invoicesApi = {
  getInvoices() {
    return api.get<InvoiceRecord[]>('Invoice/list');
  },

  createInvoice(payload: CreateInvoicePayload) {
    return api.post('Invoice/create', payload);
  },
};
