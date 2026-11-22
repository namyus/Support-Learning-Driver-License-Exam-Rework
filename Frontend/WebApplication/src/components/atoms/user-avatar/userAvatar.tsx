import { BsPersonCircle } from 'react-icons/bs';
import './user-avatar.scss';

export type UserAvatarSize = 'sm' | 'md' | 'lg';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: UserAvatarSize;
  className?: string;
}

function UserAvatar({
  src,
  alt = 'Ảnh đại diện',
  size = 'md',
  className = '',
}: UserAvatarProps) {
  return (
    <span className={`user-avatar user-avatar--${size} ${className}`.trim()}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <BsPersonCircle aria-label={alt || undefined} aria-hidden={!alt} />
      )}
    </span>
  );
}

export default UserAvatar;
