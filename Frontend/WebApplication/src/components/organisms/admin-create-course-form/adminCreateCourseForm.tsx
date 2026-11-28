import React, { useCallback, useEffect, useMemo, useState } from "react";
import './admin-create-course-form.scss';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Modal } from "react-bootstrap";
import {
  BsArrowLeft,
  BsCalendarRange,
  BsCheckCircleFill,
  BsExclamationCircle,
  BsInfoCircle,
  BsPlusCircle,
  BsPlusLg,
  BsXCircleFill,
} from "react-icons/bs";
import { useAppDispatch } from "../../../app/store";
import {
  addCourseContent,
  addCourseDetails,
  createCourse,
  fetchCourseContents,
  fetchCourseList,
} from "../../../features/courses/coursesSlice";
import {
  formatYMDToVN,
  MIN_SECTION_DURATION_DAYS,
  validateCourseSchedule,
} from "../../../features/courses/courseScheduleValidation";
import type { ApiRejectedPayload } from "../../../features/courses/coursesTypes";
import { fetchTheoryMentors } from "../../../features/mentors/mentorsSlice";

interface MentorOption {
  mentorId: string;
  fullName: string;
}

interface CourseSummaryItem {
  courseId: string;
  name: string;
}

interface CreateCoursePayload {
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  limitStudent: number;
  courseFee: number;
  passTheoryLs: number;
  passKm: number;
  theoryTeacherId: string;
  status: boolean;
}

interface CourseContentOption {
  courseContent1: string;
}

interface CourseDetailRow {
  courseContent: string;
  courseTimeStart: string;
  courseTimeEnd: string;
  courseId: string;
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null) {
    if ("error" in err && typeof (err as ApiRejectedPayload).error === "string") {
      return (err as ApiRejectedPayload).error!;
    }
    if (
      "response" in err &&
      typeof (err as { response?: { data?: { error?: string } } }).response?.data
        ?.error === "string"
    ) {
      return (err as { response: { data: { error: string } } }).response.data
        .error;
    }
  }
  return fallback;
}

