import { createFeatureSlice } from '../shared/createFeatureSlice';

const feature = createFeatureSlice('classes');

export const { requestClasse, clearClasseRequest, clearClasseState } = {
  requestClasse: feature.request,
  clearClasseRequest: feature.clearFeatureRequest,
  clearClasseState: feature.clearFeatureState,
};

export default feature.reducer;
