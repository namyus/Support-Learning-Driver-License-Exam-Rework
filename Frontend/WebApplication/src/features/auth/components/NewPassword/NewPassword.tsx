import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/images/logo.png";
import "./index.scss";

const NewPassword: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnToLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/dang-nhap");
  };

  return (
    <section className="new-password" aria-labelledby="new-password-heading">
      <form onSubmit={handleReturnToLogin} noValidate>
        <div className="new-password-header">
          <img
            src={logo}
            alt="Trung tâm đào tạo lái xe FDriving"
            className="new-password-logo"
          />
          <h1 id="new-password-heading" className="new-password__title">
            Đặt lại mật khẩu
          </h1>
          <p className="new-password__subtitle">
            Quy trình đặt lại mật khẩu trực tuyến hiện chưa được kết nối với hệ thống.
          </p>
        </div>

        <div className="rectangle-border">
          <div className="new-password-status-box" role="status" aria-live="polite">
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="new-password-status-icon"
              aria-hidden="true"
            />
            <div className="new-password-status-content">
              <h2 className="new-password-status-heading">
                Chức năng chưa được kích hoạt
              </h2>
              <p className="new-password-status-text">
                Để đảm bảo an toàn tài khoản học viên, việc thay đổi hoặc cấp lại mật khẩu hiện được thực hiện trực tiếp thông qua bộ phận hỗ trợ của trung tâm FDriving.
              </p>
            </div>
          </div>
        </div>

        <div className="new-password-actions">
          <button type="submit" className="new-password-submit-btn">
            Quay lại đăng nhập
          </button>
        </div>

        <div className="new-password-footer-links">
          <Link to="/" className="new-password-back-home-link">
            ← Quay về trang chủ
          </Link>
        </div>
      </form>
    </section>
  );
};

export default NewPassword;
