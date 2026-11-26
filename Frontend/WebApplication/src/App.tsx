import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import ScrollToTop from './config/scrollToTop';
import { selectCurrentUser, useAppSelector } from './app/store';
import RouteFallbackPage from './pages/authorization/routeFallbackPage';

// Layout Templates
import GuestLayout from './components/templates/guest-layout/guestLayout';
import StaffLayout from './components/templates/staff-layout/staffLayout';
import MentorLayout from './components/templates/mentor-layout/mentorLayout';

// Authorization Pages
import LoginPage from './pages/authorization/loginPage';
import RegistrationPage from './pages/authorization/registrationPage';
import ForgetPasswordPage from './pages/authorization/forgetPasswordPage';

// Guest Pages
import GuestHomePage from './pages/guest/guestHomePage';
import GuestCoursePage from './pages/guest/guestCoursePage';

// Member Pages
import MemberHomePage from './pages/member/memberHomePage';
import MemberCoursePage from './pages/member/memberCoursePage';
import CourseVerificationPage from './pages/member/courseVerificationPage';
import MemberInformationPage from './pages/member/memberInformationPage';
import MemberRegisteredCoursePage from './pages/member/memberRegisteredCoursePage';
import MentorInformationPage from './pages/member/mentorInformationPage';
import TheorySchedulePage from './pages/member/theorySchedulePage';
import PracticeSchedulePage from './pages/member/practiceSchedulePage';
import PracticeRegisterPage from './pages/member/practiceRegisterPage';
import PracticeSpecificPage from './pages/member/practiceSpecificPage';
import ExamDocumentPage from './pages/member/examDocumentPage';
import TheoryTestPage from './pages/member/theoryTestPage';
import DoTheoryTestPage from './pages/member/doTheoryTestPage';
import TheoryResultPage from './pages/member/theoryResultPage';

// Mentor Pages
import MentorHomePage from './pages/mentor/mentorHomePage';
import MentorSchedulePage from './pages/mentor/mentorSchedulePage';
import MentorRegisterSchedulePage from './pages/mentor/mentorRegisterSchedulePage';
import MentorTakeAttendancePage from './pages/mentor/mentorTakeAttendancePage';
import MentorClassRegisterPage from './pages/mentor/mentorClassRegisterPage';

// Staff Pages
import StaffDashboardPage from './pages/staff/staffDashboardPage';
import StaffUserManagementPage from './pages/staff/staffUserManagementPage';
import StaffMemberManagementPage from './pages/staff/staffMemberManagementPage';
import StaffMemberExamDocPage from './pages/staff/staffMemberExamDocPage';
import StaffMentorManagementPage from './pages/staff/staffMentorManagementPage';
import StaffNewsManagementPage from './pages/staff/staffNewsManagementPage';
import StaffCreateNewsPage from './pages/staff/staffCreateNewsPage';
import StaffUpdateNewsPage from './pages/staff/staffUpdateNewsPage';
import StaffInactiveNewsPage from './pages/staff/staffInactiveNewsPage';
import StaffReportPage from './pages/staff/staffReportPage';
import StaffExamManagementPage from './pages/staff/staffExamManagementPage';
import StaffCreateExamPage from './pages/staff/staffCreateExamPage';

// Admin Pages
import AdminPage from './pages/admin/adminPage';
import AdminDashboardPage from './pages/admin/adminDashboardPage';
import AdminProfilePage from './pages/admin/adminProfilePage';
import AdminCourseManagementPage from './pages/admin/adminCourseManagementPage';
import AdminInactiveCoursePage from './pages/admin/adminInactiveCoursePage';
import AdminCreateCoursePage from './pages/admin/adminCreateCoursePage';
import AdminCreateCourseDetailPage from './pages/admin/adminCreateCourseDetailPage';
import AdminUpdateCoursePage from './pages/admin/adminUpdateCoursePage';
import AdminStaffManagementPage from './pages/admin/adminStaffManagementPage';
import AdminCreateStaffPage from './pages/admin/adminCreateStaffPage';
import AdminUpdateStaffPage from './pages/admin/adminUpdateStaffPage';
import AdminMemberManagementPage from './pages/admin/adminMemberManagementPage';
import AdminMentorManagementPage from './pages/admin/adminMentorManagementPage';
import AdminCreateMentorPage from './pages/admin/adminCreateMentorPage';
import AdminUpdateMentorPage from './pages/admin/adminUpdateMentorPage';
import AdminClassManagementPage from './pages/admin/adminClassManagementPage';
import AdminTheoryClassPage from './pages/admin/adminTheoryClassPage';
import AdminPracticeClassPage from './pages/admin/adminPracticeClassPage';
import AdminCreateTheoryLessonPage from './pages/admin/adminCreateTheoryLessonPage';
import AdminCreatePracticeLessonPage from './pages/admin/adminCreatePracticeLessonPage';
import AdminNewsManagementPage from './pages/admin/adminNewsManagementPage';
import AdminCreateNewsPage from './pages/admin/adminCreateNewsPage';
import AdminUpdateNewsPage from './pages/admin/adminUpdateNewsPage';
import AdminInvoiceManagementPage from './pages/admin/adminInvoiceManagementPage';
import AdminReportPage from './pages/admin/adminReportPage';
import AdminExamResultManagementPage from './pages/admin/adminExamResultManagementPage';
import AdminStudentManagementPage from './pages/admin/adminStudentManagementPage';

