import type { ImgHTMLAttributes } from 'react';
import logo from '../../../../assets/imgs/logo.png';
import './brand-logo.scss';

type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

function BrandLogo({
  alt = 'Trung tâm đào tạo lái xe FDriving',
  className = '',
  ...imageProps
}: BrandLogoProps) {
  return (
    <img
      src={logo}
      alt={alt}
      className={`brand-logo ${className}`.trim()}
      {...imageProps}
    />
  );
}

export default BrandLogo;
