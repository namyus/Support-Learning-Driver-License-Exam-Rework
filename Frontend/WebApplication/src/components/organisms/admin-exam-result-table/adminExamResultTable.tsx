import { useCallback, useState, useEffect, useMemo } from 'react'
import './admin-exam-result-table.scss'
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    fetchTests,
    selectTestsList,
    updateTestIsPass,
} from '../../../features/exams/examsSlice';

function ExamResultTable() {
    const dispatch = useAppDispatch();
    const test = useAppSelector(selectTestsList);
    const [, setUpdateSuccess] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadError, setHasLoadError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const getAllMembers = useCallback(async () => {
        try {
            await dispatch(fetchTests()).unwrap();
            setHasLoadError(false);
        } catch (err) {
            setHasLoadError(true);
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    const updatePassStatus = async (studentId: string) => {
        try {
            // Update the payment status
            await dispatch(updateTestIsPass(studentId)).unwrap();
            setUpdateSuccess(true);

            const notificationMessage = "Cập nhật thành công!";
            localStorage.setItem("notificationMessage", notificationMessage);
            location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    //paganition part
    const [currentPage, setCurrentPage] = useState(1);
    const recordPage = 10;
    const filteredTests = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi');
        return test.filter((item) => {
            const status = item.pass === true ? 'passed' : item.pass === false ? 'failed' : 'unscored';
            const matchesSearch = !normalizedSearch || [item.testId, item.studentId, item.examId, item.score, status]
                .some((value) => String(value ?? '').toLocaleLowerCase('vi').includes(normalizedSearch));
            return matchesSearch && (statusFilter === 'all' || status === statusFilter);
        });
    }, [test, searchTerm, statusFilter]);
    const lastIndex = currentPage * recordPage;
    const firsIndex = lastIndex - recordPage;
    const records = filteredTests.slice(firsIndex, lastIndex);
    const npage = Math.ceil(filteredTests.length / recordPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);
    const overallIndex = (currentPage - 1) * recordPage;
    const firstRecord = records.length > 0 ? overallIndex + 1 : 0;
    const lastRecord = Math.min(overallIndex + recordPage, filteredTests.length);

    useEffect(() => {
        if (npage === 0 && currentPage !== 1) setCurrentPage(1);
        else if (npage > 0 && currentPage > npage) setCurrentPage(npage);
    }, [currentPage, npage]);

    useEffect(() => {
        void getAllMembers();
    }, [getAllMembers])

    useEffect(() => {
        const storedNotificationMessage = localStorage.getItem("notificationMessage");

        if (storedNotificationMessage) {
            toast.success(storedNotificationMessage);
            localStorage.removeItem("notificationMessage"); // Remove the message from localStorage
        }
    }, []);

    const prePage = () => {
        if (currentPage !== 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    const changeCPage = (id: number) => {
        setCurrentPage(id);
    }

    const nextPage = () => {
        if (currentPage !== npage) {
            setCurrentPage(currentPage + 1);
        }
    }

    return (
        <div className='exam-results-container'>
            <header className="exam-results-heading">
                <h1>Kết quả thi</h1>
                <p>Theo dõi điểm số và trạng thái kết quả của học viên.</p>
            </header>
            <section className="exam-results-summary-grid" aria-label="Tổng quan kết quả thi">
                <article className="exam-results-summary-card"><p>Tổng lượt thi đã tải</p><strong>{isLoading || hasLoadError ? '—' : test.length}</strong></article>
                <article className="exam-results-summary-card"><p>Đạt</p><strong className="is-pass">{isLoading || hasLoadError ? '—' : test.filter((item) => item.pass === true).length}</strong></article>
                <article className="exam-results-summary-card"><p>Không đạt</p><strong className="is-fail">{isLoading || hasLoadError ? '—' : test.filter((item) => item.pass === false).length}</strong></article>
                <p className="exam-results-summary-note">Tổng lượt thi gồm cả lượt chưa có kết quả; chưa có kết quả không được tính là đạt hoặc không đạt.</p>
            </section>
            <section className='exam-results-card' aria-labelledby="exam-results-title">
                <div className="exam-results-toolbar">
                    <div>
                        <h2 id="exam-results-title">Danh sách bài thi</h2>
                        <p>{test.length} kết quả</p>
                    </div>
                    <div className="exam-results-controls">
                        <label className="exam-results-search" htmlFor="exam-results-search"><span className="sr-only">Tìm kết quả thi</span><input id="exam-results-search" type="search" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Tìm mã lượt thi, học viên…" /></label>
                        <label className="exam-results-filter" htmlFor="exam-results-filter">Trạng thái
                            <select id="exam-results-filter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }}>
                                <option value="all">Tất cả</option>
                                <option value="passed">Đạt</option>
                                <option value="failed">Không đạt</option>
                                {test.some((item) => item.pass == null) && <option value="unscored">Chưa có kết quả</option>}
                            </select>
                        </label>
                    </div>
                </div>
                <div className='exam-results-table-scroll'>
                    <table className='exam-results-table'>
                        <thead>
                            <tr>
                                <th scope='col'>#</th>
                                <th scope='col'>Mã kết quả</th>
                                <th scope='col'>Mã học viên</th>
                                <th scope='col' className='text-center'>Mã bài thi</th>
                                <th scope='col' className='text-center'>Điểm</th>
                                <th scope='col' className='text-center'>Trạng thái</th>
                                <th scope='col' className='text-center'>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7}><p className="exam-results-state">Đang tải kết quả thi…</p></td></tr>
                            ) : hasLoadError ? (
                                <tr><td colSpan={7}><p className="exam-results-state exam-results-state--error" role="alert">Không thể tải kết quả thi lúc này.</p></td></tr>
                            ) : records.length > 0 ? (
                                records.map((exam, i: number = 1) => (
                                    <tr key={i}>
                                        <td>{overallIndex + i + 1}</td>
                                        <td>{exam.testId}</td>
                                        <td>{exam.studentId}</td>
                                        <td className='tw-text-center'>{exam.examId}</td>
                                        <td className='tw-text-center'>{exam.score ?? '—'}</td>
                                        <td className='text-center'><span className={`exam-result-status ${exam.pass === true ? 'is-pass' : exam.pass === false ? 'is-fail' : 'is-unscored'}`}>{exam.pass === true ? 'Đạt' : exam.pass === false ? 'Không đạt' : 'Chưa có kết quả'}</span></td>
                                        <td className='button text-center'>
                                            <button className="exam-result-update-button" type="button" onClick={() => updatePassStatus(exam.studentId)}>Cập nhật</button>
                                            {/* <button className="btn btn-danger" type="submit">Xoá</button> */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7}>
                                        <p className='exam-results-state'>Chưa có kết quả thi.</p>
                                    </td>
                                </tr>
                            )
                            }
                        </tbody>
                    </table>
                    <nav className="exam-results-pagination" aria-label="Phân trang kết quả thi">
                        <p>Hiển thị {firstRecord}–{lastRecord} trong {filteredTests.length} kết quả</p>
                        <ul className='pagination'>
                            <li className='page-item'>
                                <button type='button' className='page-link' onClick={prePage} disabled={currentPage <= 1 || npage === 0}>Trước</button>
                            </li>
                            {
                                numbers.map((n) => (
                                    <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                                        <button type='button' className='page-link' onClick={() => changeCPage(n)} aria-current={currentPage === n ? 'page' : undefined}>{n}</button>
                                    </li>
                                ))
                            }
                            <li className='page-item'>
                                <button type='button' className='page-link' onClick={nextPage} disabled={npage === 0 || currentPage >= npage}>Sau</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </section>
        </div>
    )
}

export default ExamResultTable
