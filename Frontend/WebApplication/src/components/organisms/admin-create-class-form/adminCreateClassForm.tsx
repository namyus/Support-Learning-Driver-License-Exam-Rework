import React, { useCallback, useEffect, useState } from "react";
import './admin-create-class-form.scss';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Button, Modal } from "react-bootstrap";
import {
  BsArrowLeft,
  BsCalendarRange,
  BsExclamationCircle,
  BsPlusCircle,
  BsPlusLg,
} from "react-icons/bs";
import { useAppDispatch } from "../../../app/store";
import {
  addCurriculum,
  createPracticeLesson,
  createTheoryLesson,
  fetchClassDates,
  fetchCurriculumList,
} from "../../../features/classes/classesSlice";
import {
  fetchCourseDetailsByCourseId,
  fetchCourseList,
} from "../../../features/courses/coursesSlice";
import type { ApiRejectedPayload } from "../../../features/shared/apiError";

interface CourseDetailPeriod {
  courseDetailsId?: number | string;
  courseContent: string;
  courseTimeStart: string;
  courseTimeEnd: string;
}

interface CurriculumItem {
  content: string;
  isTheory?: boolean;
}

interface TheoryLessonRow {
  lessonContent?: string;
  location?: string;
  date?: string;
}

interface PracticeLessonRow {
  courseDetailsId?: string;
  location?: string;
  date?: string;
}

function getStoredValue(key: string): string {
  const raw = localStorage.getItem(key) || "";
  return raw.replace(/^"|"$/g, "").trim();
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null) {
    const apiErr = err as ApiRejectedPayload;
    if (typeof apiErr.error === "string" && apiErr.error.trim()) {
      return apiErr.error;
    }
    if (
      "response" in err &&
      typeof (err as { response?: { data?: { error?: string } } }).response
        ?.data?.error === "string"
    ) {
      return (err as { response: { data: { error: string } } }).response.data
        .error;
    }
  }
  return fallback;
}

