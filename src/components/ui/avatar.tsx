'use client'

interface AvatarProps {
  user: {
    full_name: string
    avatar_url?: string
  }
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
}

export function Avatar({ user, size = 'md' }: AvatarProps) {
  const sizeClasses = sizes[size]

  return user.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user.full_name}
      className={`${sizeClasses} rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-gray-100`}
    >
      <span className="font-medium text-gray-600">
        {user.full_name[0].toUpperCase()}
      </span>
    </div>
  )
}
