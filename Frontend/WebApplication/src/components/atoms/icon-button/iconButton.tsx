import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './icon-button.scss';

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
  label: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      label,
      className = '',
      type = 'button',
      'aria-label': ariaLabel,
      ...buttonProps
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        {...buttonProps}
        type={type}
        aria-label={ariaLabel || label}
        className={`icon-button ${className}`.trim()}
      >
        {icon}
      </button>
    );
  }
);

export default IconButton;
