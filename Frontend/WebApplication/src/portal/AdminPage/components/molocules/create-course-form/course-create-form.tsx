import React, { useCallback, useEffect, useState } from "react";
import "./create-course-form.scss";
import api from "../../../../../config/axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Modal } from "react-bootstrap";
import {
  BsArrowLeft,
  BsCalendarRange,
  BsExclamationCircle,
  BsPlusCircle,
  BsPlusLg,
} from "react-icons/bs";

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
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { error?: string } } }).response?.data
      ?.error === "string"
  ) {
    return (err as { response: { data: { error: string } } }).response.data
      .error;
  }
  return fallback;
}

// ------------------ CreateCourseForm ------------------
function CreateCourseForm() {
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
      const response = await api.get("Mentor/theory");
      setMentorName(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const msg = getApiErrorMessage(err, "");
      if (msg) setError(msg);
    }
  }, []);

  const getCourseIdList = useCallback(async () => {
    try {
      const response = await api.get("Course/list");
      const res: CourseSummaryItem[] = Array.isArray(response.data)
        ? response.data
        : [];
      setCourseIdList(res.map((course) => course.courseId));
    } catch (err) {
      const msg = getApiErrorMessage(err, "");
      if (msg) setError(msg);
    }
  }, []);

  const getCourseNameList = useCallback(async () => {
    try {
      const response = await api.get("Course/list");
      const res: CourseSummaryItem[] = Array.isArray(response.data)
        ? response.data
        : [];
      setCourseNameList(res.map((course) => course.name));
    } catch (err) {
      const msg = getApiErrorMessage(err, "");
      if (msg) setError(msg);
    }
  }, []);

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
                required
                onChange={(e) =>
                  setInputData({ ...inputData, endDate: e.target.value })
                }
              />
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

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
      const response = await api.get("CourseContent");
      const res: CourseContentOption[] = Array.isArray(response.data)
        ? response.data
        : [];
      setCourseContent(res);
    } catch (err) {
      const msg = getApiErrorMessage(err, "");
      if (msg) setError(msg);
    }
  }, []);

  const handleAddCourseContent = async () => {
    if (!courseContentInput.courseContent1.trim()) {
      setError("Vui lòng nhập tên nội dung đào tạo.");
      return;
    }
    try {
      await api.post("CourseContent/add", courseContentInput);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!courseId || !course.startDate || !course.endDate) {
      setError(
        "Không tìm thấy thông tin khoá học từ Bước 1. Vui lòng quay lại trang Tạo khoá học."
      );
      return;
    }

    try {
      for (let i = 0; i < inputData.length; i++) {
        const row = inputData[i];
        if (!row.courseContent || !row.courseTimeStart || !row.courseTimeEnd) {
          setError(`Vui lòng nhập đầy đủ thông tin cho Nội dung ${i + 1}.`);
          return;
        }

        const startDateParts = row.courseTimeStart.split("-");
        const endDateParts = row.courseTimeEnd.split("-");
        const startDate = parseInt(startDateParts[2], 10);
        const endDate = parseInt(endDateParts[2], 10);

        const startMonth = parseInt(startDateParts[1], 10);
        const endMonth = parseInt(endDateParts[1], 10);

        // ngày bắt đầu lớn hơn ngày kết thúc
        if (row.courseTimeStart > row.courseTimeEnd) {
          setError(
            `Nội dung ${i + 1} có ngày bắt đầu lớn hơn ngày kết thúc.`
          );
          return;
          // ngày bắt đầu bé hơn ngày khai giảng
        } else if (row.courseTimeStart < course.startDate) {
          setError(
            `Nội dung ${i + 1} có ngày bắt đầu bé hơn ngày khai giảng.`
          );
          return;
          // ngày kết thúc lớn hơn ngày bế giảng
        } else if (row.courseTimeEnd > course.endDate) {
          setError(
            `Nội dung ${i + 1} có ngày kết thúc lớn hơn ngày bế giảng.`
          );
          return;
          // Fix BUG-ADM-06: Removed duplicate (courseTimeEnd < courseTimeStart) check so the 7-day minimum duration check actually runs
        } else if (endMonth - startMonth < 1 && endDate - startDate < 7) {
          setError(
            `Nội dung ${i + 1} có ngày kết thúc phải cách ngày bắt đầu là 7 ngày.`
          );
          return;
        }

        for (let j = i + 1; j < inputData.length; j++) {
          const nextRow = inputData[j];
          // so nội dung bị trùng
          if (row.courseContent === nextRow.courseContent) {
            setError(`Nội dung ${i + 1} và nội dung ${j + 1} bị trùng.`);
            return;
            // so sánh trùng ngày bắt đầu
          } else if (row.courseTimeStart === nextRow.courseTimeStart) {
            if (
              row.courseContent === "Thực Hành Trên Đường" &&
              nextRow.courseContent === "Thực Hành Trên Xe Tự Động"
            ) {
              continue;
            } else {
              setError(
                `Nội dung ${i + 1} và nội dung ${j + 1} có ngày bắt đầu trùng nhau.`
              );
              return;
            }
            // ngày bắt đầu của j phải lớn hơn ngày kết thúc của i
          } else if (nextRow.courseTimeStart <= row.courseTimeEnd) {
            setError(
              `Nội dung ${j + 1} có ngày bắt đầu bé hơn hoặc bằng ngày kết thúc của nội dung ${i + 1}.`
            );
            return;
          }
        }
      }

      const formattedListObjects = inputData.map((data) => ({ ...data }));

      // Create course first
      const response = await api.post("Course/add", course);

      // If success then adding course details
      if (response.status === 200) {
        await api.post("CourseDetails/add", formattedListObjects, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        toast.success("Tạo khoá học thành công");
        navigate("/quan-ly-khoa-hoc/chua-mo");
      }
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể tạo khoá học. Vui lòng kiểm tra lại dữ liệu."
      );
      setError(msg);
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

          {error && (
            <div className="error-message admin-form-alert" role="alert">
              <BsExclamationCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="admin-detail-blocks">
              {inputData.map((row, index) => (
                <div key={index} className="admin-detail-card">
                  <div className="admin-detail-card__header">
                    <span className="admin-detail-card__badge">
                      Học phần {index + 1}
                    </span>
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
                        className="form-control"
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
                        className="form-control"
                        id={`startDate${index + 1}`}
                        name={`courseTimeStart${index + 1}`}
                        value={row.courseTimeStart}
                        required
                        onChange={(e) =>
                          handleChange(index, "courseTimeStart", e.target.value)
                        }
                      />
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
                        className="form-control"
                        id={`endDate${index + 1}`}
                        name={`courseTimeEnd${index + 1}`}
                        value={row.courseTimeEnd}
                        required
                        onChange={(e) =>
                          handleChange(index, "courseTimeEnd", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                  Tạo khoá học
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
    </div>
  );
}
