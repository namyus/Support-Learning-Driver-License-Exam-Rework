import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthenticatedUserPayload } from "../types/User";

export const LOGINED_USER_STORAGE_KEY = "loginedUser";
export const LOGIN_SUCCESS_NOTIFY_STORAGE_KEY = "loginSuccessNotify";

export interface AuthState {
  user: AuthenticatedUserPayload | null;
  isAuthenticated: boolean;
}

export const sanitizeAuthUser = (
  raw: unknown
): AuthenticatedUserPayload | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.roleId !== "number") {
    return null;
  }

  const sanitized: AuthenticatedUserPayload = {
    username: typeof candidate.username === "string" ? candidate.username : "",
    roleId: candidate.roleId,
  };

  if (typeof candidate.userID === "number") {
    sanitized.userID = candidate.userID;
  }
  if (typeof candidate.fullName === "string") {
    sanitized.fullName = candidate.fullName;
  } else if (candidate.fullName === null) {
    sanitized.fullName = null;
  }
  if (typeof candidate.email === "string") {
    sanitized.email = candidate.email;
  } else if (candidate.email === null) {
    sanitized.email = null;
  }
  if (typeof candidate.phone === "string") {
    sanitized.phone = candidate.phone;
  } else if (candidate.phone === null) {
    sanitized.phone = null;
  }
  if (typeof candidate.status === "boolean") {
    sanitized.status = candidate.status;
  }

  return sanitized;
};

export const getStoredAuthUser = (): AuthenticatedUserPayload | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = sessionStorage.getItem(LOGINED_USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawUser);
    return sanitizeAuthUser(parsed);
  } catch {
    return null;
  }
};

const initialUser = getStoredAuthUser();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: initialUser !== null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticatedUser: (
      state,
      action: PayloadAction<AuthenticatedUserPayload>
    ) => {
      const sanitized = sanitizeAuthUser(action.payload);
      state.user = sanitized;
      state.isAuthenticated = sanitized !== null;
    },
    clearAuthenticatedUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(LOGINED_USER_STORAGE_KEY);
      }
    },
    syncAuthFromSession: (state) => {
      const storedUser = getStoredAuthUser();
      state.user = storedUser;
      state.isAuthenticated = storedUser !== null;
    },
  },
});

export const {
  setAuthenticatedUser,
  clearAuthenticatedUser,
  syncAuthFromSession,
} = authSlice.actions;

export const selectAuthState = (state: { auth: AuthState }): AuthState =>
  state.auth;
export const selectCurrentUser = (state: {
  auth: AuthState;
}): AuthenticatedUserPayload | null => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.isAuthenticated;

export default authSlice.reducer;
