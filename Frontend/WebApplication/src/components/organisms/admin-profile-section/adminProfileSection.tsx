import React, { useCallback, useEffect, useState } from "react";
import './admin-profile-section.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faShieldHalved,
  faUserCircle,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import api from '../../../config/axios';

interface StoredSessionUser {
  username?: string;
  roleId?: number;
  fullName?: string;
  email?: string;
  phone?: string;
}

interface ApiUserRecord {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
}

const getSessionUser = (): StoredSessionUser | null => {
  try {
    const raw = sessionStorage.getItem("loginedUser");
    return raw ? (JSON.parse(raw) as StoredSessionUser) : null;
  } catch {
    return null;
  }
};

const UserInformation: React.FC = () => {
  const sessionUser = getSessionUser();
  const username = sessionUser?.username?.trim() ?? "";
  const roleId = sessionUser?.roleId ?? null;

  const [userData, setUserData] = useState({
    fullName: sessionUser?.fullName ?? "",
    email: sessionUser?.email ?? "",
    phone: sessionUser?.phone ?? "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const fetchUserData = useCallback(async () => {
    if (!username || roleId !== 1) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);

    try {
      const response = await api.get("Users");
      const data: ApiUserRecord[] = Array.isArray(response.data)
        ? response.data
        : [];

      const matchingUser = data.find(
        (apiUser) => apiUser.username === username
      );

      if (matchingUser) {
        setUserData({
          fullName: matchingUser.fullName ?? "",
          email: matchingUser.email ?? "",
          phone: matchingUser.phone ?? "",
        });
      } else {
        setIsNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      setErrorMessage(
        "Không thể tải thông tin hồ sơ quản trị viên từ máy chủ. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }, [username, roleId]);

  useEffect(() => {
    void fetchUserData();
  }, [fetchUserData]);

  return (
    <section className="body admin-profile-page" aria-label="Hồ sơ cá nhân quản trị viên">
      <div className="user-information">
        <div className="profile-page-header">
          <div>
            <span className="profile-badge">Tài khoản hệ thống</span>
            <h2 className="profile-title">Hồ sơ cá nhân</h2>
            <p className="profile-subtitle">
              Thông tin định danh và liên hệ của quản trị viên FDriving
            </p>
          </div>
          {username && (
            <span className="profile-role-pill">
              <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" />
              <span>Quản trị viên ({username})</span>
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="profile-status-banner profile-status-banner--error" role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              className="profile-retry-btn"
              onClick={() => void fetchUserData()}
            >
              Thử lại
            </button>
          </div>
        )}

        {!errorMessage && isNotFound && (
          <div className="profile-status-banner profile-status-banner--warning" role="status">
            <span>Không tìm thấy dữ liệu chi tiết cho tài khoản &ldquo;{username}&rdquo;.</span>
          </div>
        )}

        <div className="profile">
          <div className="profile-img">
            <div className="profile-avatar-circle">
              <FontAwesomeIcon icon={faUserCircle} className="icon" aria-hidden="true" />
            </div>
            <span className="profile-status-tag">Đang hoạt động</span>
          </div>

          <div className="contain">
            {isLoading ? (
              <div className="profile-loading-state" role="status" aria-live="polite">
                <div className="profile-skeleton-line" />
                <div className="profile-skeleton-line" />
                <div className="profile-skeleton-line" />
              </div>
            ) : (
              <>
                <div className="profile-field-row">
                  <span className="profile-field-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faUserTie} />
                  </span>
                  <p className="line_content">
                    <strong className="information_content">Họ và tên (Fullname):</strong>
                    <span className="profile-field-value">
                      {userData.fullName || "Chưa cập nhật"}
                    </span>
                  </p>
                </div>

                <div className="profile-field-row">
                  <span className="profile-field-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <p className="line_content">
                    <strong className="information_content">Email:</strong>
                    <span className="profile-field-value">
                      {userData.email || "Chưa cập nhật"}
                    </span>
                  </p>
                </div>

                <div className="profile-field-row">
                  <span className="profile-field-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faPhone} />
                  </span>
                  <p className="line_content">
                    <strong className="information_content">Số điện thoại (Phone):</strong>
                    <span className="profile-field-value">
                      {userData.phone || "Chưa cập nhật"}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="Description">
          <FontAwesomeIcon icon={faShieldHalved} className="description-icon" aria-hidden="true" />
          <p className="line_description">
            Một số thông tin quan trọng sẽ được ẩn đi bớt
          </p>
        </div>
      </div>
    </section>
  );
};

export default UserInformation;
