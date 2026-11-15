import React, { useEffect, useMemo, useState } from 'react'
import './invoice-management.scss'
import api from '../../../../../config/axios';

interface InvoiceRecord {
    invoiceId: number;
    staffName: string;
    memberName: string;
    courseId: string;
    invoiceTime: string;
    amountPaid: number;
}

function InvoiceTable() {
    const [invoice, setInvoice] = useState<InvoiceRecord[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadError, setHasLoadError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');

    const getAllInvoices = async () => {
        try {
            const response = await api.get('Invoice/list');
            const res = response.data;
            setInvoice(res);
            setHasLoadError(false);
        } catch (error) {
            setHasLoadError(true);
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    //paganition part
    const [currentPage, setCurrentPage] = useState(1);
    const recordPage = 10;
    const filteredInvoices = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi');
        return invoice.filter((item) => {
            const matchesSearch = !normalizedSearch || [item.invoiceId, item.staffName, item.memberName, item.courseId, item.invoiceTime, item.amountPaid]
                .some((value) => String(value ?? '').toLocaleLowerCase('vi').includes(normalizedSearch));
            return matchesSearch && (courseFilter === 'all' || String(item.courseId) === courseFilter);
        });
    }, [invoice, searchTerm, courseFilter]);
    const courses = useMemo(() => Array.from(new Set(invoice.map((item) => String(item.courseId)).filter(Boolean))).sort(), [invoice]);
    const lastIndex = currentPage * recordPage;
    const firsIndex = lastIndex - recordPage;
    const records = filteredInvoices.slice(firsIndex, lastIndex);
    const npage = Math.ceil(filteredInvoices.length / recordPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);
    const overallIndex = (currentPage - 1) * recordPage;
    const firstRecord = records.length > 0 ? overallIndex + 1 : 0;
    const lastRecord = Math.min(overallIndex + recordPage, filteredInvoices.length);

    useEffect(() => {
        if (npage === 0 && currentPage !== 1) setCurrentPage(1);
        else if (npage > 0 && currentPage > npage) setCurrentPage(npage);
    }, [currentPage, npage]);

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

    useEffect(() => {
        getAllInvoices();
    }, []);

    return (
        <div className='payment-management-container'>
            <header className="payment-management-heading">
                <h1>Danh sách thanh toán</h1>
                <p>Danh sách các khoản thanh toán đã ghi nhận.</p>
            </header>
            <section className="payment-summary-grid" aria-label="Tổng quan thanh toán">
                <article className="payment-summary-card"><p>Tổng hóa đơn đã tải</p><strong>{isLoading ? '—' : hasLoadError ? '—' : invoice.length}</strong></article>
                <article className="payment-summary-card"><p>Tổng số tiền đã ghi nhận</p><strong>{isLoading || hasLoadError ? '—' : `${invoice.reduce((sum, item) => sum + (Number(item.amountPaid) || 0), 0).toLocaleString('vi-VN')} VNĐ`}</strong></article>
                <article className="payment-summary-card"><p>Khóa học có hóa đơn</p><strong>{isLoading || hasLoadError ? '—' : courses.length}</strong></article>
                <p className="payment-summary-note">Số liệu tính trên toàn bộ hóa đơn tải được, không phụ thuộc tìm kiếm, bộ lọc hay trang hiện tại.</p>
            </section>
            <section className="payment-table-card" aria-labelledby="payment-table-title">
                <div className="payment-table-toolbar">
                    <div>
                        <h2 id="payment-table-title">Thanh toán</h2>
                        <p>{invoice.length} khoản thanh toán</p>
                    </div>
                    <div className="payment-table-controls">
                        <label className="payment-search-field" htmlFor="payment-search"><span className="sr-only">Tìm hóa đơn</span><input id="payment-search" type="search" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Tìm mã, nhân viên, học viên…" /></label>
                        <label className="payment-filter-field" htmlFor="payment-course-filter">Khóa học
                            <select id="payment-course-filter" value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setCurrentPage(1); }}>
                                <option value="all">Tất cả</option>
                                {courses.map((courseId) => <option key={courseId} value={courseId}>{courseId}</option>)}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="payment-table-scroll">
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th scope='col'>#</th>
                                <th scope='col'>Mã thanh toán</th>
                                <th scope='col'>Nhân viên thanh toán</th>
                                <th scope='col'>Học viên</th>
                                <th scope='col'>Khoá học</th>
                                <th scope='col'>Ngày thanh toán</th>
                                <th scope='col' className="text-end">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7}><p className="payment-table-state">Đang tải danh sách thanh toán…</p></td></tr>
                            ) : hasLoadError ? (
                                <tr><td colSpan={7}><p className="payment-table-state payment-table-state--error" role="alert">Không thể tải danh sách thanh toán lúc này.</p></td></tr>
                            ) : records.length > 0 ? (
                                records.map((invoice, i) => (
                                    <tr key={i}>
                                        <td className="payment-number-cell">{overallIndex + i + 1}</td>
                                        <td>{invoice.invoiceId}</td>
                                        <td className="payment-name-cell" title={invoice.staffName}>{invoice.staffName}</td>
                                        <td className="payment-name-cell" title={invoice.memberName}>{invoice.memberName}</td>
                                        <td>{invoice.courseId}</td>
                                        <td className="payment-date-cell">{invoice.invoiceTime}</td>
                                        <td className="payment-amount-cell">{invoice.amountPaid.toLocaleString()} VNĐ</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7}>
                                        <p className="payment-table-state">{searchTerm.trim() || courseFilter !== 'all' ? 'Không tìm thấy hóa đơn phù hợp.' : 'Chưa có khoản thanh toán nào.'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <nav className="payment-pagination" aria-label="Phân trang thanh toán">
                    <p>Hiển thị {firstRecord}–{lastRecord} trong {filteredInvoices.length} khoản thanh toán</p>
                    <ul className='pagination'>
                        <li className='page-item'>
                            <button type='button' className='page-link' onClick={prePage} disabled={currentPage <= 1 || npage === 0}>Trước</button>
                        </li>
                        {numbers.map((n) => (
                            <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                                <button type='button' className='page-link' onClick={() => changeCPage(n)} aria-current={currentPage === n ? 'page' : undefined}>{n}</button>
                            </li>
                        ))}
                        <li className='page-item'>
                            <button type='button' className='page-link' onClick={nextPage} disabled={npage === 0 || currentPage >= npage}>Sau</button>
                        </li>
                    </ul>
                </nav>
            </section>
        </div>
    )
}

export default InvoiceTable
