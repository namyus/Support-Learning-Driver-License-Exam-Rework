import CommitmentImg from '../../../../assets/imgs/commiting/commiting.png';
import './site-footer.scss';

export type SiteFooterVariant = 'guest' | 'member';

interface SiteFooterProps {
  variant?: SiteFooterVariant;
}

function SiteFooter({ variant = 'guest' }: SiteFooterProps) {
  return (
    <div
      className={`footer-container gh-footer-container site-footer--${variant}`}
    >
      <div className="footer-information gh-footer-info">
        <h1 className="gh-footer-title">Trung tâm đào tạo lái xe FDRIVING</h1>
        <div className="contact-information gh-footer-contact">
          <ul>
            <li>Liên hệ</li>
            <li>Hotline 1: 0987987654</li>
            <li>Hotline 2: 0978234786</li>
            <li>Địa chỉ: 123/56 Trần Hưng Đạo, Phường 5, Quận 1</li>
          </ul>
        </div>
      </div>

      <div className="divine-line gh-footer-divider" aria-hidden="true" />

      <div className="commiting-information gh-footer-legal">
        <p className="line-1">
          Quyết định thành lập số 773/QĐ – UBND ngày 27/02/2009.
        </p>
        <p className="line-2">
          Giấy phép số 69/TCĐBVN-QLPT&amp;NL ngày 08/07/2011 của Tổng Cục Đường
          bộ Việt Nam.
        </p>
        <img
          src={CommitmentImg}
          alt="Chứng nhận điểm ghi danh học lái xe Sở Giao thông Vận tải TP.HCM"
          className="gh-footer-badge"
        />
      </div>
    </div>
  );
}

export default SiteFooter;