// ------------------ CreateCourseForm ------------------
function CreateCourseForm() {
  const dispatch = useAppDispatch();
  const [mentorName, setMentorName] = useState<MentorOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [, setIsDuplicateId] = useState(false);
  const [, setIsDuplicateName] = useState(false);
  const [courseIdList, setCourseIdList] = useState<string[]>([]);
  const [courseNameList, setCourseNameList] = useState<string[]>([]);
  const [inputData, setInputData] = useState<CreateCoursePayload>({
    courseId: "",
    name: "",
    startDate: "",
    endDate: "",
    limitStudent: 25,
    courseFee: 0,
    passTheoryLs: 0,
    passKm: 60,
    theoryTeacherId: "",
    status: false,
  });

  const navigate = useNavigate();

  const getListMentorId = useCallback(async () => {
    try {
      const res = (await dispatch(fetchTheoryMentors()).unwrap()) as MentorOption[];
      setMentorName(Array.isArray(res) ? res : []);
    } catch (err) {
      const msg = getApiErrorMessage(err, "");
      if (msg) setError(msg);
    }
  }, [dispatch]);

  const getCourseIdList = useCallback(async () => {
    try {
      const res = (await dispatch(fetchCourseList()).unwrap()) as CourseSummaryItem[];
      setCourseIdList(res.map((course) => course.courseId));
    } catch (err) {
      const msg = getApiErrorMessage(err, "");
      if (msg) setError(msg);
    }
  }, [dispatch]);

  const getCourseNameList = useCallback(async () => {
    try {
      const res = (await dispatch(fetchCourseList()).unwrap()) as CourseSummaryItem[];
      setCourseNameList(res.map((course) => course.name));
    } catch (err) {
      const msg = getApiErrorMessage(err, "");
      if (msg) setError(msg);
    }
  }, [dispatch]);

  // Fix BUG-ADM-06: Unified validation executed on form submit before navigating to Step 2
  const handleContinue = () => {
    setError(null);
    setIsDuplicateId(false);
    setIsDuplicateName(false);

    const trimmedId = inputData.courseId.trim();
    const trimmedName = inputData.name.trim();

    if (!/^(\d{4})B2$/.test(trimmedId)) {
      setError("Mã khoá học phải có định dạng XXXXB2 với X là số.");
      return;
    }
    if (!inputData.theoryTeacherId) {
      setError("Vui lòng chọn giáo viên phụ trách.");
      return;
    }
    if (!/^\d{3}B2$/.test(trimmedName)) {
      setError("Tên khoá học phải có định dạng XXXB2 với X là số.");
      return;
    }
    if (!inputData.startDate || !inputData.endDate) {
      setError("Vui lòng chọn đầy đủ ngày khai giảng và ngày bế giảng.");
      return;
    }
    if (inputData.endDate < inputData.startDate) {
      setError("Ngày bế giảng phải sau ngày khai giảng.");
      return;
    }
    if (courseIdList.includes(trimmedId)) {
      setIsDuplicateId(true);
      setError("Mã khoá học đã tồn tại.");
      return;
    }
    if (courseNameList.includes(trimmedName)) {
      setIsDuplicateName(true);
      setError("Tên khoá học đã tồn tại.");
      return;
    }
    if (
      Number.isNaN(inputData.limitStudent) ||
      inputData.limitStudent < 25 ||
      inputData.limitStudent > 70
    ) {
      setError("Số học viên tối đa phải từ 25 đến 70.");
      return;
    }
    if (
      Number.isNaN(inputData.courseFee) ||
      inputData.courseFee < 0 ||
      inputData.courseFee > 30000000
    ) {
      setError("Học phí phải từ 0 đến 30.000.000 VNĐ.");
      return;
    }
    if (
      Number.isNaN(inputData.passTheoryLs) ||
      inputData.passTheoryLs < 0 ||
      inputData.passTheoryLs > 100
    ) {
      setError("Số giờ học lý thuyết phải nhỏ hơn hoặc bằng 100%.");
      return;
    }
    if (
      Number.isNaN(inputData.passKm) ||
      inputData.passKm < 60 ||
      inputData.passKm > 1000
    ) {
      setError("Quãng đường cần thiết phải từ 60km đến 1000km.");
      return;
    }

    const normalizedPayload: CreateCoursePayload = {
      ...inputData,
      courseId: trimmedId,
      name: trimmedName,
    };

    localStorage.setItem("course", JSON.stringify(normalizedPayload));
    navigate("/quan-ly-khoa-hoc/chi-tiet");
    window.scroll({
      top: 0,
      behavior: "instant",
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleContinue();
  };

  const handleNumberChange = (
    field: "limitStudent" | "courseFee" | "passTheoryLs" | "passKm",
    rawValue: string
  ) => {
    const parsed = rawValue === "" ? Number.NaN : parseInt(rawValue, 10);
    setInputData((prev) => ({
      ...prev,
      [field]: parsed,
    }));
  };

  useEffect(() => {
    void getListMentorId();
    void getCourseIdList();
    void getCourseNameList();
  }, [getListMentorId, getCourseIdList, getCourseNameList]);

  return (
    <div className="create-course-container">
      <div className="admin-form-header">
        <div className="admin-form-header__left">
          <span className="admin-form-header__eyebrow">
            Bước 1 / 2 • Thông tin chung
          </span>
          <div className="create-course-title">
            <h1>Tạo khoá học mới</h1>
          </div>
          <p className="admin-form-header__subtitle">
            Thiết lập thông tin khoá học, giáo viên phụ trách và chỉ tiêu đào tạo trước khi phân bổ lịch chi tiết.
          </p>
        </div>
        <div className="admin-form-header__actions">
          <Link to="/quan-ly-khoa-hoc" className="admin-form-back-btn">
            <BsArrowLeft aria-hidden="true" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </div>

      <div className="create-course-form">
        {error && (
          <div className="error-message admin-form-alert" role="alert">
            <BsExclamationCircle aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="courseId" className="col-form-label">
                Mã khoá học <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="courseId"
                placeholder="Ví dụ: 1024B2"
                name="courseId"
                value={inputData.courseId}
                required
                onChange={(e) =>
                  setInputData({ ...inputData, courseId: e.target.value })
                }
              />
              <small className="field-hint">
                Định dạng 4 chữ số kèm hậu tố B2 (XXXXB2).
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="col-form-label">
                Tên khoá học <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Ví dụ: 241B2"
                name="name"
                value={inputData.name}
                required
                onChange={(e) =>
                  setInputData({ ...inputData, name: e.target.value })
                }
              />
              <small className="field-hint">
                Định dạng 3 chữ số kèm hậu tố B2 (XXXB2).
              </small>
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="theoryTeacherId" className="col-form-label">
                Giáo viên phụ trách lý thuyết <span className="required-mark">*</span>
              </label>
              <select
                className="form-control"
                id="theoryTeacherId"
                name="theoryTeacherId"
                value={inputData.theoryTeacherId}
                required
                onChange={(e) =>
                  setInputData({
                    ...inputData,
                    theoryTeacherId: e.target.value,
                  })
                }
              >
                <option value="" disabled>
                  Chọn giáo viên phụ trách
                </option>
                {mentorName.map((mentor) => (
                  <option value={mentor.mentorId} key={mentor.mentorId}>
                    {mentor.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startDate" className="col-form-label">
                Ngày khai giảng <span className="required-mark">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="startDate"
                name="startDate"
                value={inputData.startDate}
                required
                onChange={(e) =>
                  setInputData({ ...inputData, startDate: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate" className="col-form-label">
                Ngày bế giảng <span className="required-mark">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="endDate"
                name="endDate"
                value={inputData.endDate}
                min={inputData.startDate || undefined}
                required
                onChange={(e) =>
                  setInputData({ ...inputData, endDate: e.target.value })
                }
              />
              {inputData.startDate &&
                inputData.endDate &&
                inputData.endDate < inputData.startDate && (
                  <small className="field-error" role="alert">
                    Ngày bế giảng phải từ ngày khai giảng ({formatYMDToVN(inputData.startDate)}) trở đi.
                  </small>
                )}
            </div>

            <div className="form-group form-group--full">
              <div className="admin-schedule-rules-panel" role="note">
                <div className="admin-schedule-rules-panel__title">
                  <BsInfoCircle aria-hidden="true" />
                  <span>Lưu ý quy tắc phân bổ lịch học ở Bước 2</span>
                </div>
                <ul className="admin-schedule-rules-panel__list">
                  <li>
                    Tất cả học phần ở Bước 2 phải nằm trong khoảng{" "}
                    <strong>Ngày khai giảng – Ngày bế giảng</strong> bạn chọn ở đây.
                  </li>
                  <li>
                    Mỗi học phần yêu cầu kéo dài tối thiểu{" "}
                    <strong>{MIN_SECTION_DURATION_DAYS} ngày</strong> và sắp xếp nối tiếp nhau
                    (ngày bắt đầu học phần sau phải lớn hơn ngày kết thúc học phần trước).
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="limitStudent" className="col-form-label">
                Số học viên tối đa (25–70) <span className="required-mark">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="limitStudent"
                name="limitStudent"
                value={
                  Number.isNaN(inputData.limitStudent)
                    ? ""
                    : inputData.limitStudent
                }
                min={25}
                max={70}
                required
                onChange={(e) =>
                  handleNumberChange("limitStudent", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="courseFee" className="col-form-label">
                Học phí (VNĐ) <span className="required-mark">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="courseFee"
                name="courseFee"
                value={
                  Number.isNaN(inputData.courseFee) ? "" : inputData.courseFee
                }
                min={0}
                max={30000000}
                required
                onChange={(e) =>
                  handleNumberChange("courseFee", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="passTheoryLs" className="col-form-label">
                Số giờ học lý thuyết (%) <span className="required-mark">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="passTheoryLs"
                name="passTheoryLs"
                value={
                  Number.isNaN(inputData.passTheoryLs)
                    ? ""
                    : inputData.passTheoryLs
                }
                min={0}
                max={100}
                required
                onChange={(e) =>
                  handleNumberChange("passTheoryLs", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="passKm" className="col-form-label">
                Quãng đường cần thiết (km) <span className="required-mark">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="passKm"
                name="passKm"
                value={Number.isNaN(inputData.passKm) ? "" : inputData.passKm}
                min={60}
                max={1000}
                placeholder="60 - 1000 km"
                required
                onChange={(e) => handleNumberChange("passKm", e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <Link to="/quan-ly-khoa-hoc" className="btn admin-btn-cancel">
              Huỷ bỏ
            </Link>
            <button className="btn btn-primary admin-btn-submit" type="submit">
              Tiếp tục thiết lập chi tiết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourseForm;

// ------------------ CreateCourseDetail ------------------
export function CreateCourseDetail() {
  const dispatch = useAppDispatch();
  const course: Partial<CreateCoursePayload> = (() => {
    try {
      return JSON.parse(localStorage.getItem("course") || "{}");
    } catch {
      return {};
    }
  })();
  const courseId = course.courseId || "";

  const navigate = useNavigate();
  const [courseContent, setCourseContent] = useState<CourseContentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inputData, setInputData] = useState<CourseDetailRow[]>([
    { courseContent: "", courseTimeStart: "", courseTimeEnd: "", courseId },
    { courseContent: "", courseTimeStart: "", courseTimeEnd: "", courseId },
  ]);
  const [courseContentInput, setCourseContenInput] = useState({
    courseContent1: "",
  });

  const [show, setShow] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const scheduleValidation = useMemo(
    () =>
      validateCourseSchedule(inputData, {
        startDate: course.startDate,
        endDate: course.endDate,
      }),
    [inputData, course.startDate, course.endDate]
  );

  useEffect(() => {
    setInputData((prevInputData) =>
      prevInputData.map((row) => ({
        courseContent: row.courseContent || "",
        courseTimeStart: row.courseTimeStart || "",
        courseTimeEnd: row.courseTimeEnd || "",
        courseId,
      }))
    );
  }, [courseId]);

  const handleChange = (
    index: number,
    field: keyof CourseDetailRow,
    value: string
  ) => {
    setInputData((prevInputData) => {
      const newData = [...prevInputData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const getCourseContent = useCallback(async () => {
    try {
      const res = await dispatch(fetchCourseContents()).unwrap();
      setCourseContent(res);
    } catch (err) {
      const msg = getApiErrorMessage(err, "");
      if (msg) setError(msg);
    }
  }, [dispatch]);

  const handleAddCourseContent = async () => {
    if (!courseContentInput.courseContent1.trim()) {
      setError("Vui lòng nhập tên nội dung đào tạo.");
      return;
    }
    try {
      await dispatch(addCourseContent(courseContentInput)).unwrap();
      handleClose();
      setCourseContenInput({ courseContent1: "" });
      toast.success("Thêm nội dung thành công");
      await getCourseContent();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Không thể thêm nội dung khoá học.");
      setError(msg);
    }
  };

  const handleAddInput = () => {
    setInputData((prevInputData) => [
      ...prevInputData,
      {
        courseContent: "",
        courseTimeStart: "",
        courseTimeEnd: "",
        courseId,
      },
    ]);
  };

  useEffect(() => {
    void getCourseContent();
  }, [getCourseContent]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setHasAttemptedSubmit(true);

    if (!courseId || !course.startDate || !course.endDate) {
      setError(
        "Không tìm thấy thông tin khoá học từ Bước 1. Vui lòng quay lại trang Tạo khoá học."
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmCreateCourse = async () => {
    if (!scheduleValidation.isValid || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const formattedListObjects = inputData.map((data) => ({ ...data }));

      // Create course first
      const response = await dispatch(createCourse(course)).unwrap();

      // If success then adding course details
      if (response.status === 200) {
        await dispatch(addCourseDetails(formattedListObjects)).unwrap();
        setShowConfirmModal(false);
        toast.success("Tạo khoá học thành công");
        navigate("/quan-ly-khoa-hoc/chua-mo");
      }
    } catch (err) {
      setShowConfirmModal(false);
      const msg = getApiErrorMessage(
        err,
        "Không thể tạo khoá học. Vui lòng kiểm tra lại dữ liệu."
      );
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dbDate?: string) => {
    if (!dbDate) return "—";
    const date = new Date(dbDate);
    if (Number.isNaN(date.getTime())) return "—";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="template-container">
      <div className="create-course-container">
        <div className="admin-form-header">
          <div className="admin-form-header__left">
            <span className="admin-form-header__eyebrow">
              Bước 2 / 2 • Phân bổ học phần
            </span>
            <div className="create-course-title">
              <h1>Chi tiết khoá học</h1>
            </div>
            <p className="admin-form-header__subtitle">
              Thiết lập các giai đoạn đào tạo lý thuyết và thực hành trong khung thời gian của khoá học.
            </p>
          </div>
          <div className="admin-form-header__actions">
            <Button
              type="button"
              className="btn btn-primary admin-btn-add-type"
              onClick={handleShow}
            >
              <BsPlusLg aria-hidden="true" />
              <span>Thêm chi tiết mới</span>
            </Button>
            <Link
              to="/quan-ly-khoa-hoc/tao-khoa-hoc"
              className="admin-form-back-btn"
            >
              <BsArrowLeft aria-hidden="true" />
              <span>Quay lại Bước 1</span>
            </Link>
          </div>
        </div>

        <div className="create-course-form">
          {course && course.startDate && course.endDate && (
            <div className="admin-course-period-banner">
              <BsCalendarRange aria-hidden="true" />
              <span>
                Khoá <strong>{course.name || course.courseId}</strong> • Thời
                gian đào tạo:{" "}
                <strong>
                  {formatDate(course.startDate)} – {formatDate(course.endDate)}
                </strong>
              </span>
            </div>
          )}

          <div className="admin-schedule-rules-panel" role="region" aria-label="Quy tắc phân bổ lịch học">
            <div className="admin-schedule-rules-panel__title">
              <BsInfoCircle aria-hidden="true" />
              <span>Quy tắc phân bổ lịch đào tạo</span>
            </div>
            <ul className="admin-schedule-rules-panel__list">
              <li>
                Mọi ngày bắt đầu và kết thúc phải nằm trong khung khoá học{" "}
                <strong>
                  {formatDate(course.startDate)} – {formatDate(course.endDate)}
                </strong>.
              </li>
              <li>
                Mỗi học phần phải kéo dài tối thiểu{" "}
                <strong>{MIN_SECTION_DURATION_DAYS} ngày</strong> (ngày kết thúc
                cách ngày bắt đầu ít nhất {MIN_SECTION_DURATION_DAYS} ngày).
              </li>
              <li>
                Không được chọn trùng nội dung; học phần sau phải bắt đầu{" "}
                <strong>sau ngày kết thúc của học phần trước</strong> (tối thiểu từ
                ngày kết thúc trước + 1 ngày).
              </li>
              <li>
                Ngoại lệ: <em>&ldquo;Thực Hành Trên Đường&rdquo;</em> và{" "}
                <em>&ldquo;Thực Hành Trên Xe Tự Động&rdquo;</em> được phép có cùng
                ngày bắt đầu.
              </li>
            </ul>
          </div>

          {error && (
            <div className="error-message admin-form-alert" role="alert">
              <BsExclamationCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="admin-detail-blocks">
              {inputData.map((row, index) => {
                const sectionCheck = scheduleValidation.sections[index];
                const showContentErr =
                  Boolean(sectionCheck?.contentError) &&
                  (hasAttemptedSubmit || Boolean(row.courseContent));
                const showStartErr =
                  Boolean(sectionCheck?.startDateError) &&
                  (hasAttemptedSubmit || Boolean(row.courseTimeStart));
                const showEndErr =
                  Boolean(sectionCheck?.endDateError) &&
                  (hasAttemptedSubmit || Boolean(row.courseTimeEnd));
                const hasVisibleError =
                  showContentErr || showStartErr || showEndErr;

                return (
                  <div
                    key={index}
                    className={`admin-detail-card ${
                      sectionCheck?.isValid
                        ? "admin-detail-card--valid"
                        : hasVisibleError
                        ? "admin-detail-card--invalid"
                        : ""
                    }`}
                  >
                    <div className="admin-detail-card__header">
                      <div className="admin-detail-card__title-group">
                        <span className="admin-detail-card__badge">
                          Học phần {index + 1}
                        </span>
                        {row.courseContent && (
                          <span className="admin-detail-card__name">
                            {row.courseContent}
                          </span>
                        )}
                      </div>
                      <span
                        className={`admin-detail-status ${
                          sectionCheck?.isValid
                            ? "admin-detail-status--valid"
                            : hasVisibleError
                            ? "admin-detail-status--invalid"
                            : "admin-detail-status--pending"
                        }`}
                      >
                        {sectionCheck?.isValid ? (
                          <>
                            <BsCheckCircleFill aria-hidden="true" />
                            <span>
                              Hợp lệ ({sectionCheck.durationDays} ngày)
                            </span>
                          </>
                        ) : hasVisibleError ? (
                          <>
                            <BsXCircleFill aria-hidden="true" />
                            <span>Cần điều chỉnh</span>
                          </>
                        ) : (
                          <span>Chưa nhập đủ</span>
                        )}
                      </span>
                    </div>

                    <div className="admin-detail-card__requirements">
                      <span>
                        <strong>Khung hợp lệ:</strong> Bắt đầu từ{" "}
                        <strong>
                          {formatYMDToVN(sectionCheck?.requiredStartMin)}
                        </strong>{" "}
                        • Kết thúc tối thiểu{" "}
                        <strong>
                          {formatYMDToVN(sectionCheck?.requiredEndMin)}
                        </strong>{" "}
                        (tối thiểu {MIN_SECTION_DURATION_DAYS} ngày) – tối đa{" "}
                        <strong>
                          {formatYMDToVN(sectionCheck?.requiredEndMax)}
                        </strong>
                      </span>
                      {sectionCheck?.specialNote && (
                        <span className="admin-detail-card__special-note">
                          {sectionCheck.specialNote}
                        </span>
                      )}
                    </div>

                    <div className="admin-form-grid">
                      <div className="form-group form-group--full">
                        <label
                          htmlFor={`courseContent${index + 1}`}
                          className="col-form-label"
                        >
                          Nội dung {index + 1}{" "}
                          <span className="required-mark">*</span>
                        </label>
                        <select
                          className={`form-control ${
                            showContentErr ? "is-invalid" : ""
                          }`}
                          id={`courseContent${index + 1}`}
                          name={`courseContent${index + 1}`}
                          value={row.courseContent}
                          required
                          onChange={(e) =>
                            handleChange(index, "courseContent", e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Chọn nội dung khoá học
                          </option>
                          {courseContent.map((content) => (
                            <option
                              value={content.courseContent1}
                              key={content.courseContent1}
                            >
                              {content.courseContent1}
                            </option>
                          ))}
                        </select>
                        {showContentErr && (
                          <small className="field-error" role="alert">
                            {sectionCheck.contentError}
                          </small>
                        )}
                      </div>

                      <div className="form-group">
                        <label
                          htmlFor={`startDate${index + 1}`}
                          className="col-form-label"
                        >
                          Ngày bắt đầu <span className="required-mark">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${
                            showStartErr ? "is-invalid" : ""
                          }`}
                          id={`startDate${index + 1}`}
                          name={`courseTimeStart${index + 1}`}
                          value={row.courseTimeStart}
                          min={sectionCheck?.requiredStartMin || undefined}
                          max={sectionCheck?.requiredEndMax || undefined}
                          required
                          onChange={(e) =>
                            handleChange(index, "courseTimeStart", e.target.value)
                          }
                        />
                        {showStartErr ? (
                          <small className="field-error" role="alert">
                            {sectionCheck.startDateError}
                          </small>
                        ) : (
                          <small className="field-hint">
                            Tối thiểu từ:{" "}
                            {formatYMDToVN(sectionCheck?.requiredStartMin)}
                          </small>
                        )}
                      </div>

                      <div className="form-group">
                        <label
                          htmlFor={`endDate${index + 1}`}
                          className="col-form-label"
                        >
                          Ngày kết thúc <span className="required-mark">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${
                            showEndErr ? "is-invalid" : ""
                          }`}
                          id={`endDate${index + 1}`}
                          name={`courseTimeEnd${index + 1}`}
                          value={row.courseTimeEnd}
                          min={sectionCheck?.requiredEndMin || undefined}
                          max={sectionCheck?.requiredEndMax || undefined}
                          required
                          onChange={(e) =>
                            handleChange(index, "courseTimeEnd", e.target.value)
                          }
                        />
                        {showEndErr ? (
                          <small className="field-error" role="alert">
                            {sectionCheck.endDateError}
                          </small>
                        ) : (
                          <small className="field-hint">
                            Tối thiểu từ:{" "}
                            {formatYMDToVN(sectionCheck?.requiredEndMin)} (cách
                            ngày bắt đầu ≥ {MIN_SECTION_DURATION_DAYS} ngày)
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="admin-form-actions admin-form-actions--between">
              <button
                className="btn btn-info admin-btn-add-row"
                type="button"
                onClick={handleAddInput}
              >
                <BsPlusCircle aria-hidden="true" />
                <span>Thêm nội dung</span>
              </button>

              <div className="admin-form-actions__right">
                <Link
                  to="/quan-ly-khoa-hoc/tao-khoa-hoc"
                  className="btn admin-btn-cancel"
                >
                  Quay lại
                </Link>
                <button
                  className="btn btn-primary admin-btn-submit"
                  type="submit"
                >
                  Xem lại &amp; Tạo khoá học
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={true}
        backdropClassName="backdrop"
        dialogClassName="admin-course-detail-modal"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm danh mục nội dung đào tạo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="courseContentAdd">
            <label htmlFor="newCourseContentInput" className="col-form-label">
              Tên nội dung đào tạo:
            </label>
            <input
              id="newCourseContentInput"
              type="text"
              className="form-control"
              placeholder="Nhập tên nội dung học phần..."
              value={courseContentInput.courseContent1}
              onChange={(e) =>
                setCourseContenInput({
                  ...courseContentInput,
                  courseContent1: e.target.value,
                })
              }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button
            className="btn btn-primary"
            onClick={() => void handleAddCourseContent()}
          >
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showConfirmModal}
        onHide={() => {
          if (!isSubmitting) setShowConfirmModal(false);
        }}
        backdrop="static"
        keyboard={!isSubmitting}
        backdropClassName="backdrop"
        dialogClassName="admin-course-confirm-modal"
        centered
        size="lg"
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>Xác nhận lịch đào tạo &amp; tạo khoá học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="admin-confirm-summary">
            <div className="admin-confirm-summary__course">
              <div>
                <strong>Khoá học:</strong> {course.name || "—"} (
                {course.courseId || "—"})
              </div>
              <div>
                <strong>Thời gian tổng:</strong>{" "}
                {formatDate(course.startDate)} – {formatDate(course.endDate)}
              </div>
            </div>

            {!scheduleValidation.isValid && (
              <div className="admin-confirm-summary__alert" role="alert">
                <BsExclamationCircle aria-hidden="true" />
                <span>
                  Lịch học chưa hợp lệ. Vui lòng đóng hộp thoại và sửa các học
                  phần được đánh dấu lỗi trước khi xác nhận.
                </span>
              </div>
            )}

            <div className="admin-confirm-summary__list">
              {scheduleValidation.sections.map((section) => {
                const row = inputData[section.index];
                return (
                  <div
                    key={section.index}
                    className={`admin-confirm-row ${
                      section.isValid
                        ? "admin-confirm-row--valid"
                        : "admin-confirm-row--invalid"
                    }`}
                  >
                    <div className="admin-confirm-row__top">
                      <span className="admin-confirm-row__title">
                        Học phần {section.index + 1}:{" "}
                        <strong>
                          {section.contentName || "Chưa chọn nội dung"}
                        </strong>
                      </span>
                      <span
                        className={`admin-confirm-row__badge ${
                          section.isValid
                            ? "admin-confirm-row__badge--valid"
                            : "admin-confirm-row__badge--invalid"
                        }`}
                      >
                        {section.isValid ? "Hợp lệ" : "Không hợp lệ"}
                      </span>
                    </div>
                    <div className="admin-confirm-row__dates">
                      {formatYMDToVN(row.courseTimeStart)} –{" "}
                      {formatYMDToVN(row.courseTimeEnd)}
                      {section.durationDays !== null
                        ? ` (${section.durationDays} ngày)`
                        : ""}
                    </div>
                    {!section.isValid && section.errors.length > 0 && (
                      <ul className="admin-confirm-row__errors">
                        {section.errors.map((errMsg, errIdx) => (
                          <li key={errIdx}>{errMsg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => setShowConfirmModal(false)}
          >
            Quay lại chỉnh sửa
          </Button>
          <Button
            className="btn btn-primary"
            disabled={!scheduleValidation.isValid || isSubmitting}
            onClick={() => void handleConfirmCreateCourse()}
          >
            {isSubmitting ? "Đang tạo khoá học..." : "Xác nhận tạo khoá học"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
