import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiError, type ApiRejectedPayload } from '../shared/apiError';
import { membersApi } from './membersApi';
import type {
  CreateMemberPayload,
  MemberRecord,
  MembersState,
  UserRecord,
} from './membersTypes';

const initialState: MembersState = {
  list: [],
  users: [],
  currentMember: null,
  selectedMember: null,
  membersById: {},
  loading: {
    list: false,
    users: false,
    currentMember: false,
    selectedMember: false,
    createMember: false,
  },
  errors: {
    list: null,
    users: null,
    currentMember: null,
    selectedMember: null,
    createMember: null,
  },
};

export const fetchMembers = createAsyncThunk<
  MemberRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('members/fetchMembers', async (_, { rejectWithValue }) => {
  try {
    const response = await membersApi.getMembers();
    if (!Array.isArray(response.data)) {
      return rejectWithValue({ message: 'Invalid Members response' });
    }
    return response.data;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách thành viên. Vui lòng thử lại.')
    );
  }
});

export const fetchUsers = createAsyncThunk<
  UserRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('members/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await membersApi.getUsers();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách người dùng.')
    );
  }
});

export const fetchMemberByUserId = createAsyncThunk<
  MemberRecord | null,
  number | string,
  { rejectValue: ApiRejectedPayload }
>('members/fetchMemberByUserId', async (userId, { rejectWithValue }) => {
  try {
    const response = await membersApi.getMemberByUserId(userId);
    return response.data ?? null;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải thông tin thành viên.')
    );
  }
});

export const fetchMemberByUserIdQuery = createAsyncThunk<
  MemberRecord | null,
  number | string,
  { rejectValue: ApiRejectedPayload }
>('members/fetchMemberByUserIdQuery', async (userId, { rejectWithValue }) => {
  try {
    const response = await membersApi.getMemberByUserIdQuery(userId);
    return response.data ?? null;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải thông tin thành viên.')
    );
  }
});

export const fetchMemberById = createAsyncThunk<
  { memberId: string; member: MemberRecord | null },
  number | string,
  { rejectValue: ApiRejectedPayload }
>('members/fetchMemberById', async (memberId, { rejectWithValue }) => {
  try {
    const response = await membersApi.getMemberById(memberId);
    return {
      memberId: String(memberId),
      member: response.data ?? null,
    };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải chi tiết thành viên.')
    );
  }
});

export const createMember = createAsyncThunk<
  MemberRecord,
  CreateMemberPayload,
  { rejectValue: ApiRejectedPayload }
>('members/createMember', async (payload, { rejectWithValue }) => {
  try {
    const response = await membersApi.createMember(payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Đăng ký khóa học thất bại. Vui lòng thử lại.')
    );
  }
});

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearMemberErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearSelectedMember(state) {
      state.selectedMember = null;
      state.errors.selectedMember = null;
    },
    clearMemberState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchUsers.pending, (state) => {
        state.loading.users = true;
        state.errors.users = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading.users = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading.users = false;
        state.errors.users =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchMemberByUserId.pending, (state) => {
        state.loading.currentMember = true;
        state.errors.currentMember = null;
      })
      .addCase(fetchMemberByUserId.fulfilled, (state, action) => {
        state.loading.currentMember = false;
        state.currentMember = action.payload;
      })
      .addCase(fetchMemberByUserId.rejected, (state, action) => {
        state.loading.currentMember = false;
        state.errors.currentMember =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchMemberByUserIdQuery.pending, (state) => {
        state.loading.currentMember = true;
        state.errors.currentMember = null;
      })
      .addCase(fetchMemberByUserIdQuery.fulfilled, (state, action) => {
        state.loading.currentMember = false;
        if (action.payload) {
          state.currentMember = action.payload;
        }
      })
      .addCase(fetchMemberByUserIdQuery.rejected, (state, action) => {
        state.loading.currentMember = false;
        state.errors.currentMember =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchMemberById.pending, (state) => {
        state.loading.selectedMember = true;
        state.errors.selectedMember = null;
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.loading.selectedMember = false;
        state.selectedMember = action.payload.member;
        if (action.payload.member) {
          state.membersById[action.payload.memberId] = action.payload.member;
        }
      })
      .addCase(fetchMemberById.rejected, (state, action) => {
        state.loading.selectedMember = false;
        state.errors.selectedMember =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createMember.pending, (state) => {
        state.loading.createMember = true;
        state.errors.createMember = null;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.loading.createMember = false;
        state.currentMember = action.payload;
      })
      .addCase(createMember.rejected, (state, action) => {
        state.loading.createMember = false;
        state.errors.createMember =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearMemberErrors, clearSelectedMember, clearMemberState } =
  membersSlice.actions;

export const selectMembersState = (state: { members: MembersState }): MembersState =>
  state.members;
export const selectMembersList = (state: { members: MembersState }): MemberRecord[] =>
  state.members.list;
export const selectUsersList = (state: { members: MembersState }): UserRecord[] =>
  state.members.users;
export const selectCurrentMember = (state: {
  members: MembersState;
}): MemberRecord | null => state.members.currentMember;
export const selectSelectedMember = (state: {
  members: MembersState;
}): MemberRecord | null => state.members.selectedMember;
export const selectMembersLoading = (state: {
  members: MembersState;
}): MembersState['loading'] => state.members.loading;
export const selectMembersErrors = (state: {
  members: MembersState;
}): MembersState['errors'] => state.members.errors;

export default membersSlice.reducer;
