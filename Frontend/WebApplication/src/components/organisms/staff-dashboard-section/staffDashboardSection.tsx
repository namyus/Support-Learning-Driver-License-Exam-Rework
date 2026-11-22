import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BsJournalBookmarkFill,
  BsPeopleFill,
  BsPersonLinesFill,
} from 'react-icons/bs';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../../config/axios';

type LoadStatus = 'loading' | 'success' | 'error';

interface DashboardResource<T> {
  status: LoadStatus;
  records: T[];
}

interface MemberRecord {
  memberID?: string | number;
  fullName?: string;
  courseId?: string | null;
  isPaid?: boolean | null;
}

interface MentorRecord {
  mentorId?: string | number;
  fullName?: string;
  isTeachingTheory?: boolean | null;
  isTeachingPractice?: boolean | null;
}

interface ExamRecord {
  examID?: string | number;
  examId?: string | number;
  examName?: string;
  courseID?: string | null;
  courseId?: string | null;
  examTime?: string | null;
  status?: boolean | null;
}

interface ChartDatum {
  name: string;
  value: number;
  color: string;
}

const initialResource = <T,>(): DashboardResource<T> => ({ status: 'loading', records: [] });

const paymentColors = ['#0f766e', '#f59e0b', '#94a3b8'];
const statusColors = ['#1e62b6', '#94a3b8', '#f59e0b'];

