import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import api from "../../../../config/axios";
import emailIcon from "../../assets/images/gmail logo.svg";
import lock from "../../assets/images/lock.svg";
import logo from "../../assets/images/logo.png";
import user from "../../assets/images/userblur.svg";
import "./index.scss";

interface RegisterServiceResult {
  isError?: boolean;
  payload?: unknown;
  errors?: string[];
}

const RegistrationForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const checkValidation = (): boolean => {
    const trimmedUsername = username.trim();
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedUsername) {
      toast.error("Tên đăng nhập không được để trống.");
      return false;
    }

    if (trimmedUsername.length < 3) {
      toast.error("Tên đăng nhập phải có ít nhất 3 ký tự.");
      return false;
    }

    if (!password || password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return false;
    }

    if (!trimmedFullName) {
      toast.error("Họ và tên không được để trống.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      toast.error("Địa chỉ email không hợp lệ.");
      return false;
    }

    const phoneRegex = /^\d{10,11}$/;
    if (!trimmedPhone || !phoneRegex.test(trimmedPhone)) {
      toast.error("Số điện thoại phải gồm 10 đến 11 chữ số.");
      return false;
    }

    return true;
  };

  const extractBackendErrorMessage = (error: unknown): string | null => {
    const axiosError = error as AxiosError<
      RegisterServiceResult | { errors?: Record<string, string[]> | string[] } | string
    >;
    const responseData = axiosError?.response?.data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData.trim();
    }

    if (responseData && typeof responseData === "object") {
      if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const joined = responseData.errors.filter(Boolean).join(", ");
        if (joined.length > 0) {
          return joined;
        }
      } else if (
        responseData.errors &&
        typeof responseData.errors === "object"
      ) {
        const validationMessages = Object.values(responseData.errors)
          .flat()
          .filter(Boolean)
          .join(", ");
        if (validationMessages.length > 0) {
          return validationMessages;
        }
      }
    }

    return null;
  };

  const handleRegistration = async () => {
    if (isSubmitting) {
      return;
    }

    if (!checkValidation()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<RegisterServiceResult>("User/Register", {
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status: true,
        roleId: 4,
      });

      const data = response.data;
      if (data?.isError) {
        const errorMessage =
          Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors.filter(Boolean).join(", ")
            : "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
        toast.error(errorMessage);
        return;
      }

      toast.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      navigate("/dang-nhap");
    } catch (error) {
      const backendMessage = extractBackendErrorMessage(error);
      toast.error(
        backendMessage || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleRegistration();
  };

  return (
    <section
      className="registration-form-container"
      aria-labelledby="register-heading"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="register-header">
          <img
            src={logo}
            alt="Trung tâm đào tạo lái xe FDriving"
            className="register-logo"
          />
          <h1 id="register-heading" className="register-title">
            Đăng ký tài khoản học viên
          </h1>
          <p className="register-subtitle">
            Tạo tài khoản để đăng ký khóa học và ôn luyện sát hạch lái xe
          </p>
        </div>

        <div className="input-container">
          <div className="field-group">
            <label htmlFor="register-username" className="field-label">
              Tên đăng nhập
            </label>
            <div className="username">
              <img src={user} alt="" aria-hidden="true" />
              <input
                id="register-username"
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
            <label htmlFor="register-password" className="field-label">
              Mật khẩu
            </label>
            <div className="password">
              <img src={lock} alt="" aria-hidden="true" />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
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

          <div className="field-group">
            <label htmlFor="register-fullname" className="field-label">
              Họ và tên
            </label>
            <div className="name">
              <img src={user} alt="" aria-hidden="true" />
              <input
                id="register-fullname"
                type="text"
                value={fullName}
                placeholder="Nhập họ và tên đầy đủ"
                autoComplete="name"
                disabled={isSubmitting}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="register-email" className="field-label">
              Email
            </label>
            <div className="email">
              <img src={emailIcon} alt="" aria-hidden="true" />
              <input
                id="register-email"
                type="email"
                value={email}
                placeholder="vidu@email.com"
                autoComplete="email"
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="register-phone" className="field-label">
              Số điện thoại
            </label>
            <div className="phone">
              <img src={user} alt="" aria-hidden="true" />
              <input
                id="register-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                placeholder="Nhập số điện thoại (10–11 số)"
                autoComplete="tel"
                disabled={isSubmitting}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="Register">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </div>

        <div className="line-3" role="separator" aria-hidden="true">
          <span>Hoặc</span>
        </div>

        <div className="auth-footer-links">
          <p className="login-prompt">
            Đã có tài khoản?{" "}
            <Link to="/dang-nhap" className="login-link">
              Đăng nhập ngay
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

export default RegistrationForm;
