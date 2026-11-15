import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../../../AuthorizationPage/assets/images/logo.png";
import { faEye, faEyeSlash, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import "./index.scss";
import api from "../../../../../config/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface AuthenticatedUserPayload {
  userID?: number;
  username: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: boolean;
  roleId: number;
}

interface LoginServiceResult {
  isError?: boolean;
  payload?: AuthenticatedUserPayload | null;
  errorMessage?: string | null;
}

const getStoredUser = (): AuthenticatedUserPayload | null => {
  const rawUser = sessionStorage.getItem("loginedUser");
  if (!rawUser) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawUser);
    if (
      parsed &&
      typeof parsed === "object" &&
      "roleId" in parsed &&
      typeof (parsed as AuthenticatedUserPayload).roleId === "number"
    ) {
      return parsed as AuthenticatedUserPayload;
    }
    return null;
  } catch {
    return null;
  }
};

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!username.trim() || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }

    setIsSubmitting(true);
    let didLoginSucceed = false;

    try {
      const response = await api.post<LoginServiceResult>("login", null, {
        params: {
          username,
          password,
        },
      });

      const data = response?.data;

      if (response.status !== 200 || !data || typeof data !== "object") {
        toast.error("Phản hồi từ hệ thống không hợp lệ. Vui lòng thử lại sau!");
        return;
      }

      if (data.errorMessage === "User is not exist") {
        toast.error("Tên đăng nhập không có trong hệ thống. Vui lòng kiểm tra lại!");
        return;
      }

      if (data.errorMessage === "Password is not correct") {
        toast.error("Mật khẩu không đúng. Vui lòng nhập lại!");
        return;
      }

      if (data.isError === true || Boolean(data.errorMessage)) {
        toast.error("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin!");
        return;
      }

      if (
        data.isError === false &&
        data.payload &&
        typeof data.payload === "object" &&
        typeof data.payload.roleId === "number"
      ) {
        didLoginSucceed = true;
        sessionStorage.setItem("loginedUser", JSON.stringify(data.payload));
        localStorage.setItem(
          "loginSuccessNotify",
          "Đăng nhập thành công!"
        );
        location.reload();
        return;
      }

      toast.error("Không thể xác thực thông tin tài khoản. Vui lòng thử lại sau!");
    } catch {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    } finally {
      if (!didLoginSucceed) {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    const existingUser = getStoredUser();
    if (existingUser !== null) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <section className="login-form" aria-labelledby="login-heading">
      <form onSubmit={handleLogin} noValidate>
        <div className="login-header">
          <img src={logo} alt="Trung tâm đào tạo lái xe FDriving" className="login-logo" />
          <h1 id="login-heading" className="login-title">
            Đăng nhập
          </h1>
          <p className="login-subtitle">
            Chào mừng bạn quay trở lại hệ thống đào tạo lái xe FDriving
          </p>
        </div>

        <div className="rectangle-border">
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Tên đăng nhập
            </label>
            <div className="inputField">
              <FontAwesomeIcon icon={faUser} className="userIcon" aria-hidden="true" />
              <input
                id="login-username"
                name="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Mật khẩu
            </label>
            <div className="inputField">
              <FontAwesomeIcon icon={faLock} className="lockIcon" aria-hidden="true" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={showPassword}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="login-forgot-row">
            <Link to="/quen-mat-khau" className="login-forgot-link">
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <div className="login-buttons">
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>

        <div className="login-footer-links">
          <p className="login-register-prompt">
            Chưa có tài khoản?{" "}
            <Link to="/dang-ky" className="login-register-link">
              Đăng ký ngay
            </Link>
          </p>

          <Link to="/" className="login-back-home-link">
            ← Quay về trang chủ
          </Link>
        </div>
      </form>
    </section>
  );
};

export default LoginForm;