const PROTECTED_ROUTE_PREFIXES = [
  '/bang-dieu-khien',
  '/thong-tin-ca-nhan',
  '/quan-ly-khoa-hoc',
  '/quan-ly-nhan-vien',
  '/quan-ly-thanh-vien',
  '/quan-ly-giao-vien',
  '/quan-ly-lich-hoc',
  '/quan-ly-tin-tuc',
  '/quan-ly-thanh-toan',
  '/bao-cao',
  '/quan-ly-ket-qua',
  '/quan-ly-hoc-vien',
  '/quan-ly-nguoi-dung',
  '/quan-ly-ky-thi',
  '/lich-day',
  '/danh-sach-khoa-hoc-giao-vien',
  '/khoahoc/xac-nhan-khoa-hoc',
  '/khoa-hoc-cua-ban',
  '/danh-sach-khoa-hoc',
  '/ho-so-thi',
  '/kiem-tra',
];

function isKnownProtectedPath(pathname: string): boolean {
  const normalized = pathname.toLowerCase();
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

function UnmatchedRouteHandler({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation();
  if (isKnownProtectedPath(location.pathname)) {
    if (!isAuthenticated) {
      return <Navigate to="/dang-nhap" replace state={{ from: location.pathname }} />;
    }
    return <RouteFallbackPage variant="forbidden" />;
  }
  return <RouteFallbackPage variant="not-found" />;
}

function App() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        className="toast-content"
        transition={Bounce}
      />

      <Routes>
        <Route path="/">
          {user === null ? (
            <>
              <Route element={<GuestLayout />}>
                <Route index element={<GuestHomePage />} />
                <Route path="khoahoc/:month/:year" element={<GuestCoursePage />} />
              </Route>
              <Route path="dang-nhap" element={<LoginPage />} />
              <Route path="dang-ky" element={<RegistrationPage />} />
              <Route path="quen-mat-khau" element={<ForgetPasswordPage />} />
              <Route path="*" element={<UnmatchedRouteHandler isAuthenticated={false} />} />
            </>
          ) : (
            <>
              <Route path="/dang-nhap" element={<LoginPage />} />
              {user.roleId === 1 && (
                <>
                  <Route path="/" element={<AdminPage />}>
                    <Route index element={<Navigate to="/bang-dieu-khien" replace />} />
                    <Route path="bang-dieu-khien" element={<AdminDashboardPage />} />
                    <Route path="Thong-tin-ca-nhan" element={<AdminProfilePage />} />
                    <Route path="quan-ly-khoa-hoc">
                      <Route index element={<AdminCourseManagementPage />} />
                      <Route path="chua-mo" element={<AdminInactiveCoursePage />} />
                      <Route path="tao-khoa-hoc" element={<AdminCreateCoursePage />} />
                      <Route path="chi-tiet" element={<AdminCreateCourseDetailPage />} />
                      <Route path="cap-nhat-khoa-hoc/:courseId" element={<AdminUpdateCoursePage />} />
                    </Route>
                    <Route path="quan-ly-nhan-vien">
                      <Route index element={<AdminStaffManagementPage />} />
                      <Route path="tao-nhan-vien" element={<AdminCreateStaffPage />} />
                      <Route path="cap-nhat-nhan-vien" element={<AdminUpdateStaffPage />} />
                      <Route path="cap-nhat-nhan-vien/:staffId" element={<AdminUpdateStaffPage />} />
                    </Route>
                    <Route path="quan-ly-thanh-vien" element={<AdminMemberManagementPage />} />
                    <Route path="quan-ly-giao-vien">
                      <Route index element={<AdminMentorManagementPage />} />
                      <Route path="tao-giao-vien" element={<AdminCreateMentorPage />} />
                      <Route path="cap-nhat-giao-vien" element={<AdminUpdateMentorPage />} />
                      <Route path="cap-nhat-giao-vien/:mentorId" element={<AdminUpdateMentorPage />} />
                    </Route>
                    <Route path="quan-ly-lich-hoc">
                      <Route index element={<AdminClassManagementPage />} />
                      <Route path="lop-ly-thuyet">
                        <Route index element={<AdminTheoryClassPage />} />
                        <Route path="tao-lop-hoc" element={<AdminCreateTheoryLessonPage />} />
                      </Route>
                      <Route path="lop-thuc-hanh">
                        <Route index element={<AdminPracticeClassPage />} />
                        <Route path="tao-lop-hoc" element={<AdminCreatePracticeLessonPage />} />
                      </Route>
                    </Route>
                    <Route path="quan-ly-tin-tuc">
                      <Route index element={<AdminNewsManagementPage />} />
                      <Route path="tao-tin-tuc" element={<AdminCreateNewsPage />} />
                      <Route path="cap-nhat-tin-tuc/:newsId" element={<AdminUpdateNewsPage />} />
                    </Route>
                    <Route path="quan-ly-thanh-toan">
                      <Route index element={<AdminInvoiceManagementPage />} />
                    </Route>
                    <Route path="bao-cao" element={<AdminReportPage />} />
                    <Route path="quan-ly-ket-qua" element={<AdminExamResultManagementPage />} />
                    <Route path="quan-ly-hoc-vien" element={<AdminStudentManagementPage />} />
                  </Route>
                </>
              )}
              {user.roleId === 2 && (
                <>
                  <Route element={<StaffLayout />}>
                    <Route index element={<StaffDashboardPage />} />
                    <Route path="quan-ly-nguoi-dung" element={<StaffUserManagementPage />} />
                    <Route path="quan-ly-thanh-vien">
                      <Route index element={<StaffMemberManagementPage />} />
                      <Route path="don-thi/:memberId" element={<StaffMemberExamDocPage />} />
                    </Route>
                    <Route path="quan-ly-giao-vien" element={<StaffMentorManagementPage />} />
                    <Route path="quan-ly-tin-tuc">
                      <Route index element={<StaffNewsManagementPage />} />
                      <Route path="tao-tin-tuc" element={<StaffCreateNewsPage />} />
                      <Route path="cap-nhat-tin-tuc/:newsId" element={<StaffUpdateNewsPage />} />
                      <Route path="chua-kich-hoat" element={<StaffInactiveNewsPage />} />
                    </Route>
                    <Route path="bao-cao" element={<StaffReportPage />} />
                    <Route path="quan-ly-ky-thi">
                      <Route index element={<StaffExamManagementPage />} />
                      <Route path="tao-ky-thi" element={<StaffCreateExamPage />} />
                    </Route>
                  </Route>
                </>
              )}
              {user.roleId === 3 && (
                <>
                  <Route element={<MentorLayout />}>
                    <Route index element={<MentorHomePage />} />
                    <Route path="lich-day">
                      <Route index element={<MentorSchedulePage />} />
                      <Route path="diem-danh/:classId" element={<MentorTakeAttendancePage />} />
                    </Route>
                    <Route path="danh-sach-khoa-hoc-giao-vien">
                      <Route index element={<MentorClassRegisterPage />} />
                      <Route path="dang-ki-lich-day/:courseId" element={<MentorRegisterSchedulePage />} />
                    </Route>
                  </Route>
                </>
              )}
              {user.roleId === 4 && (
                <>
                  <Route index element={<MemberHomePage />} />
                  <Route path="khoahoc/:month/:year" element={<MemberCoursePage />} />
                  <Route path="khoahoc/xac-nhan-khoa-hoc/:courseName" element={<CourseVerificationPage />} />
                  <Route path="thong-tin-ca-nhan/:username" element={<MemberInformationPage />} />
                  <Route path="/khoa-hoc-cua-ban">
                    <Route index element={<MemberRegisteredCoursePage />} />
                    <Route path="thong-tin-giao-vien" element={<MentorInformationPage />} />
                    <Route path="lich-hoc-ly-thuyet" element={<TheorySchedulePage />} />
                    <Route path="lich-hoc-thuc-hanh" element={<PracticeSchedulePage />} />
                  </Route>
                  <Route path="danh-sach-khoa-hoc">
                    <Route index element={<PracticeRegisterPage />} />
                    <Route path="khoa-hoc/:mentorId/:courseId" element={<PracticeSpecificPage />} />
                  </Route>
                  <Route path="ho-so-thi">
                    <Route index element={<ExamDocumentPage />} />
                  </Route>
                  <Route path="kiem-tra">
                    <Route index element={<TheoryTestPage />} />
                    <Route path="bai-lam" element={<DoTheoryTestPage />} />
                    <Route path="ket-qua" element={<TheoryResultPage />} />
                  </Route>
                </>
              )}
              <Route path="*" element={<UnmatchedRouteHandler isAuthenticated={true} />} />
            </>
          )}
        </Route>
      </Routes>
    </>
  );
}

export default App;
