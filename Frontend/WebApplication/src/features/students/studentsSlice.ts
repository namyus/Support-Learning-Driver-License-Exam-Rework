import { createFeatureSlice } from '../shared/createFeatureSlice';

const feature = createFeatureSlice('students');

export const { requestStudent, clearStudentRequest, clearStudentState } = {
  requestStudent: feature.request,
  clearStudentRequest: feature.clearFeatureRequest,
  clearStudentState: feature.clearFeatureState,
};

export default feature.reducer;
