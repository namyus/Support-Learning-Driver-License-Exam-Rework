import { createFeatureSlice } from '../shared/createFeatureSlice';

const feature = createFeatureSlice('mentors');

export const { requestMentor, clearMentorRequest, clearMentorState } = {
  requestMentor: feature.request,
  clearMentorRequest: feature.clearFeatureRequest,
  clearMentorState: feature.clearFeatureState,
};

export default feature.reducer;
