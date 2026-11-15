import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import api from "../../../../config/axios";
import { useAppDispatch, useAppSelector } from "../../../../app/store";
import {
  LOGINED_USER_STORAGE_KEY,
  LOGIN_SUCCESS_NOTIFY_STORAGE_KEY,
  selectCurrentUser,
  setAuthenticatedUser,
} from "../../store/authSlice";
import { LoginServiceResult } from "../../types/User";
import lock from "../../assets/images/lock.svg";
import logo from "../../assets/images/logo.png";
import userIcon from "../../assets/images/userblur.svg";
import "./index.scss";

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const extractBackendErrorMessage = (error: unknown): string | null => {
    const axiosError = error as AxiosError<LoginServiceResult | string>;
    const responseData = axiosError?.response?.data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData.trim();
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      Array.isArray(responseData.errors) &&
      responseData.errors.length > 0
    ) {
      const joinedErrors = responseData.errors.filter(Boolean).join(", ");
      if (joinedErrors.length > 0) {
        return joinedErrors;
      }
    }

    return null;
  };

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      toast.error("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<LoginServiceResult>("login", {
        username: trimmedUsername,
        password,
      });

      if (response.status === 200) {
        const data = response.data;
        if (data?.isError) {
          const message =
            Array.isArray(data.errors) && data.errors.length > 0
              ? data.errors.filter(Boolean).join(", ")
              : "Tên đăng nhập hoặc mật khẩu không hợp lệ.";
          toast.error(message);
          return;
        }

        if (data?.payload && typeof data.payload.roleId === "number") {
          sessionStorage.setItem(
            LOGINED_USER_STORAGE_KEY,
            JSON.stringify(data.payload)
          );
          localStorage.setItem(
            LOGIN_SUCCESS_NOTIFY_STORAGE_KEY,
            "Đăng nhập thành công!"
          );
          dispatch(setAuthenticatedUser(data.payload));
          location.reload();
        } else {
          toast.error("Dữ liệu tài khoản trả về không hợp lệ.");
        }
      }
    } catch (error) {
      const backendMessage = extractBackendErrorMessage(error);
      toast.error(
        backendMessage || "Tên đăng nhập hoặc mật khẩu không hợp lệ."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleLogin();
  };

  useEffect(() => {
    if (user !== null) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <section className="login-form-container" aria-labelledby="login-heading">
      <form onSubmit={handleSubmit} noValidate>
        <div className="login-header">
          <img
            src={logo}
            alt="Trung tâm đào tạo lái xe FDriving"
            className="login-logo"
          />
          <h1 id="login-heading" className="login-title">
            Đăng nhập hệ thống
          </h1>
          <p className="login-subtitle">
            Trung tâm đào tạo và sát hạch lái xe FDriving
          </p>
        </div>

        <div className="input-container">
          <div className="field-group">
            <label htmlFor="login-username" className="field-label">
              Tên đăng nhập
            </label>
            <div className="username">
              <img src={userIcon} alt="" aria-hidden="true" />
              <input
                id="login-username"
                type="text"
                value={username}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                disabled={isSubmitting}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="login-password" className="field-label">
              Mật khẩu
            </label>
            <div className="password">
              <img src={lock} alt="" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                disabled={isSubmitting}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-visibility-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="Checkbox_Forget">
          <Link to="/quen-mat-khau" className="Forgot">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="Container-button">
          <button type="submit" className="Login" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>

        <div className="line-3" role="separator" aria-hidden="true">
          <span>Hoặc</span>
        </div>

        <div className="auth-footer-links">
          <p className="register-prompt">
            Chưa có tài khoản?{" "}
            <Link to="/dang-ky" className="register-link">
              Đăng ký ngay
            </Link>
          </p>
          <Link to="/" className="back-home-link">
            ← Quay về trang chủ
          </Link>
        </div>
      </form>
    </section>
  );
};

export default LoginForm;
