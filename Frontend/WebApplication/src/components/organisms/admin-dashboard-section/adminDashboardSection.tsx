import { useCallback, useEffect, useState } from "react";
import {
  BsArrowClockwise,
  BsExclamationTriangle,
  BsFillPersonCheckFill,
  BsFillPersonLinesFill,
  BsJournalBookmarkFill,
  BsPeopleFill,
} from "react-icons/bs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../../config/axios";
import { useAppDispatch } from "../../../app/store";
import { fetchCourseList } from "../../../features/courses/coursesSlice";
import "./admin-dashboard-section.scss";

interface UserCounts {
  admin: number;
  staff: number;
  mentor: number;
  member: number;
}

interface ApiUserItem {
  roleId?: number;
}

interface ApiCourseItem {
  name?: string;
  numberOfStudents?: number;
  limitStudent?: number;
}

interface CourseChartPoint {
  name: string;
  numberOfStudents: number;
  limitStudent: number;
}

const INITIAL_COUNTS: UserCounts = {
  admin: 0,
  staff: 0,
  mentor: 0,
  member: 0,
};

function Home() {
  const dispatch = useAppDispatch();
  const [userCounts, setUserCounts] = useState<UserCounts>(INITIAL_COUNTS);
  const [courseData, setCourseData] = useState<CourseChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [usersResult, coursesResult] = await Promise.allSettled([
      api.get("Users"),
      dispatch(fetchCourseList()).unwrap(),
    ]);

    const errors: string[] = [];

    if (usersResult.status === "fulfilled") {
      const rawUsers: ApiUserItem[] = Array.isArray(usersResult.value.data)
        ? usersResult.value.data
        : [];

      const counts = rawUsers.reduce<UserCounts>(
        (result, user) => {
          if (user.roleId === 1) {
            result.admin += 1;
          } else if (user.roleId === 2) {
            result.staff += 1;
          } else if (user.roleId === 3) {
            result.mentor += 1;
          } else if (user.roleId === 4) {
            result.member += 1;
          }
          return result;
        },
        { admin: 0, staff: 0, mentor: 0, member: 0 }
      );

      setUserCounts(counts);
    } else {
      console.error(
        "Error fetching data from the API:",
        usersResult.reason
      );
      errors.push("danh sách người dùng");
    }

    if (coursesResult.status === "fulfilled") {
      const rawCourses: ApiCourseItem[] = Array.isArray(coursesResult.value)
        ? coursesResult.value
        : [];

      const formattedData: CourseChartPoint[] = rawCourses.map((course) => ({
        name: course.name ?? "Khóa học",
        numberOfStudents: Number(course.numberOfStudents ?? 0),
        limitStudent: Number(course.limitStudent ?? 0),
      }));

      setCourseData(formattedData);
    } else {
      console.error(
        "Error fetching course data from the API:",
        coursesResult.reason
      );
      errors.push("danh sách khóa học");
    }

    if (errors.length > 0) {
      setErrorMessage(
        `Không thể tải dữ liệu ${errors.join(" và ")} từ máy chủ. Vui lòng kiểm tra kết nối và thử lại.`
      );
    }

    setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const totalUsers =
    userCounts.member +
    userCounts.mentor +
    userCounts.staff +
    userCounts.admin;

  return (
    <main className="main-container admin-dashboard">
<div className="main-title dashboard-header">
        <div>
          <span className="dashboard-eyebrow">FDriving Admin</span>
          <h3>Bảng điều khiển</h3>
          <p className="dashboard-subtitle">
            Tổng quan người dùng hệ thống và thống kê quy mô học viên theo khóa học
          </p>
        </div>

        <div className="dashboard-header-actions">
          <span className="dashboard-total-pill">
            Tổng tài khoản: <strong>{isLoading ? "..." : totalUsers}</strong>
          </span>
          <button
            type="button"
            className="dashboard-refresh-btn"
            onClick={() => void loadDashboardData()}
            disabled={isLoading}
          >
            <BsArrowClockwise aria-hidden="true" />
            <span>{isLoading ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="dashboard-alert" role="alert">
          <div className="dashboard-alert-content">
            <BsExclamationTriangle aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            className="dashboard-refresh-btn"
            onClick={() => void loadDashboardData()}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="main-cards">
        <div className="card">
          <div className="card-inner">
            <div>
              <h3>Học viên</h3>
              <span className="card-role-caption">Thành viên & học viên (Role 4)</span>
            </div>
            <span className="card-icon-badge" aria-hidden="true">
              <BsPeopleFill className="card_icon" />
            </span>
          </div>
          <h1>{isLoading ? "—" : userCounts.member}</h1>
        </div>

        <div className="card">
          <div className="card-inner">
            <div>
              <h3>Giáo viên</h3>
              <span className="card-role-caption">Giảng viên đào tạo (Role 3)</span>
            </div>
            <span className="card-icon-badge" aria-hidden="true">
              <BsPeopleFill className="card_icon" />
            </span>
          </div>
          <h1>{isLoading ? "—" : userCounts.mentor}</h1>
        </div>

        <div className="card">
          <div className="card-inner">
            <div>
              <h3>Nhân viên</h3>
              <span className="card-role-caption">Điều phối & nghiệp vụ (Role 2)</span>
            </div>
            <span className="card-icon-badge" aria-hidden="true">
              <BsFillPersonCheckFill className="card_icon" />
            </span>
          </div>
          <h1>{isLoading ? "—" : userCounts.staff}</h1>
        </div>

        <div className="card">
          <div className="card-inner">
            <div>
              <h3>Quản trị viên</h3>
              <span className="card-role-caption">Quản trị hệ thống (Role 1)</span>
            </div>
            <span className="card-icon-badge" aria-hidden="true">
              <BsFillPersonLinesFill className="card_icon" />
            </span>
          </div>
          <h1>{isLoading ? "—" : userCounts.admin}</h1>
        </div>
      </div>

      <div className="dashboard-section-header">
        <div className="chart-title">
          <h3>Bảng thống kê khóa học theo tháng</h3>
          <p className="chart-subtitle">
            So sánh số lượng học viên đăng ký thực tế và chỉ tiêu tối đa của từng khóa học
          </p>
        </div>
      </div>

      {!isLoading && courseData.length === 0 ? (
        <div className="chart-empty-card" role="status">
          <BsJournalBookmarkFill className="chart-empty-icon" aria-hidden="true" />
          <p className="chart-empty-title">Chưa có dữ liệu khóa học</p>
          <p className="chart-empty-desc">
            Biểu đồ thống kê sẽ tự động hiển thị khi hệ thống có danh sách khóa học.
          </p>
        </div>
      ) : (
        <div className="charts">
          <div className="chart-panel">
            <div className="chart-panel-header">
              <h4 className="chart-panel-title">Biểu đồ cột quy mô học viên</h4>
              <span className="chart-panel-tag">{courseData.length} khóa học</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                width={500}
                height={300}
                data={courseData}
                margin={{
                  top: 8,
                  right: 24,
                  left: 4,
                  bottom: 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="numberOfStudents"
                  name="Số học viên"
                  fill="#1e62b6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="limitStudent"
                  name="Số học viên tối đa"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-panel">
            <div className="chart-panel-header">
              <h4 className="chart-panel-title">Xu hướng học viên & chỉ tiêu tối đa</h4>
              <span className="chart-panel-tag">So sánh theo khóa</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                width={500}
                height={300}
                data={courseData}
                margin={{
                  top: 8,
                  right: 24,
                  left: 4,
                  bottom: 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="numberOfStudents"
                  name="Số học viên"
                  stroke="#1e62b6"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="limitStudent"
                  name="Số học viên tối đa"
                  stroke="#0f766e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
