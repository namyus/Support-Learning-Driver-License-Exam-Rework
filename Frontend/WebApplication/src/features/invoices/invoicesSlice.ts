import { createFeatureSlice } from '../shared/createFeatureSlice';

const feature = createFeatureSlice('invoices');

export const { requestInvoice, clearInvoiceRequest, clearInvoiceState } = {
  requestInvoice: feature.request,
  clearInvoiceRequest: feature.clearFeatureRequest,
  clearInvoiceState: feature.clearFeatureState,
};

export default feature.reducer;
