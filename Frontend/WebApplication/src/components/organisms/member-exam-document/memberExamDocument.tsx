
import { useEffect, useState } from 'react';
import './member-exam-document.scss';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchMemberByUserId,
  selectCurrentMember,
} from '../../../features/members/membersSlice';

function formatDate(value?: string | null): string {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function displayValue(value?: string | number | null): string | number {
  return value === null || value === undefined || value === ''
    ? '—'
    : value;
}

function ExamDocument() {
  const dispatch = useAppDispatch();
  const member = useAppSelector(selectCurrentMember);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getMemberByUID = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedUser = sessionStorage.getItem('loginedUser');

        if (!storedUser) {
          throw new Error('Không tìm thấy thông tin đăng nhập.');
        }

        const user = JSON.parse(storedUser);

        if (user?.userID == null) {
          throw new Error('Thông tin tài khoản không hợp lệ.');
        }

        const memberData = await dispatch(fetchMemberByUserId(user.userID)).unwrap();

        if (!isMounted) return;

        if (!memberData) {
          return;
        }

        sessionStorage.setItem(
          'loginedMember',
          JSON.stringify(memberData)
        );
      } catch (err) {
        console.error('Failed to load exam document:', err);

        if (isMounted) {
          setError(
            'Không thể tải hồ sơ thi. Vui lòng thử tải lại trang.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void getMemberByUID();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const gender = member?.gender
    ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1)
    : '—';

  if (isLoading) {
    return (
      <div className="exam-document-container">
        <p role="status" className="exam-document-status">
          Đang tải hồ sơ thi...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-document-container">
        <p role="alert" className="exam-document-error">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="exam-document-container">
        <h2 className="exam-document-empty">
          Vui lòng đăng ký khóa học
        </h2>
      </div>
    );
  }

  return (
    <div className="exam-document-container">
      <div className="exam-document-title">
        <h1>Hồ sơ thi</h1>
      </div>

      <div className="exam-document-form">
        <article className="exam-document-paper">
          <header className="first-part">
            <h2>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
            <h3>Độc lập - Tự do - Hạnh phúc</h3>
            <div className="cross-line" />
          </header>

          <section className="second-part">
            <div className="member-img-container">
              <span>Ảnh thẻ</span>
            </div>

            <div className="exam-demand-title">
              <h2>
                ĐƠN ĐỀ NGHỊ HỌC, SÁT HẠCH ĐỂ CẤP GIẤY PHÉP LÁI XE
              </h2>

              <p>
                Kính gửi: SỞ GIAO THÔNG VẬN TẢI THÀNH PHỐ HỒ CHÍ MINH
              </p>
            </div>
          </section>

          <div className="document-row line-1">
            <div className="name-container">
              <span>Tôi là:</span>
              <strong>{displayValue(member.fullName)}</strong>
            </div>

            <div className="nationality-container">
              <span>Quốc tịch:</span>
              <strong>{displayValue(member.nationality)}</strong>
            </div>
          </div>

          <div className="document-row line-2">
            <div className="dob-container">
              <span>Sinh ngày:</span>
              <strong>{formatDate(member.dob)}</strong>
            </div>

            <div className="gender-container">
              <span>Giới tính:</span>
              <strong>{gender}</strong>
            </div>
          </div>

          <div className="document-row">
            <span>Nơi đăng ký hộ khẩu thường trú: </span>
            <strong>{displayValue(member.residenceAddress)}</strong>
          </div>

          <div className="document-row">
            <span>Nơi cư trú: </span>
            <strong>{displayValue(member.temporaryAddress)}</strong>
          </div>

          <div className="document-row">
            <span>
              Số giấy CMND, hoặc thẻ căn cước công dân (hoặc hộ chiếu):
            </span>
            <strong>{displayValue(member.identityCardNumber)}</strong>
          </div>

          <div className="document-row line-3">
            <div className="cccdDate-container">
              <span>Cấp ngày:</span>
              <strong>{formatDate(member.cardProvidedDate)}</strong>
            </div>

            <div className="cccdLocation-container">
              <span>Nơi cấp:</span>
              <strong>{displayValue(member.cardProvidedLocation)}</strong>
            </div>
          </div>

          <div className="document-row line-4">
            <div className="hasDrivingLicenseNo-container">
              <span>Đã có giấy phép lái xe số:</span>
              <strong>{displayValue(member.drivingLicenseNumber)}</strong>
            </div>

            <div className="hasDrivingLicenseTier-container">
              <span>Hạng:</span>
              <strong>{displayValue(member.drivingLicenseTier)}</strong>
            </div>

            <div className="hasDrivingLicenseBy-container">
              <span>Do:</span>
              <strong>{displayValue(member.drivingLicenseProvider)}</strong>
            </div>

            <div className="hasDrivingLicenseDate-container">
              <span>Cấp ngày:</span>
              <strong>{formatDate(member.drivingLicenseProvidedDate)}</strong>
            </div>
          </div>

          <div className="document-row">
            <span>
              Đề nghị cho tôi được học, dự sát hạch để cấp giấy phép lái xe hạng:
            </span>
            <strong>{displayValue(member.drivingTestTier)}</strong>
          </div>

          <div className="document-row integratedDrivingLicense">
            <span>Đăng ký tích hợp giấy phép lái xe:</span>

            <label className="document-checkbox">
              <input
                type="checkbox"
                defaultChecked={false}
                aria-label="Đăng ký tích hợp giấy phép lái xe"
              />
            </label>
          </div>

          <div className="document-row violation-row">
            <p>
              Vi phạm hành chính trong lĩnh vực giao thông đường bộ với
              hình thức tước quyền sử dụng giấy phép lái xe:
            </p>

            <div className="check-result">
              <label className="document-checkbox">
                <span>Có:</span>
                <input
                  type="checkbox"
                  id="revoked-yes"
                  name="revokedDrivingLicenseYes"
                  value="yes"
                />
              </label>

              <label className="document-checkbox">
                <span>Không:</span>
                <input
                  type="checkbox"
                  id="revoked-no"
                  name="revokedDrivingLicenseNo"
                  value="no"
                />
              </label>
            </div>
          </div>

          <div className="document-row enclosed-document">
            <p>Xin gửi kèm theo:</p>

            <ul className="enclosed-subLi">
              <li>01 giấy chứng nhận đủ sức khỏe.</li>

              <li>
                06 ảnh có màu cỡ 3cm x 4cm, chụp không quá 06 tháng.
              </li>

              <li>
                Bản sao giấy chứng minh nhân dân hoặc thẻ căn cước công
                dân hoặc hộ chiếu còn thời hạn có ghi số giấy chứng minh
                nhân dân hoặc thẻ căn cước công dân (đối với người Việt Nam)
                hoặc hộ chiếu (đối với người nước ngoài);
              </li>

              <li>Các tài liệu khác có liên quan gồm:</li>
            </ul>
          </div>

          <p className="exam-document-commitment">
            Tôi xin cam đoan những điều ghi trên là đúng sự thật,
            nếu sai tôi xin hoàn toàn chịu trách nhiệm.
          </p>

          <div className="sign-container">
            <p>TP. Hồ Chí Minh, ngày .......... tháng .......... năm 2023</p>
            <p>NGƯỜI LÀM ĐƠN</p>
            <p>(Ký và ghi rõ họ, tên)</p>
          </div>
        </article>
      </div>
    </div>
  );
}

export default ExamDocument;
