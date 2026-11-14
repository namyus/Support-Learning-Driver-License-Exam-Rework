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
import api from "../../../../../config/axios";

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
  const [userCounts, setUserCounts] = useState<UserCounts>(INITIAL_COUNTS);
  const [courseData, setCourseData] = useState<CourseChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [usersResult, coursesResult] = await Promise.allSettled([
      api.get("Users"),
      api.get("Course/list"),
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
      const rawCourses: ApiCourseItem[] = Array.isArray(
        coursesResult.value.data
      )
        ? coursesResult.value.data
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
  }, []);

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
      <style>{`
        .admin-layout .admin-dashboard {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .admin-layout .admin-dashboard .dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 0;
          padding-bottom: 18px;
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-layout .admin-dashboard .dashboard-eyebrow {
          display: inline-block;
          margin-bottom: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          background-color: rgba(30, 98, 182, 0.1);
          color: #1e62b6;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .admin-layout .admin-dashboard .dashboard-subtitle {
          margin: 4px 0 0;
          color: #475569;
          font-size: 0.9rem;
        }
        .admin-layout .admin-dashboard .dashboard-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .admin-layout .admin-dashboard .dashboard-total-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 999px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 0.84rem;
          font-weight: 600;
        }
        .admin-layout .admin-dashboard .dashboard-total-pill strong {
          color: #0f172a;
          font-weight: 700;
        }
        .admin-layout .admin-dashboard .dashboard-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background-color: #ffffff;
          color: #0f172a;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
        }
        .admin-layout .admin-dashboard .dashboard-refresh-btn:hover:not(:disabled) {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #1e62b6;
        }
        .admin-layout .admin-dashboard .dashboard-refresh-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .admin-layout .admin-dashboard .dashboard-refresh-btn:focus-visible {
          outline: 2px solid #1e62b6;
          outline-offset: 2px;
        }
        .admin-layout .admin-dashboard .dashboard-alert {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 10px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .admin-layout .admin-dashboard .dashboard-alert-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .admin-layout .admin-dashboard .main-cards {
          margin: 0;
        }
        .admin-layout .admin-dashboard .main-cards .card {
          position: relative;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 22px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }
        .admin-layout .admin-dashboard .main-cards .card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #1e62b6;
        }
        .admin-layout .admin-dashboard .main-cards .card:nth-child(2)::before {
          background-color: #0284c7;
        }
        .admin-layout .admin-dashboard .main-cards .card:nth-child(3)::before {
          background-color: #0f766e;
        }
        .admin-layout .admin-dashboard .main-cards .card:nth-child(4)::before {
          background-color: #334155;
        }
        .admin-layout .admin-dashboard .main-cards .card .card-inner {
          color: #0f172a;
          align-items: flex-start;
        }
        .admin-layout .admin-dashboard .main-cards .card .card-inner h3 {
          color: #475569;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .admin-layout .admin-dashboard .main-cards .card .card-role-caption {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .admin-layout .admin-dashboard .main-cards .card .card-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background-color: rgba(30, 98, 182, 0.1);
          color: #1e62b6;
          flex-shrink: 0;
        }
        .admin-layout .admin-dashboard .main-cards .card:nth-child(2) .card-icon-badge {
          background-color: rgba(2, 132, 199, 0.1);
          color: #0284c7;
        }
        .admin-layout .admin-dashboard .main-cards .card:nth-child(3) .card-icon-badge {
          background-color: rgba(15, 118, 110, 0.1);
          color: #0f766e;
        }
        .admin-layout .admin-dashboard .main-cards .card:nth-child(4) .card-icon-badge {
          background-color: rgba(51, 65, 85, 0.1);
          color: #334155;
        }
        .admin-layout .admin-dashboard .main-cards .card h1 {
          margin: 14px 0 0;
          color: #0f172a;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.15;
        }
        .admin-layout .admin-dashboard .dashboard-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 4px 0 0;
        }
        .admin-layout .admin-dashboard .chart-title {
          margin: 0;
        }
        .admin-layout .admin-dashboard .chart-subtitle {
          margin: 4px 0 0;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 400;
        }
        .admin-layout .admin-dashboard .charts {
          margin-top: 0;
          height: auto;
          min-height: 0;
        }
        .admin-layout .admin-dashboard .chart-panel {
          display: flex;
          flex-direction: column;
          padding: 20px 22px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          min-width: 0;
        }
        .admin-layout .admin-dashboard .chart-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .admin-layout .admin-dashboard .chart-panel-title {
          margin: 0;
          color: #0f172a;
          font-size: 0.975rem;
          font-weight: 700;
        }
        .admin-layout .admin-dashboard .chart-panel-tag {
          padding: 3px 10px;
          border-radius: 999px;
          background-color: #f1f5f9;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .admin-layout .admin-dashboard .chart-empty-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 44px 24px;
          background-color: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 14px;
          text-align: center;
          color: #475569;
        }
        .admin-layout .admin-dashboard .chart-empty-icon {
          font-size: 1.75rem;
          color: #1e62b6;
          opacity: 0.85;
        }
        .admin-layout .admin-dashboard .chart-empty-title {
          margin: 4px 0 0;
          color: #0f172a;
          font-size: 1rem;
          font-weight: 600;
        }
        .admin-layout .admin-dashboard .chart-empty-desc {
          margin: 0;
          color: #64748b;
          font-size: 0.875rem;
        }
        @media screen and (max-width: 768px) {
          .admin-layout .admin-dashboard .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .admin-layout .admin-dashboard .dashboard-header-actions {
            width: 100%;
            justify-content: space-between;
          }
          .admin-layout .admin-dashboard .dashboard-alert {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

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