function HomePage() {
  const [members, setMembers] = useState<DashboardResource<MemberRecord>>(initialResource);
  const [mentors, setMentors] = useState<DashboardResource<MentorRecord>>(initialResource);
  const [exams, setExams] = useState<DashboardResource<ExamRecord>>(initialResource);

  const loadMembers = useCallback(async () => {
    setMembers((current) => ({ ...current, status: 'loading' }));
    try {
      const response = await api.get<unknown>('Members');
      if (!Array.isArray(response.data)) throw new Error('Invalid Members response');
      setMembers({ status: 'success', records: response.data as MemberRecord[] });
    } catch {
      setMembers({ status: 'error', records: [] });
    }
  }, []);

  const loadMentors = useCallback(async () => {
    setMentors((current) => ({ ...current, status: 'loading' }));
    try {
      const response = await api.get<unknown>('Mentor/list');
      if (!Array.isArray(response.data)) throw new Error('Invalid Mentor response');
      setMentors({ status: 'success', records: response.data as MentorRecord[] });
    } catch {
      setMentors({ status: 'error', records: [] });
    }
  }, []);

  const loadExams = useCallback(async () => {
    setExams((current) => ({ ...current, status: 'loading' }));
    try {
      const response = await api.get<unknown>('Exam/list');
      if (!Array.isArray(response.data)) throw new Error('Invalid Exam response');
      setExams({ status: 'success', records: response.data as ExamRecord[] });
    } catch {
      setExams({ status: 'error', records: [] });
    }
  }, []);

  useEffect(() => {
    void loadMembers();
    void loadMentors();
    void loadExams();
  }, [loadExams, loadMembers, loadMentors]);

  const paidCount = members.records.filter((member) => member.isPaid === true).length;
  const unpaidCount = members.records.filter((member) => member.isPaid === false).length;
  const unknownPaymentCount = members.records.length - paidCount - unpaidCount;
  const theoryCount = mentors.records.filter((mentor) => mentor.isTeachingTheory === true).length;
  const practiceCount = mentors.records.filter((mentor) => mentor.isTeachingPractice === true).length;
  const activeExamCount = exams.records.filter((exam) => exam.status === true).length;
  const inactiveExamCount = exams.records.filter((exam) => exam.status === false).length;
  const unknownExamCount = exams.records.length - activeExamCount - inactiveExamCount;

  const paymentData: ChartDatum[] = [
    { name: 'Đã thanh toán', value: paidCount, color: paymentColors[0] },
    { name: 'Chưa thanh toán', value: unpaidCount, color: paymentColors[1] },
    { name: 'Chưa rõ trạng thái', value: unknownPaymentCount, color: paymentColors[2] },
  ].filter((item) => item.value > 0);

  const examData: ChartDatum[] = [
    { name: 'Đang hoạt động', value: activeExamCount, color: statusColors[0] },
    { name: 'Ngừng hoạt động', value: inactiveExamCount, color: statusColors[1] },
    { name: 'Chưa rõ trạng thái', value: unknownExamCount, color: statusColors[2] },
  ].filter((item) => item.value > 0);

  const membersByCourse = useMemo(() => {
    const counts = new Map<string, number>();
    members.records.forEach((member) => {
      const courseId = member.courseId?.trim();
      if (courseId) counts.set(courseId, (counts.get(courseId) ?? 0) + 1);
    });
    return Array.from(counts, ([courseId, count]) => ({ courseId, count }))
      .sort((left, right) => right.count - left.count || left.courseId.localeCompare(right.courseId, 'vi'));
  }, [members.records]);

  const memberMetric = metricValues(members, [
    { label: 'Đã thanh toán', value: paidCount },
    { label: 'Chưa thanh toán', value: unpaidCount },
  ]);
  const mentorMetric = metricValues(mentors, [
    { label: 'Dạy lý thuyết', value: theoryCount },
    { label: 'Dạy thực hành', value: practiceCount },
  ]);
  const examMetric = metricValues(exams, [
    { label: 'Đang hoạt động', value: activeExamCount },
    { label: 'Ngừng hoạt động', value: inactiveExamCount },
  ]);

  return (
    <section className="staff-page-frame staff-dashboard" aria-labelledby="staff-home-title">
      <header className="staff-page-heading staff-dashboard__heading">
        <div>
          <span className="staff-dashboard__eyebrow">Staff Portal</span>
          <h1 id="staff-home-title">Tổng quan</h1>
          <p>Tổng hợp tình hình thành viên, giảng viên và kỳ thi trong hệ thống.</p>
        </div>
      </header>

      <p className="staff-dashboard__data-note">
        Số liệu được tính từ các bản ghi trả về bởi những API hiện có, không đảm bảo là tổng số toàn cơ sở dữ liệu.
      </p>

      <section className="staff-dashboard__metrics" aria-label="Chỉ số quản lý">
        <SummaryCard
          title="Thành viên"
          icon={<BsPeopleFill aria-hidden="true" />}
          resource={members}
          values={memberMetric}
          onRetry={loadMembers}
          note={unknownPaymentCount > 0 ? `${unknownPaymentCount} bản ghi chưa có trạng thái thanh toán.` : undefined}
        />
        <SummaryCard
          title="Giảng viên"
          icon={<BsPersonLinesFill aria-hidden="true" />}
          resource={mentors}
          values={mentorMetric}
          onRetry={loadMentors}
          note="Số giảng viên theo hai hình thức có thể giao nhau."
        />
        <SummaryCard
          title="Kỳ thi"
          icon={<BsJournalBookmarkFill aria-hidden="true" />}
          resource={exams}
          values={examMetric}
          onRetry={loadExams}
          note={unknownExamCount > 0 ? `${unknownExamCount} kỳ thi chưa có trạng thái xác định.` : undefined}
        />
      </section>

      <section className="staff-dashboard__section" aria-labelledby="staff-dashboard-charts-title">
        <div className="staff-dashboard__section-heading">
          <div>
            <h2 id="staff-dashboard-charts-title">Phân bố dữ liệu</h2>
            <p>Biểu đồ được tạo từ các bản ghi tải thành công ở trên.</p>
          </div>
        </div>
        <div className="staff-dashboard__charts">
          <ChartPanel title="Trạng thái thanh toán thành viên" description="Tỷ trọng trạng thái trong dữ liệu đã tải.">
            <ChartState resource={members} onRetry={loadMembers} empty={members.records.length === 0} emptyText="Chưa có dữ liệu thành viên để thống kê.">
              <DonutChart data={paymentData} label="thành viên" />
            </ChartState>
          </ChartPanel>

          <ChartPanel title="Phân công giảng dạy" description="Hai nhóm giảng dạy được thống kê độc lập và có thể giao nhau.">
            <ChartState resource={mentors} onRetry={loadMentors} empty={mentors.records.length === 0} emptyText="Chưa có dữ liệu giảng viên để thống kê.">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[
                  { name: 'Lý thuyết', total: theoryCount },
                  { name: 'Thực hành', total: practiceCount },
                ]} layout="vertical" margin={{ top: 12, right: 22, bottom: 8, left: 12 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={88} stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(value) => [`${value} giảng viên`, 'Số lượng']} />
                  <Bar dataKey="total" name="Giảng viên" fill="#1e62b6" radius={[0, 5, 5, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </ChartState>
          </ChartPanel>

          <ChartPanel title="Trạng thái kỳ thi" description="Tình trạng kích hoạt của các kỳ thi đã tải.">
            <ChartState resource={exams} onRetry={loadExams} empty={exams.records.length === 0} emptyText="Chưa có dữ liệu kỳ thi để thống kê.">
              <DonutChart data={examData} label="kỳ thi" />
            </ChartState>
          </ChartPanel>

          <ChartPanel title="Thành viên theo khóa học" description="Phân bố theo mã khóa học có trong hồ sơ thành viên.">
            <ChartState resource={members} onRetry={loadMembers} empty={membersByCourse.length < 2} emptyText={membersByCourse.length === 1 ? 'Chỉ có một mã khóa học trong dữ liệu đã tải; chưa đủ nhóm để so sánh.' : 'Không có đủ mã khóa học trong dữ liệu đã tải để hiển thị phân bố.'}>
              <ResponsiveContainer width="100%" height={Math.max(220, membersByCourse.length * 38)}>
                <BarChart data={membersByCourse} layout="vertical" margin={{ top: 8, right: 22, bottom: 8, left: 12 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="courseId" width={92} stroke="#64748b" fontSize={11} />
                  <Tooltip formatter={(value) => [`${value} thành viên`, 'Số lượng']} />
                  <Bar dataKey="count" name="Thành viên" fill="#1e62b6" radius={[0, 5, 5, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </ChartState>
          </ChartPanel>
        </div>
      </section>

      <section className="staff-dashboard__quick-links" aria-labelledby="staff-dashboard-links-title">
        <div className="staff-dashboard__section-heading">
          <div>
            <h2 id="staff-dashboard-links-title">Truy cập nhanh</h2>
            <p>Mở các khu vực quản lý thường dùng.</p>
          </div>
        </div>
        <nav className="staff-dashboard__link-grid" aria-label="Quản lý chính">
          <QuickLink to="/quan-ly-thanh-vien" icon={<BsPeopleFill aria-hidden="true" />} label="Quản lý thành viên" />
          <QuickLink to="/quan-ly-giao-vien" icon={<BsPersonLinesFill aria-hidden="true" />} label="Quản lý giảng viên" />
          <QuickLink to="/quan-ly-ky-thi" icon={<BsJournalBookmarkFill aria-hidden="true" />} label="Quản lý kỳ thi" />
        </nav>
      </section>
    </section>
  );
}

function metricValues<T>(resource: DashboardResource<T>, values: Array<{ label: string; value: number }>) {
  return values.map((item) => ({ ...item, display: resource.status === 'loading' ? '…' : resource.status === 'error' ? '—' : item.value }));
}

interface SummaryCardProps<T> {
  title: string;
  icon: React.ReactNode;
  resource: DashboardResource<T>;
  values: Array<{ label: string; value: number; display: string | number }>;
  onRetry: () => void;
  note?: string;
}

function SummaryCard<T>({ title, icon, resource, values, onRetry, note }: SummaryCardProps<T>) {
  const total = resource.status === 'loading' ? '…' : resource.status === 'error' ? '—' : resource.records.length;
  return (
    <article className={`staff-dashboard__metric-card${resource.status === 'error' ? ' is-error' : ''}`} aria-busy={resource.status === 'loading'}>
      <div className="staff-dashboard__metric-top">
        <div>
          <h3>{title}</h3>
          <span>{resource.status === 'success' && resource.records.length === 0 ? 'Chưa có bản ghi' : 'Bản ghi đã tải'}</span>
        </div>
        <span className="staff-dashboard__metric-icon">{icon}</span>
      </div>
      <strong className="staff-dashboard__metric-total">{total}</strong>
      <div className="staff-dashboard__metric-details">
        {values.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.display}</strong>
          </div>
        ))}
      </div>
      {note && resource.status === 'success' && <p className="staff-dashboard__metric-note">{note}</p>}
      {resource.status === 'error' && <div className="staff-dashboard__inline-error" role="alert">Không tải được dữ liệu. <button type="button" onClick={onRetry}>Thử lại</button></div>}
    </article>
  );
}

interface ChartPanelProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function ChartPanel({ title, description, children }: ChartPanelProps) {
  return (
    <article className="staff-dashboard__chart-card">
      <header className="staff-dashboard__chart-header">
        <div><h3>{title}</h3><p>{description}</p></div>
      </header>
      {children}
    </article>
  );
}

interface ChartStateProps<T> {
  resource: DashboardResource<T>;
  onRetry: () => void;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}

function ChartState<T>({ resource, onRetry, empty, emptyText, children }: ChartStateProps<T>) {
  if (resource.status === 'loading') return <div className="staff-dashboard__chart-state" role="status">Đang tải dữ liệu…</div>;
  if (resource.status === 'error') return <div className="staff-dashboard__chart-state is-error" role="alert"><span>Không tải được dữ liệu cho biểu đồ này.</span><button type="button" onClick={onRetry}>Thử tải lại</button></div>;
  if (empty) return <div className="staff-dashboard__chart-state" role="status">{emptyText}</div>;
  return <div className="staff-dashboard__chart-visual">{children}</div>;
}

interface DonutChartProps {
  data: ChartDatum[];
  label: string;
}

function DonutChart({ data, label }: DonutChartProps) {
  return (
    <div className="staff-dashboard__donut-layout">
      <ResponsiveContainer width="100%" height={218}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={2} stroke="#fff" strokeWidth={2}>
            {data.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Pie>
          <Tooltip formatter={(value) => [`${value} ${label}`, 'Số lượng']} />
          <Legend verticalAlign="bottom" height={42} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface QuickLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function QuickLink({ to, icon, label }: QuickLinkProps) {
  return <Link className="staff-dashboard__quick-link" to={to}><span className="staff-dashboard__quick-icon">{icon}</span><span>{label}</span><span className="staff-dashboard__quick-arrow" aria-hidden="true">↗</span></Link>;
}

export default HomePage;
