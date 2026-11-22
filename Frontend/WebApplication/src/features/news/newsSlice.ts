import { createFeatureSlice } from '../shared/createFeatureSlice';

const feature = createFeatureSlice('news');

export const { requestNew, clearNewRequest, clearNewState } = {
  requestNew: feature.request,
  clearNewRequest: feature.clearFeatureRequest,
  clearNewState: feature.clearFeatureState,
};

export default feature.reducer;
