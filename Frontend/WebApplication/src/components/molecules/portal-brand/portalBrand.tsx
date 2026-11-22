import './portal-brand.scss';

interface PortalBrandProps {
  brandName?: string;
  mark?: string;
  subtitle: string;
  className?: string;
  markClassName?: string;
  copyClassName?: string;
  nameClassName?: string;
  subtitleClassName?: string;
}

function PortalBrand({
  brandName = 'FDriving',
  mark = 'FD',
  subtitle,
  className = '',
  markClassName = '',
  copyClassName = '',
  nameClassName = '',
  subtitleClassName = '',
}: PortalBrandProps) {
  return (
    <div className={`portal-brand ${className}`.trim()}>
      <span
        className={`portal-brand__mark ${markClassName}`.trim()}
        aria-hidden="true"
      >
        {mark}
      </span>
      <span className={`portal-brand__copy ${copyClassName}`.trim()}>
        <strong className={`portal-brand__name ${nameClassName}`.trim()}>
          {brandName}
        </strong>
        <span className={`portal-brand__subtitle ${subtitleClassName}`.trim()}>
          {subtitle}
        </span>
      </span>
    </div>
  );
}

export default PortalBrand;
