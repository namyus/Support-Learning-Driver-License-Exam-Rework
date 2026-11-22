import { Link } from 'react-router-dom';
import './member-mentor-information.scss';
import MemberImg from '../../../../assets/imgs/member/member_img.png';

function MentorInformation() {
  return (
    <section
      className="mentor-info-conatiner mh-mentor-info-section"
      aria-labelledby="mh-mentor-info-heading"
    >
      <div className="mh-mentor-info-header">
        <div className="mh-mentor-info-breadcrumb">
          <Link to="/khoa-hoc-cua-ban" className="mh-mentor-back-link">
            ← Quay lại khoá học của bạn
          </Link>
        </div>
        <h1
          id="mh-mentor-info-heading"
          className="main-title mh-section-title"
        >
          Thông tin giáo viên
        </h1>
      </div>

      <div className="mh-mentor-notice" role="status">
        Thông tin hiển thị dưới đây là dữ liệu mẫu hiện có của trang (chưa kết
        nối API hồ sơ giảng viên trực tiếp).
      </div>

      <div className="info-content mh-mentor-layout">
        <aside className="mh-mentor-summary-card">
          <div className="mentor-img mh-mentor-avatar">
            <img src={MemberImg} alt="Hình ảnh giáo viên" />
          </div>
          <h2 className="mh-mentor-name">Nguyễn Văn A</h2>
          <span className="mh-mentor-badge">Mã giảng viên: MT001</span>
        </aside>

        <div className="mentor-info mh-mentor-details-card">
          <h3 className="mh-mentor-group-title">Hồ sơ giảng viên</h3>
          <dl className="mh-mentor-grid">
            <div className="mh-mentor-field">
              <dt>Họ và tên</dt>
              <dd>Nguyễn Văn A</dd>
            </div>
            <div className="mh-mentor-field">
              <dt>Giới tính</dt>
              <dd>Nam</dd>
            </div>
            <div className="mh-mentor-field">
              <dt>Điện thoại di động</dt>
              <dd>012344556</dd>
            </div>
            <div className="mh-mentor-field">
              <dt>Email</dt>
              <dd>nguyenvana@gmail.com</dd>
            </div>
            <div className="mh-mentor-field">
              <dt>Mã số giảng viên</dt>
              <dd>MT001</dd>
            </div>
            <div className="mh-mentor-field">
              <dt>Khoá học phụ trách</dt>
              <dd>202B2</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default MentorInformation;
