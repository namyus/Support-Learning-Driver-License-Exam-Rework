import { Link } from 'react-router-dom';

export type RouteFallbackVariant = 'not-found' | 'forbidden';

interface RouteFallbackPageProps {
  variant: RouteFallbackVariant;
}

function RouteFallbackPage({ variant }: RouteFallbackPageProps) {
  const isForbidden = variant === 'forbidden';

  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: '#f8fafc',
      }}
    >
      <section
        role="alert"
        aria-labelledby="route-fallback-heading"
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
          border: '1px solid #e2e8f0',
        }}
      >
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: isForbidden ? '#b91c1c' : '#1e62b6',
          }}
        >
          {isForbidden ? '403 — KHÔNG CÓ QUYỀN TRUY CẬP' : '404 — KHÔNG TÌM THẤY TRANG'}
        </p>
        <h1
          id="route-fallback-heading"
          style={{
            margin: '0 0 12px',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {isForbidden
            ? 'Bạn không có quyền truy cập trang này'
            : 'Trang bạn tìm kiếm không tồn tại'}
        </h1>
        <p
          style={{
            margin: '0 0 24px',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: '#475569',
          }}
        >
          {isForbidden
            ? 'Tài khoản hiện tại của bạn không có quyền mở đường dẫn này. Vui lòng quay lại trang chính dành cho vai trò của bạn.'
            : 'Đường dẫn có thể đã thay đổi hoặc không chính xác. Vui lòng quay lại trang chủ.'}
        </p>
        <Link
          to="/"
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontWeight: 600 }}
        >
          Quay lại trang chủ
        </Link>
      </section>
    </main>
  );
}

export default RouteFallbackPage;
