import './teaching-register-note.scss';

function TeachingRegisterNote() {
  return (
    <aside className="register-note-container" aria-label="Lưu ý đăng ký lịch dạy">
      <div className="register-note">
        <div className="register-note__section">
          <h3>Chú thích khung giờ</h3>
          <p>
            <strong>Ca sáng:</strong> từ 07h30 đến 11h30 &nbsp;•&nbsp;{' '}
            <strong>Ca chiều:</strong> từ 13h30 đến 17h30
          </p>
        </div>
        <div className="register-note__section">
          <h3>Lưu ý dành cho giảng viên</h3>
          <p>
            Giáo viên cần sắp xếp thời gian biểu bản thân phù hợp để có thể tham gia dạy các lớp đầy đủ.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default TeachingRegisterNote;
