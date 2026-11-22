import { Backdrop, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../../config/axios';
import { useReactToPrint } from 'react-to-print';
import './staff-member-exam-doc.scss';
import { toast } from 'react-toastify';

interface MemberExamDocRecord {
  fullName?: string | null;
  nationality?: string | null;
  dob?: string | null;
  gender?: string | null;
  residenceAddress?: string | null;
  temporaryAddress?: string | null;
  identityCardNumber?: string | null;
  cardProvidedDate?: string | null;
  cardProvidedLocation?: string | null;
  drivingLicenseNumber?: string | null;
  drivingLicenseTier?: string | null;
  drivingLicenseProvider?: string | null;
  drivingTestTier?: string | null;
  integratedDrivingLicense?: boolean;
  revokedDrivingLicense?: boolean;
}

function MemberDoc() {
  const { memberId } = useParams();
  const [member, setMember] = useState<MemberExamDocRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement | null>(null);

  const getMemberById = useCallback(async () => {
    try {
      const response = await api.get(`Member?memberId=${memberId}`);
      setMember(response.data);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  }, [memberId]);

  const formatDate = (dbDate?: string | null) => {
    if (!dbDate) return '';
    const date = new Date(dbDate);
    if (Number.isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatGender = (gender?: string | null) => {
    if (!gender) return '';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Hồ sơ thi',
    onAfterPrint: () => toast.success('Đã in thành công'),
    copyStyles: true,
  });

  useEffect(() => {
    void getMemberById();
  }, [getMemberById]);

  return (
    <div className="member-doc-container">
      <div className="member-doc-header-bar">
        <div className="member-doc-header-copy">
          <Link to="/quan-ly-thanh-vien" className="member-doc-back-link">
            <span aria-hidden="true">←</span>
            <span>Quay lại danh sách thành viên</span>
          </Link>
          <div className="member-doc-title">
            <h1>Hồ sơ thi</h1>
            <p>Xem trước và in đơn đề nghị học, sát hạch cấp giấy phép lái xe của học viên.</p>
          </div>
        </div>
        {member != null && !isLoading && (
          <div className="member-doc-top-actions">
            <button
              type="button"
              className="btn print-btn btn-primary"
              onClick={handlePrint}
            >
              In đơn thi
            </button>
          </div>
        )}
      </div>

      {member != null ? (
        !isLoading ? (
          <div className="member-doc-form">
            <div
              className="member-doc-scroll"
              role="region"
              aria-label="Hồ sơ thi"
              tabIndex={0}
            >
              <div className="member-doc-print" ref={componentRef}>
                <div className="first-part">
                  <h2 className="text-center">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                  <h3 className="text-center">Độc lập - Tự do - Hạnh phúc</h3>
                  <div className="cross-line"></div>
                </div>
                <div className="second-part">
                  <div className="member-doc-field member-img-container">
                    <label htmlFor="member-img">ảnh thẻ</label>
                  </div>
                  <div className="exam-demand-title">
                    <h2>ĐƠN ĐỀ NGHỊ HỌC, SÁT HẠCH ĐỂ CẤP GIẤY PHÉP LÁI XE</h2>
                    <p>Kính gửi: SỞ GIAO THÔNG VẬN TẢI THÀNH PHỐ HỒ CHÍ MINH</p>
                  </div>
                </div>
                <div className="member-doc-field line-1">
                  <div className="name-container">
                    <label htmlFor="name">Tôi là:</label>
                    <span> {member.fullName}</span>
                  </div>
                  <div className="nationality-container">
                    <label htmlFor="nationality">Quốc tịch:</label>
                    <span> {member.nationality}</span>
                  </div>
                </div>
                <div className="member-doc-field line-2">
                  <div className="dob-container">
                    <label htmlFor="dob">Sinh ngày:</label>
                    <span> {formatDate(member.dob)}</span>
                  </div>
                  <div className="gender-container">
                    <label htmlFor="gender">Giới tính: </label>
                    <span> {formatGender(member.gender)}</span>
                  </div>
                </div>
                <div className="member-doc-field">
                  <label htmlFor="residenceAddress">Nơi đăng ký hộ khẩu thường trú: </label>
                  <span> {member.residenceAddress}</span>
                </div>
                <div className="member-doc-field">
                  <label htmlFor="tempAddress">Nơi cư trú: </label>
                  <span> {member.temporaryAddress}</span>
                </div>
                <div className="member-doc-field">
                  <label htmlFor="cccdNo">
                    Số giấy CMND, hoặc thẻ căn cước công dân (hoặc hộ chiếu):{' '}
                  </label>
                  <span> {member.identityCardNumber}</span>
                </div>
                <div className="member-doc-field line-3">
                  <div className="cccdDate-container">
                    <label htmlFor="cccdDate">Cấp ngày: </label>
                    <span> {formatDate(member.cardProvidedDate)}</span>
                  </div>
                  <div className="cccdLocation-container">
                    <label htmlFor="cccdLocation">Nơi cấp: </label>
                    <span> {member.cardProvidedLocation}</span>
                  </div>
                </div>
                <div className="member-doc-field line-4">
                  <div className="hasDrivingLicenseNo-container">
                    <label htmlFor="hasDrivingLicenseNo">Đã có giấy phép lái xe số: </label>
                    <span> {member.drivingLicenseNumber}</span>
                  </div>
                  <div className="hasDrivingLicenseTier-container">
                    <label htmlFor="hasDrivingLicenseTier">hạng: </label>
                    <span> {member.drivingLicenseTier}</span>
                  </div>
                  <div className="hasDrivingLicenseBy-container">
                    <label htmlFor="hasDrivingLicenseBy">do: </label>
                    <span> {member.drivingLicenseProvider}</span>
                  </div>
                  <div className="hasDrivingLicenseDate-container">
                    <label htmlFor="hasDrivingLicenseDate">cấp ngày: </label>
                  </div>
                </div>
                <div className="member-doc-field">
                  <label htmlFor="drivingLicenseDemand">
                    Đề nghị cho tôi được học, dự sát hạch để cấp giấy phép lái xe hạng:{' '}
                  </label>
                  <span> {member.drivingTestTier}</span>
                </div>
                <div className="member-doc-field integratedDrivingLicense">
                  <label htmlFor="integratedDrivingLicense">
                    Đăng ký tích hợp giấy phép lái xe:{' '}
                  </label>
                  <input
                    type="checkbox"
                    checked={Boolean(member.integratedDrivingLicense)}
                    disabled
                  />
                </div>
                <div className="member-doc-field inline-block">
                  <label className="inline-block" htmlFor="">
                    Vi phạm hành chính trong lĩnh vực giao thông đường bộ với hình thức tước
                    quyền sử
                    <br />
                    dụng giấy phép lái xe:{' '}
                  </label>
                  <div className="check-result">
                    <div className="result-yes">
                      <label htmlFor="check">Có: </label>
                      <input
                        type="radio"
                        name="check"
                        defaultChecked={Boolean(member.revokedDrivingLicense)}
                        disabled
                      />
                    </div>
                    <div className="result-no">
                      <label htmlFor="check">Không: </label>
                      <input
                        type="radio"
                        name="check"
                        defaultChecked={!member.revokedDrivingLicense}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="member-doc-field enclosed-document">
                  <label htmlFor="enclosedDocument">Xin gửi kèm theo: </label>
                  <ul className="enclosed-subLi">
                    <li>01 giấy chứng nhận đủ sức khỏe.</li>
                    <li>06 ảnh có màu cỡ 3cm x 4cm, chụp không quá 06 tháng.</li>
                    <li>
                      Bản sao giấy chứng minh nhân dân hoặc thẻ căn cước công dân hoặc hộ chiếu
                      còn thời hạn có ghi số giấy chứng minh nhân dân hoặc thẻ căn cước công dân
                      (đối với người Việt Nam) hoặc hộ chiếu (đối với người nước ngoài);
                    </li>
                    <li>Các tài liệu khác có liên quan gồm: </li>
                  </ul>
                </div>
                <p className="member-doc-commitment">
                  Tôi xin cam đoan những điều ghi trên là đúng sự thật, nếu sai tôi xin hoàn toàn
                  chịu trách nhiệm.
                </p>
                <div className="sign-container">
                  <p>TP. Hồ Chí Minh, ngày .......... tháng .......... năm 2023</p>
                  <p>NGƯỜI LÀM ĐƠN</p>
                  <p>(Ký và ghi rõ họ, tên)</p>
                </div>
              </div>
            </div>
            <div className="btn-container">
              <button
                type="button"
                className="btn print-btn btn-primary"
                onClick={handlePrint}
              >
                In đơn thi
              </button>
            </div>
          </div>
        ) : (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )
      ) : (
        <div className="member-doc-empty-card" role="status">
          <h2>Chưa có dữ liệu hồ sơ thi</h2>
          <p>Học viên này hiện chưa cập nhật đơn đăng ký dự sát hạch lái xe.</p>
        </div>
      )}
    </div>
  );
}

export default MemberDoc;
