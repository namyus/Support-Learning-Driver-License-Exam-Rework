import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import BrandLogo from "../../atoms/brand-logo/brandLogo";
import "./forget-password-form.scss";

const ForgetPassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="forget-password" aria-labelledby="forget-password-heading">
      <div className="forget-header">
        <BrandLogo
          alt="Trung tâm đào tạo lái xe FDriving"
          className="forget-logo"
        />
        <h1 id="forget-password-heading" className="forget-password__title">
          Quên mật khẩu?
        </h1>
        <p className="forget-password__subtitle">
          Chức năng khôi phục mật khẩu hiện chưa được hỗ trợ. Vui lòng liên hệ trung tâm để được hỗ trợ.
        </p>
      </div>

      <div className="rectangle-border">
        <div className="forget-status-box" role="status" aria-live="polite">
          <FontAwesomeIcon
            icon={faCircleInfo}
            className="forget-status-icon"
            aria-hidden="true"
          />
          <div className="forget-status-content">
            <h2 className="forget-status-heading">Chức năng chưa được phát triển</h2>
            <p className="forget-status-text">
              Hệ thống hiện chưa cung cấp tính năng tự đặt lại mật khẩu trực tuyến. Học viên cần cấp lại mật khẩu vui lòng liên hệ trực tiếp bộ phận quản lý đào tạo của FDriving.
            </p>
          </div>
        </div>
      </div>

      <div className="forget-buttons">
        <button
          type="button"
          className="forget-submit-btn"
          onClick={() => navigate("/dang-nhap")}
        >
          Quay lại đăng nhập
        </button>
      </div>

      <div className="forget-footer-links">
        <Link to="/" className="forget-back-home-link">
          ← Quay về trang chủ
        </Link>
      </div>
    </section>
  );
};

export default ForgetPassword;