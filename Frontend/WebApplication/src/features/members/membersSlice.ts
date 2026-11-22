import { createFeatureSlice } from '../shared/createFeatureSlice';

const feature = createFeatureSlice('members');

export const { requestMember, clearMemberRequest, clearMemberState } = {
  requestMember: feature.request,
  clearMemberRequest: feature.clearFeatureRequest,
  clearMemberState: feature.clearFeatureState,
};

export default feature.reducer;
