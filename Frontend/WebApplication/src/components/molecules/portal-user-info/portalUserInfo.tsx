import UserAvatar, { type UserAvatarSize } from '../../atoms/user-avatar/userAvatar';
import './portal-user-info.scss';

interface PortalUserInfoProps {
  name: string;
  role: string;
  avatarSrc?: string | null;
  avatarSize?: UserAvatarSize;
  className?: string;
  avatarClassName?: string;
  textClassName?: string;
  nameClassName?: string;
  roleClassName?: string;
}

function PortalUserInfo({
  name,
  role,
  avatarSrc,
  avatarSize = 'sm',
  className = '',
  avatarClassName = '',
  textClassName = '',
  nameClassName = '',
  roleClassName = '',
}: PortalUserInfoProps) {
  return (
    <span className={`portal-user-info ${className}`.trim()}>
      <UserAvatar
        src={avatarSrc}
        alt=""
        size={avatarSize}
        className={`portal-user-info__avatar ${avatarClassName}`.trim()}
      />
      <span className={`portal-user-info__text ${textClassName}`.trim()}>
        <strong className={`portal-user-info__name ${nameClassName}`.trim()}>
          {name}
        </strong>
        <span className={`portal-user-info__role ${roleClassName}`.trim()}>
          {role}
        </span>
      </span>
    </span>
  );
}

export default PortalUserInfo;
