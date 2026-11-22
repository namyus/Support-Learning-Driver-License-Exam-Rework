import { createFeatureSlice } from '../shared/createFeatureSlice';

const feature = createFeatureSlice('exams');

export const { requestExam, clearExamRequest, clearExamState } = {
  requestExam: feature.request,
  clearExamRequest: feature.clearFeatureRequest,
  clearExamState: feature.clearFeatureState,
};

export default feature.reducer;
