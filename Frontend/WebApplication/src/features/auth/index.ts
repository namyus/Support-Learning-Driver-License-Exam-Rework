export { default as LoginPage } from "./pages/LoginPage/LoginPage";
export { default as RegistrationPage } from "./pages/RegistrationPage/RegistrationPage";
export { default as ForgetPasswordPage } from "./pages/ForgetpasswordPage/ForgetPasswordPage";
export { default as NewpasswordPage } from "./pages/NewpasswordPage/NewpasswordPage";

export { default as LoginForm } from "./components/LoginForm/LoginForm";
export { default as RegistrationForm } from "./components/RegisterForm/RegistrationForm";
export { default as ForgetPassword } from "./components/ForgetPassword/ForgetPassword";
export { default as NewPassword } from "./components/NewPassword/NewPassword";

export {
  default as authReducer,
  setAuthenticatedUser,
  clearAuthenticatedUser,
  syncAuthFromSession,
  selectAuthState,
  selectCurrentUser,
  selectIsAuthenticated,
  getStoredAuthUser,
  sanitizeAuthUser,
  LOGINED_USER_STORAGE_KEY,
  LOGIN_SUCCESS_NOTIFY_STORAGE_KEY,
} from "./store/authSlice";

export type { AuthState } from "./store/authSlice";
export type {
  User,
  AuthenticatedUserPayload,
  LoginServiceResult,
} from "./types/User";
