import { createFeatureSlice } from '../shared/createFeatureSlice';

const feature = createFeatureSlice('staff');

export const { requestStaff, clearStaffRequest, clearStaffState } = {
  requestStaff: feature.request,
  clearStaffRequest: feature.clearFeatureRequest,
  clearStaffState: feature.clearFeatureState,
};

export default feature.reducer;
