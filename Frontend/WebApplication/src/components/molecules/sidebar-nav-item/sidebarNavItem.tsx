import { forwardRef, type ReactNode } from 'react';
import { NavLink, type NavLinkProps } from 'react-router-dom';
import './sidebar-nav-item.scss';

interface SidebarNavItemProps
  extends Omit<NavLinkProps, 'to' | 'children' | 'className'> {
  to: string;
  label: string;
  icon?: ReactNode;
  className?: string;
  activeClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
}

const SidebarNavItem = forwardRef<HTMLAnchorElement, SidebarNavItemProps>(
  function SidebarNavItem(
    {
      to,
      label,
      icon,
      className = '',
      activeClassName = 'is-active',
      iconClassName = '',
      labelClassName = '',
      ...linkProps
    },
    ref
  ) {
    return (
      <NavLink
        ref={ref}
        to={to}
        {...linkProps}
        className={({ isActive }) =>
          ['sidebar-nav-item', className, isActive ? activeClassName : '']
            .filter(Boolean)
            .join(' ')
        }
      >
        {icon && (
          <span
            className={`sidebar-nav-item__icon ${iconClassName}`.trim()}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <span className={`sidebar-nav-item__label ${labelClassName}`.trim()}>
          {label}
        </span>
      </NavLink>
    );
  }
);

export default SidebarNavItem;
