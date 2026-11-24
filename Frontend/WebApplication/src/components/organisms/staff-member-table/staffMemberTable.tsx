import { useState, useEffect, useMemo, useCallback } from 'react'
import './staff-member-table.scss'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button';
import VNnum2words from 'vn-num2words';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchCourseById } from '../../../features/courses/coursesSlice';
import { createInvoice } from '../../../features/invoices/invoicesSlice';
import {
  fetchMemberById,
  fetchMembers,
  selectMembersList,
} from '../../../features/members/membersSlice';
import type { ApiRejectedPayload } from '../../../features/shared/apiError';
import { fetchStaffByUserId } from '../../../features/staff/staffSlice';

interface StaffRecord { staffId: number; fullName: string }
interface MemberDetails { memberID: number | string; fullName: string }
interface CourseDetails { courseId: string; courseFee: number }

function MemberTable() {
  const dispatch = useAppDispatch();
  const member = useAppSelector(selectMembersList);
  const user = JSON.parse(sessionStorage.getItem('loginedUser') || '{}') as { userID: number };
  const [staff, setStaff] = useState<StaffRecord | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [specificMember, setSpecificMember] = useState<MemberDetails | null>(null);
  const navigate = useNavigate();
  const [specificCourse, setSpecificCourse] = useState<CourseDetails | null>(null);
  const [specificInfoLoaded, setSpecificInfoLoaded] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [inputData, setInputData] = useState<{ staffId: number | string; memberId: number | string; amountPaid: number; amountInWords: string }>({ staffId: '', memberId: '', amountPaid: 0, amountInWords: '' });
  const recordPage = 10;

  const formatDate = (dbDate) => {
    const date = new Date(dbDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const invoiceDate = formatDate(new Date());

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getSpecificInformation = useCallback(async (memberID: number | string, courseId: string) => {
    try {
      const memberRes = await dispatch(fetchMemberById(memberID)).unwrap();
      setSpecificMember(memberRes.member as MemberDetails | null);
      const courseData = await dispatch(fetchCourseById(courseId)).unwrap();
      setSpecificCourse(courseData as CourseDetails);
      setSpecificInfoLoaded(true);
    } catch (err) {
      console.log(err);
    }
  }, [dispatch]);

  const getStaffByUID = useCallback(async () => {
    try {
      const staffData = await dispatch(fetchStaffByUserId(user.userID)).unwrap();
      setStaff(staffData as StaffRecord | null);
    } catch (err) {
      console.log(err);
    }
  }, [dispatch, user.userID]);

  const getAllMembers = useCallback(async () => {
    try {
      await dispatch(fetchMembers()).unwrap();
    } catch (err) {
      console.log(err);
    }
  }, [dispatch]);

  const updateMemberIsPaidAndFetchData = async () => {
    if (isSubmittingPayment) return;
    setIsSubmittingPayment(true);
    try {
      await dispatch(createInvoice(inputData)).unwrap();
      const notificationMessage = 'Cập nhật thanh toán thành công!';
      localStorage.setItem('notificationMessage', notificationMessage);
      location.reload();
    } catch (err: unknown) {
      console.error('Error confirming payment:', err);
      const backendMessage = (err as ApiRejectedPayload | null)?.error;
      const errorMessage =
        typeof backendMessage === 'string' && backendMessage.trim().length > 0
          ? backendMessage
          : 'Không thể xác nhận thanh toán. Vui lòng kiểm tra thông tin và thử lại.';
      toast.error(errorMessage, { autoClose: 5000 });
      setIsSubmittingPayment(false);
    }
  };

  const handleApplication = (memberId: number | string) => navigate('don-thi/' + memberId);

  const filteredMembers = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase('vi');
    return member.filter((record) => {
      if (paymentFilter === 'paid' && !record.isPaid) return false;
      if (paymentFilter === 'unpaid' && record.isPaid) return false;
      if (!query) return true;
      return [record.memberID, record.fullName, record.phone, record.email, record.courseId]
        .some((value) => String(value ?? '').toLocaleLowerCase('vi').includes(query));
    });
  }, [member, searchValue, paymentFilter]);

  const paidCount = member.filter((record) => record.isPaid).length;
  const unpaidCount = member.filter((record) => !record.isPaid).length;
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / recordPage));
  const safePage = Math.min(currentPage, totalPages);
  const firstIndex = (safePage - 1) * recordPage;
  const records = filteredMembers.slice(firstIndex, firstIndex + recordPage);

  useEffect(() => {
    getAllMembers();
    getStaffByUID();
    const notification = localStorage.getItem('notificationMessage');
    if (notification) {
      toast.success(notification);
      localStorage.removeItem('notificationMessage');
    }
  }, [getAllMembers, getStaffByUID])

  useEffect(() => {
    const storedNotificationMessage = localStorage.getItem('notificationMessage');
    if (storedNotificationMessage) {
      toast.success(storedNotificationMessage);
      localStorage.removeItem('notificationMessage');
    }
  }, []);

  useEffect(() => {
    if (specificMember && specificCourse && specificInfoLoaded && staff) {
      setInputData((currentInput) => ({
        ...currentInput,
        staffId: staff.staffId,
        memberId: specificMember.memberID,
        amountPaid: specificCourse.courseFee,
        amountInWords: capitalizeFirstLetter(VNnum2words(specificCourse.courseFee) + 'đồng')
      }));
    }
  }, [specificMember, specificCourse, specificInfoLoaded, show, staff]);

  return (
    <div className="member-table-container staff-list-page">
      <header className="staff-list-header">
        <div><h1>Danh sách thành viên</h1><p>Tra cứu thông tin thành viên và trạng thái thanh toán khóa học.</p></div>
      </header>
      <section className="staff-summary-strip" aria-label="Tổng quan thành viên">
        <div className="staff-summary-pill"><span className="staff-summary-pill__label">Tổng thành viên đã tải</span><strong className="staff-summary-pill__value">{member.length}</strong></div>
        <div className="staff-summary-pill staff-summary-pill--success"><span className="staff-summary-pill__label">Đã thanh toán</span><strong className="staff-summary-pill__value">{paidCount}</strong></div>
        <div className="staff-summary-pill staff-summary-pill--muted"><span className="staff-summary-pill__label">Chưa thanh toán</span><strong className="staff-summary-pill__value">{unpaidCount}</strong></div>
      </section>
      <p className="staff-metrics-note">Số liệu tính trên các thành viên được tải từ API /Members.</p>

      <section className="staff-table-card" aria-label="Danh sách thành viên">
        <div className="staff-table-toolbar">
          <div className="staff-table-toolbar__search">
            <label className="staff-sr-only" htmlFor="staff-member-search">Tìm thành viên</label>
            <input id="staff-member-search" className="staff-search-input" type="search" placeholder="Tìm theo mã, họ tên, điện thoại, email hoặc khóa học..." value={searchValue} onChange={(event) => { setSearchValue(event.target.value); setCurrentPage(1); }} autoComplete="off" />
          </div>
          <div className="staff-table-toolbar__filters">
            <div className="staff-filter-group"><label className="staff-filter-label" htmlFor="staff-member-payment-filter">Thanh toán</label>
            <select id="staff-member-payment-filter" className="staff-filter-select" value={paymentFilter} onChange={(event) => { setPaymentFilter(event.target.value); setCurrentPage(1); }}>
              <option value="all">Tất cả ({member.length})</option><option value="paid">Đã thanh toán ({paidCount})</option><option value="unpaid">Chưa thanh toán ({unpaidCount})</option>
            </select></div>
          </div>
        </div>
        <div className="staff-table-scroll">
          <table className="table staff-data-table">
            <thead><tr><th scope="col">Mã thành viên</th><th scope="col">Họ và tên</th><th scope="col">Điện thoại</th><th scope="col">Email</th><th scope="col" className="col-center">Khóa học đang học</th><th scope="col" className="col-center">Trạng thái thanh toán</th><th scope="col" className="col-actions">Thao tác</th></tr></thead>
            <tbody>{records.length > 0 ? records.map((record) => (
              <tr key={record.memberID}>
                <td><span className="staff-id-badge">#{record.memberID}</span></td><td className="cell-strong">{record.fullName}</td><td className="cell-mono">{record.phone}</td><td>{record.email}</td><td className="col-center"><span className="staff-course-tag">{record.courseId}</span></td>
                <td className="col-center"><span className={`status-badge ${record.isPaid ? 'status-badge--active' : 'status-badge--inactive'}`}>{record.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></td>
                <td className="col-actions"><div className="row-actions">
                  <button className="action-btn action-btn--edit" type="button" disabled={Boolean(record.isPaid)} onClick={() => { if (record.memberID == null || !record.courseId) return; setSpecificInfoLoaded(false); getSpecificInformation(record.memberID, record.courseId); handleShow(); }}>Thanh toán</button>
                  <button className="action-btn action-btn--view" type="button" onClick={() => { if (record.memberID != null) handleApplication(record.memberID); }}>Đơn thi</button>
                </div></td>
              </tr>
            )) : <tr><td colSpan={7}><div className="staff-table-state">{member.length ? 'Không tìm thấy thành viên phù hợp với bộ lọc hiện tại.' : 'Hiện chưa có dữ liệu thành viên.'}</div></td></tr>}</tbody>
          </table>
        </div>
        <footer className="staff-table-footer">
          <span className="staff-table-footer__info">Hiển thị {records.length ? firstIndex + 1 : 0}–{Math.min(firstIndex + recordPage, filteredMembers.length)} trong {filteredMembers.length} thành viên</span>
          {filteredMembers.length > 0 && <nav aria-label="Phân trang thành viên"><ul className="pagination">
            <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}><button type="button" className="page-link" disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)}>Trước</button></li>
            {Array.from({ length: totalPages }, (_, index) => <li key={index} className={`page-item ${safePage === index + 1 ? 'active' : ''}`}><button type="button" className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button></li>)}
            <li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}><button type="button" className="page-link" disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)}>Sau</button></li>
          </ul></nav>}
        </footer>
      </section>

      <Modal show={show} onHide={() => { if (!isSubmittingPayment) handleClose(); }} backdrop="static" keyboard={!isSubmittingPayment} centered size="lg" backdropClassName="backdrop">
        <Modal.Header closeButton={!isSubmittingPayment}><Modal.Title><h1 className="tw-text-center">Xác nhận thanh toán</h1></Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="course-information-container"><div className="course-information-title"><h3></h3></div>
            {specificMember && staff && specificCourse ? <div><ul className="tw-flex tw-flex-col tw-gap-2 tw-text-lg">
              <li><label htmlFor="member-name">Học viên: {specificMember.fullName}<input type="text" value={specificMember.memberID} hidden readOnly /></label></li>
              <li><label htmlFor="staff-name">Nhân viên xác nhận: {staff.fullName}</label></li><li><label htmlFor="course-study">Khóa học: {specificCourse.courseId}</label></li><li><label htmlFor="invoice-date">Ngày thanh toán: {invoiceDate}</label></li><li><label htmlFor="course-fee">Học phí: {specificCourse.courseFee.toLocaleString()}VNĐ</label></li><li><label htmlFor="fee-words">Thành tiền: {capitalizeFirstLetter(VNnum2words(specificCourse.courseFee) + 'đồng')}</label></li>
            </ul></div> : null}
          </div>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" disabled={isSubmittingPayment} onClick={handleClose}>Đóng</Button><Button className="btn" disabled={isSubmittingPayment || !specificInfoLoaded || !staff} onClick={() => void updateMemberIsPaidAndFetchData()}>{isSubmittingPayment ? 'Đang xử lý...' : 'Xác nhận'}</Button></Modal.Footer>
      </Modal>
    </div>
  )
}

export default MemberTable
