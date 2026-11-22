import './teaching-schedule-note.scss';

function TeachingScheduleNote() {
  return (
    <aside className="schedule-note-container" aria-label="Chú thích khung giờ dạy">
      <h3>Chú thích khung giờ giảng dạy</h3>
      <p>
        <strong>Ca sáng:</strong> từ 07h30 đến 11h30 &nbsp;•&nbsp;{' '}
        <strong>Ca chiều:</strong> từ 13h30 đến 17h30 (Nhấn vào thẻ lớp học để thực hiện điểm danh học viên).
      </p>
    </aside>
  );
}

export default TeachingScheduleNote;
