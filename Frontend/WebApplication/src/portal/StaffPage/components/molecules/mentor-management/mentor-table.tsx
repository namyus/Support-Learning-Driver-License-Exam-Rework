import { useEffect, useMemo, useState } from 'react'
import './mentor-table.scss'
import api from '../../../../../config/axios';

interface MentorRecord { mentorId: number | string; fullName: string; phone?: string; email?: string; isTeachingTheory: boolean; isTeachingPractice: boolean }

function MentorTable() {
  const [mentor, setMentor] = useState<MentorRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('');
  const [teachingFilter, setTeachingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordPage = 10;

  useEffect(() => {
    const getAllMentors = async () => {
      try {
        const response = await api.get('Mentor/list');
        setMentor(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log(error);
      }
    };
    void getAllMentors();
  }, [])

  const theoryCount = mentor.filter((item) => item.isTeachingTheory).length;
  const practiceCount = mentor.filter((item) => item.isTeachingPractice).length;

  const filteredMentors = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    return mentor.filter((item) => {
      if (teachingFilter === 'theory' && !item.isTeachingTheory) return false;
      if (teachingFilter === 'practice' && !item.isTeachingPractice) return false;
      if (teachingFilter === 'both' && !(item.isTeachingTheory && item.isTeachingPractice)) return false;
      if (teachingFilter === 'neither' && (item.isTeachingTheory || item.isTeachingPractice)) return false;
      if (!query) return true;
      return [item.mentorId, item.fullName, item.phone, item.email]
        .some((value) => String(value ?? '').toLocaleLowerCase('vi').includes(query));
    });
  }, [mentor, searchQuery, teachingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMentors.length / recordPage));
  const safePage = Math.min(currentPage, totalPages);
  const firstIndex = (safePage - 1) * recordPage;
  const records = filteredMentors.slice(firstIndex, firstIndex + recordPage);

  return (
    <div className="mentor-table-container staff-list-page">
      <header className="staff-list-header"><div><h1>Danh sách giáo viên</h1><p>Tra cứu thông tin liên hệ và phân công giảng dạy của giáo viên.</p></div></header>
      <section className="staff-summary-strip" aria-label="Tổng quan giáo viên">
        <div className="staff-summary-pill"><span className="staff-summary-pill__label">Tổng giáo viên đã tải</span><strong className="staff-summary-pill__value">{mentor.length}</strong></div>
        <div className="staff-summary-pill staff-summary-pill--info"><span className="staff-summary-pill__label">Đang dạy lý thuyết</span><strong className="staff-summary-pill__value">{theoryCount}</strong></div>
        <div className="staff-summary-pill staff-summary-pill--success"><span className="staff-summary-pill__label">Đang dạy thực hành</span><strong className="staff-summary-pill__value">{practiceCount}</strong></div>
      </section>
      <p className="staff-metrics-note">Số liệu tính trên các giáo viên được tải từ API Mentor/list; giáo viên có thể được tính ở cả hai nhóm giảng dạy.</p>

      <section className="staff-table-card" aria-label="Danh sách giáo viên">
        <div className="staff-table-toolbar">
          <div className="staff-table-toolbar__search"><label className="staff-sr-only" htmlFor="staff-mentor-search">Tìm giáo viên</label><input id="staff-mentor-search" className="staff-search-input" type="search" placeholder="Tìm theo mã, họ tên, điện thoại hoặc email..." value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} /></div>
          <div className="staff-table-toolbar__filters"><div className="staff-filter-group"><label className="staff-filter-label" htmlFor="staff-mentor-filter">Phân công</label><select id="staff-mentor-filter" className="staff-filter-select" value={teachingFilter} onChange={(event) => { setTeachingFilter(event.target.value); setCurrentPage(1); }}><option value="all">Tất cả ({mentor.length})</option><option value="theory">Dạy lý thuyết ({theoryCount})</option><option value="practice">Dạy thực hành ({practiceCount})</option><option value="both">Cả hai</option><option value="neither">Chưa phân công</option></select></div></div>
        </div>
        <div className="staff-table-scroll"><table className="table staff-data-table">
          <thead><tr><th scope="col">Mã giáo viên</th><th scope="col">Họ và tên</th><th scope="col">Điện thoại</th><th scope="col" className="col-center">Dạy lý thuyết</th><th scope="col" className="col-center">Dạy thực hành</th><th scope="col">Email</th></tr></thead>
          <tbody>{records.length > 0 ? records.map((item) => <tr key={item.mentorId}>
            <td><span className="staff-id-badge">#{item.mentorId}</span></td><td className="cell-strong">{item.fullName}</td><td className="cell-mono">{item.phone}</td>
            <td className="col-center"><span className={`status-badge ${item.isTeachingTheory ? 'status-badge--active' : 'status-badge--inactive'}`}>{item.isTeachingTheory ? 'Đang dạy' : 'Không dạy'}</span></td>
            <td className="col-center"><span className={`status-badge ${item.isTeachingPractice ? 'status-badge--active' : 'status-badge--inactive'}`}>{item.isTeachingPractice ? 'Đang dạy' : 'Không dạy'}</span></td><td>{item.email}</td>
          </tr>) : <tr><td colSpan={6}><div className="staff-table-state">{mentor.length ? 'Không tìm thấy giáo viên phù hợp với bộ lọc hiện tại.' : 'Hiện chưa có dữ liệu giáo viên.'}</div></td></tr>}</tbody>
        </table></div>
        <footer className="staff-table-footer"><span className="staff-table-footer__info">Hiển thị {records.length ? firstIndex + 1 : 0}–{Math.min(firstIndex + recordPage, filteredMentors.length)} trong {filteredMentors.length} giáo viên</span>
          {filteredMentors.length > 0 && <nav aria-label="Phân trang giáo viên"><ul className="pagination"><li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}><button type="button" className="page-link" disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)}>Trước</button></li>{Array.from({ length: totalPages }, (_, index) => <li key={index} className={`page-item ${safePage === index + 1 ? 'active' : ''}`}><button type="button" className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button></li>)}<li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}><button type="button" className="page-link" disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)}>Sau</button></li></ul></nav>}
        </footer>
      </section>
    </div>
  )
}

export default MentorTable