function formatDate(dbDate?: string): string {
  if (!dbDate) return "—";
  const date = new Date(dbDate);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ------------------------------ CreateTheoryLesson ------------------------------
function CreateTheoryLesson() {
  const dispatch = useAppDispatch();
  // Fix BUG-ADM-12: Safely normalize courseId regardless of whether it was stored raw or JSON-quoted
  const courseId = getStoredValue("courseId");
  const [error, setError] = useState<string | null>(null);
  const [, setCourseIdList] = useState<string[]>([]);
  const [firstCourseDetail, setFirstCourseDetail] =
    useState<CourseDetailPeriod | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [curriculumInput, setCurriculumInput] = useState({
    content: "",
    isTheory: true,
  });

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [inputData, setInputData] = useState<TheoryLessonRow[]>([{}]);

  const navigate = useNavigate();

  const getCourseList = useCallback(async () => {
    try {
      const res = await dispatch(fetchCourseList()).unwrap();
      setCourseIdList(res.map((course) => course.courseId));
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const getCurriculum = useCallback(async () => {
    try {
      const res = await dispatch(fetchCurriculumList()).unwrap();
      setCurriculum(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const getFirstCourseDetails = useCallback(async () => {
    if (!courseId) return;
    try {
      const { details } = await dispatch(
        fetchCourseDetailsByCourseId(courseId)
      ).unwrap();
      setFirstCourseDetail(details[0] ?? null);
    } catch (err) {
      console.error(err);
    }
  }, [courseId, dispatch]);

  const handleInputChange = (
    index: number,
    fieldName: keyof TheoryLessonRow,
    value: string
  ) => {
    setInputData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [fieldName]: value };
      return next;
    });
  };

  const handleAddCurriculum = async () => {
    if (!curriculumInput.content.trim()) {
      setError("Vui lòng nhập nội dung chương trình học.");
      return;
    }
    try {
      await dispatch(addCurriculum(curriculumInput)).unwrap();
      handleClose();
      setCurriculumInput({ content: "", isTheory: true });
      toast.success("Thêm nội dung thành công");
      await getCurriculum();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Không thể thêm nội dung mới.");
      setError(msg);
      void Swal.fire({
        title: "Lỗi",
        text: msg,
        icon: "error",
        confirmButtonText: "Đóng",
        allowEscapeKey: true,
      });
    }
  };

  const handleAddInput = () => {
    setInputData((prevInputData) => [...prevInputData, {}]);
  };

  // Fix BUG-ADM-13: Trigger Swal.fire() in the submit handler instead of synchronously during render
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await dispatch(
        createTheoryLesson({ courseId, lessons: inputData })
      ).unwrap();
      navigate("/quan-ly-lich-hoc/lop-ly-thuyet");
      toast.success("Tạo lịch học lý thuyết thành công!");
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể tạo lịch học lý thuyết. Vui lòng kiểm tra lại dữ liệu."
      );
      setError(msg);
      void Swal.fire({
        title: "Lỗi",
        text: msg,
        icon: "error",
        confirmButtonText: "Đóng",
        allowEscapeKey: true,
      });
    }
  };

  useEffect(() => {
    void getCourseList();
    void getFirstCourseDetails();
    void getCurriculum();
  }, [getCourseList, getFirstCourseDetails, getCurriculum]);

  return (
    <div className="template-container">
      <div className="create-class-container">
        <div className="admin-form-header">
          <div className="admin-form-header__left">
            <span className="admin-form-header__eyebrow">
              Quản lý lịch học • Lý thuyết
            </span>
            <div className="create-class-title">
              <h1>Tạo lịch học lý thuyết</h1>
            </div>
            <p className="admin-form-header__subtitle">
              Phân bổ nội dung giảng dạy, địa điểm và ngày học lý thuyết cho khoá đào tạo.
            </p>
          </div>
          <div className="admin-form-header__actions">
            {courseId && (
              <Button
                type="button"
                className="btn btn-primary admin-btn-add-type"
                onClick={handleShow}
              >
                <BsPlusLg aria-hidden="true" />
                <span>Thêm chi tiết</span>
              </Button>
            )}
            <Link
              to="/quan-ly-lich-hoc/lop-ly-thuyet"
              className="admin-form-back-btn"
            >
              <BsArrowLeft aria-hidden="true" />
              <span>Quay lại danh sách</span>
            </Link>
          </div>
        </div>

        <div className="create-class-form">
          {firstCourseDetail && (
            <div className="admin-schedule-banner">
              <BsCalendarRange aria-hidden="true" />
              <span>
                Đào tạo lý thuyết từ ngày:{" "}
                <strong>
                  {formatDate(firstCourseDetail.courseTimeStart)} –{" "}
                  {formatDate(firstCourseDetail.courseTimeEnd)}
                </strong>
              </span>
            </div>
          )}

          {error && (
            <div className="admin-form-alert" role="alert">
              <BsExclamationCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {courseId && (
              <div className="form-group">
                <label htmlFor="courseId" className="col-form-label">
                  Mã khóa học
                </label>
                <select
                  className="form-control"
                  id="courseId"
                  name="courseId"
                  value={courseId}
                  disabled
                >
                  <option value={courseId}>{courseId}</option>
                </select>
              </div>
            )}

            <div className="admin-lesson-blocks">
              {inputData.map((row, idx) => (
                <div key={idx} className="admin-lesson-card">
                  <div className="admin-lesson-card__header">
                    <span className="admin-lesson-card__badge">
                      Buổi học {idx + 1}
                    </span>
                  </div>

                  <div className="admin-form-grid">
                    <div className="form-group form-group--full">
                      <label
                        htmlFor={`lessonContent-${idx}`}
                        className="col-form-label"
                      >
                        Nội dung {idx + 1}{" "}
                        <span className="required-mark">*</span>
                      </label>
                      <select
                        className="form-control"
                        id={`lessonContent-${idx}`}
                        name="lessonContent"
                        value={row.lessonContent || ""}
                        required
                        onChange={(e) =>
                          handleInputChange(
                            idx,
                            "lessonContent",
                            e.target.value
                          )
                        }
                      >
                        <option value="" disabled>
                          Chọn nội dung
                        </option>
                        {curriculum.map((item) => (
                          <option value={item.content} key={item.content}>
                            {item.content}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor={`location-${idx}`}
                        className="col-form-label"
                      >
                        Địa điểm
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`location-${idx}`}
                        name="location"
                        placeholder="Nhập phòng học / địa điểm..."
                        value={row.location || ""}
                        onChange={(e) =>
                          handleInputChange(idx, "location", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor={`date-${idx}`}
                        className="col-form-label"
                      >
                        Ngày học
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id={`date-${idx}`}
                        name="status"
                        value={row.date || ""}
                        onChange={(e) =>
                          handleInputChange(idx, "date", e.target.value)
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
                  to="/quan-ly-lich-hoc/lop-ly-thuyet"
                  className="btn admin-btn-cancel"
                >
                  Huỷ bỏ
                </Link>
                <button
                  className="btn btn-primary admin-btn-submit"
                  type="submit"
                >
                  Tạo lịch học
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
        dialogClassName="admin-class-detail-modal"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm chi tiết chương trình lý thuyết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="courseContentAdd">
            <label htmlFor="newCurriculumContent" className="col-form-label">
              Nội dung:
            </label>
            <input
              id="newCurriculumContent"
              type="text"
              className="form-control"
              placeholder="Nhập tên nội dung giảng dạy..."
              value={curriculumInput.content}
              onChange={(e) =>
                setCurriculumInput({
                  ...curriculumInput,
                  content: e.target.value,
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
            onClick={() => void handleAddCurriculum()}
          >
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CreateTheoryLesson;

// ------------------------------ CreatePracticeLesson ------------------------------
export function CreatePracticeLesson() {
  const dispatch = useAppDispatch();
  const classId = getStoredValue("classId");
  // Fix BUG-ADM-12: Safely normalize courseId without throwing SyntaxError on plain strings
  const courseId = getStoredValue("courseId");
  const [error, setError] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetailPeriod[]>([]);
  const [inputData, setInputData] = useState<PracticeLessonRow[]>([{}]);
  const navigate = useNavigate();
  const [dateByClassList, setDateByClassList] = useState<string[]>([]);

  const handleInputChange = (
    index: number,
    fieldName: keyof PracticeLessonRow,
    value: string
  ) => {
    setInputData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [fieldName]: value };
      return next;
    });
  };

  const getDateByClass = useCallback(async () => {
    if (!classId) return;
    try {
      const res = await dispatch(fetchClassDates(classId)).unwrap();
      setDateByClassList(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  }, [classId, dispatch]);

  const getCourseDetails = useCallback(async () => {
    if (!courseId) return;
    try {
      const { details } = await dispatch(
        fetchCourseDetailsByCourseId(courseId)
      ).unwrap();
      const filter = details.filter(
        (course) => !course.courseContent?.includes("Lý Thuyết")
      );
      setCourseDetails(filter);
    } catch (err) {
      console.error(err);
    }
  }, [courseId, dispatch]);

  const handleAddInput = () => {
    setInputData((prevInputData) => [...prevInputData, {}]);
  };

  useEffect(() => {
    void getCourseDetails();
    void getDateByClass();
  }, [getCourseDetails, getDateByClass]);

  // Fix BUG-ADM-13: Trigger Swal.fire() inside the submit catch block instead of during render
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await dispatch(
        createPracticeLesson({ classId, lessons: inputData })
      ).unwrap();
      toast.success("Tạo lịch học thực hành thành công!");
      navigate("/quan-ly-lich-hoc/lop-thuc-hanh");
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể tạo lịch học thực hành. Vui lòng kiểm tra lại dữ liệu."
      );
      setError(msg);
      void Swal.fire({
        title: "Lỗi",
        text: msg,
        icon: "error",
        confirmButtonText: "Đóng",
        allowEscapeKey: true,
      });
    }
  };

  return (
    <div className="template-container">
      <div className="create-class-container">
        <div className="admin-form-header">
          <div className="admin-form-header__left">
            <span className="admin-form-header__eyebrow">
              Quản lý lịch học • Thực hành
            </span>
            <div className="create-class-title">
              <h1>Tạo lịch học thực hành</h1>
            </div>
            <p className="admin-form-header__subtitle">
              Thiết lập lịch học thực hành theo từng giai đoạn đào tạo cho lớp học đã chọn.
            </p>
          </div>
          <div className="admin-form-header__actions">
            <Link
              to="/quan-ly-lich-hoc/lop-thuc-hanh"
              className="admin-form-back-btn"
            >
              <BsArrowLeft aria-hidden="true" />
              <span>Quay lại danh sách</span>
            </Link>
          </div>
        </div>

        <div className="create-class-form">
          {courseDetails.length > 0 ? (
            <div className="admin-schedule-periods">
              <div className="admin-schedule-periods__title">
                <BsCalendarRange aria-hidden="true" />
                <span>Khung thời gian các học phần thực hành ({courseId || "—"}):</span>
              </div>
              <ul className="admin-schedule-periods__list">
                {courseDetails.map((content, i) => (
                  <li key={content.courseDetailsId ?? i}>
                    <strong>{content.courseContent}:</strong>{" "}
                    <span>
                      {formatDate(content.courseTimeStart)} –{" "}
                      {formatDate(content.courseTimeEnd)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="admin-schedule-banner">
              <BsCalendarRange aria-hidden="true" />
              <span>Chưa có dữ liệu giai đoạn đào tạo thực hành.</span>
            </div>
          )}

          {error && (
            <div className="admin-form-alert" role="alert">
              <BsExclamationCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {classId && (
              <div className="form-group">
                <label htmlFor="classId" className="col-form-label">
                  Mã lớp học
                </label>
                <select
                  className="form-control"
                  id="classId"
                  name="classId"
                  value={classId}
                  disabled
                >
                  <option value={classId}>{classId}</option>
                </select>
              </div>
            )}

            <div className="admin-lesson-blocks">
              {inputData.map((row, idx) => (
                <div key={idx} className="admin-lesson-card">
                  <div className="admin-lesson-card__header">
                    <span className="admin-lesson-card__badge">
                      Buổi thực hành {idx + 1}
                    </span>
                  </div>

                  <div className="admin-form-grid">
                    <div className="form-group form-group--full">
                      <label
                        htmlFor={`courseDetailsId-${idx}`}
                        className="col-form-label"
                      >
                        Nội dung {idx + 1}{" "}
                        <span className="required-mark">*</span>
                      </label>
                      <select
                        className="form-control"
                        id={`courseDetailsId-${idx}`}
                        name="courseDetailsId"
                        value={row.courseDetailsId || ""}
                        required
                        onChange={(e) =>
                          handleInputChange(
                            idx,
                            "courseDetailsId",
                            e.target.value
                          )
                        }
                      >
                        <option value="" disabled>
                          Chọn nội dung
                        </option>
                        {courseDetails.map((details) => (
                          <option
                            value={details.courseDetailsId}
                            key={details.courseDetailsId}
                          >
                            {details.courseContent}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor={`practice-location-${idx}`}
                        className="col-form-label"
                      >
                        Địa điểm
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`practice-location-${idx}`}
                        name="location"
                        placeholder="Nhập sân tập / tuyến đường..."
                        value={row.location || ""}
                        onChange={(e) =>
                          handleInputChange(idx, "location", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor={`practice-date-${idx}`}
                        className="col-form-label"
                      >
                        Ngày học <span className="required-mark">*</span>
                      </label>
                      <select
                        className="form-control"
                        id={`practice-date-${idx}`}
                        name="date"
                        value={row.date || ""}
                        required
                        onChange={(e) =>
                          handleInputChange(idx, "date", e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Chọn ngày
                        </option>
                        {dateByClassList.map((date) => (
                          <option value={date} key={date}>
                            {formatDate(date)}
                          </option>
                        ))}
                      </select>
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
                  to="/quan-ly-lich-hoc/lop-thuc-hanh"
                  className="btn admin-btn-cancel"
                >
                  Huỷ bỏ
                </Link>
                <button
                  className="btn btn-primary admin-btn-submit"
                  type="submit"
                >
                  Tạo lịch học
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
