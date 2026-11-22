import MemberImg from '../../../../assets/imgs/member/member_img.png'
import { useNavigate } from 'react-router-dom'
import './member-update-information-form.scss'
import { toast } from 'react-toastify';
import { useCallback, useState, useEffect } from 'react'
import { Backdrop, CircularProgress } from '@mui/material';
import api from '../../../config/axios';

function UpdateInformationForm() {
    const user = sessionStorage.getItem('loginedUser') ? JSON.parse(sessionStorage.getItem('loginedUser')) : null;
    const userId = user?.userID;

    const [inputData, setInputData] = useState({
        fullName: '',
        dob: '',
        gender: '',
        nationality: '',
        nation: '',
        phone: '',
        email: '',
        residenceAddress: '',
        identityCardNumber: '',
        courseId: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [member, setMember] = useState(null);
    const [student, setStudent] = useState(null);
    const memberId = member?.memberID;

    const navigate = useNavigate();

    const getMemberById = useCallback(async () => {
        if (userId == null) return;
        try {
            const response = await api.get('Member/' + userId);
            const res = response.data;
            setInputData(res);
            setMember(res);
            setIsLoading(false);
        } catch (err) {
            console.log(err);
        }
    }, [userId]);

    const getStudentById = useCallback(async () => {
        if (memberId == null) return;
        try {
            const response = await api.get('Student/' + memberId);
            const res = response.data;
            setStudent(res);
        } catch (err) {
            console.error(err);
        }
    }, [memberId]);

    useEffect(() => {
        getMemberById();
    }, [getMemberById])

    useEffect(() => {
        getStudentById();
    }, [getStudentById])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        window.scroll({
            top: 0,
            behavior: 'instant'
        });
        toast.success("Cập nhật thông tin thành công.");
        navigate(`/thong-tin-ca-nhan/${user.username}`);
    }

    const formatDateToInputValue = (dateString) => {
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return ''; // Handle invalid dates by returning an empty string
        }

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    return (
        <div className='update-information-container'>
            <h1 className='update-information-title'>Cập nhật thông tin</h1>
            <div className='update-information-content'>
                {
                    inputData != null ? (
                        !isLoading ? (
                            <>
                                <div className='member-avatar'>
                                    <img src={MemberImg} alt="" />
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <li>
                                        <label htmlFor="name">Họ và tên: </label>
                                        <input type="text" name="name" id=""
                                            value={inputData.fullName} onChange={e => setInputData({ ...inputData, fullName: e.target.value })} />
                                    </li>
                                    <li className='line-1'>
                                        <div className='dob-container'>
                                            <label htmlFor="dob">Ngày sinh: </label>
                                            <input type="date" name="dob" id="" value={formatDateToInputValue(inputData.dob)}
                                                onChange={e => setInputData({ ...inputData, dob: e.target.value })} />
                                        </div>
                                        <div className="gender-container">
                                            <div className='male'>
                                                <label htmlFor="gender-male">Nam: </label>
                                                <input type="radio" name="gender" id=""
                                                    checked={inputData.gender == "Nam"} onChange={e => setInputData({ ...inputData, gender: e.target.value })}
                                                    disabled />
                                            </div>
                                            <div className='female'>
                                                <label htmlFor="gender-female">Nữ: </label>
                                                <input type="radio" name="gender" id=""
                                                    checked={inputData.gender == "Nữ"} onChange={e => setInputData({ ...inputData, gender: e.target.value })}
                                                    disabled />
                                            </div>
                                        </div>
                                    </li>
                                    <li className='line-2'>
                                        <div className='nationality-container'>
                                            <label htmlFor="nationality">Quốc tịch: </label>
                                            <input type="text" name="nationality" id=""
                                                value={inputData.nationality} onChange={e => setInputData({ ...inputData, nationality: e.target.value })} />
                                        </div>
                                        <div className="nation-container">
                                            <label htmlFor="nation">Dân tộc: </label>
                                            <input type="text" name="nation" id=""
                                                value={inputData.nation} onChange={e => setInputData({ ...inputData, nation: e.target.value })} />
                                        </div>
                                    </li>
                                    <li>
                                        <label htmlFor="phoneNo">Điện thoại di động: </label>
                                        <input type="tel" name="phoneNo" id=""
                                            value={inputData.phone} onChange={e => setInputData({ ...inputData, phone: e.target.value })} />
                                    </li>
                                    <li>
                                        <label htmlFor="email">Email: </label>
                                        <input type="email" name="email" id=""
                                            value={inputData.email} onChange={e => setInputData({ ...inputData, email: e.target.value })} />
                                    </li>
                                    <li>
                                        <label htmlFor="residenceAddress"><strong><i>Địa chỉ thường trú: </i></strong></label>
                                        <span className='text-body-tertiary fst-italic'>{inputData.residenceAddress}</span>
                                    </li>
                                    <li>
                                        <label htmlFor="cccdNo"><strong><i>Số CCCD/CMND: </i></strong></label>
                                        <span className='text-body-tertiary fst-italic'>{inputData.identityCardNumber}</span>
                                    </li>
                                    {
                                        student != null ? (
                                            <li>
                                                <label htmlFor="studentID"><strong><i>Mã số học viên: </i></strong></label>
                                                <span className='text-body-tertiary fst-italic'>{student.studentID}</span>
                                            </li>
                                        ) : (
                                            <li>
                                                <label htmlFor="studentID"><strong><i>Mã số học viên: </i></strong></label>
                                                    <span className='text-body-tertiary fst-italic'></span>
                                            </li>
                                        )
                                    }
                                    <li>
                                        <label htmlFor="courseID"><strong><i>Khoá học: </i></strong></label>
                                        <span className='text-body-tertiary fst-italic'>{inputData.courseId}</span>
                                    </li>
                                    <button type='submit' className='confirm-btn'>Xác nhận</button>
                                </form>
                            </>

                        ) : (
                            <>
                                <Backdrop
                                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                    open={true}>

                                    <CircularProgress color="inherit" />
                                </Backdrop>
                            </>
                        )
                    ) : (
                        <h1>no data</h1>
                    )
                }
            </div>
        </div>
    )
}

export default UpdateInformationForm