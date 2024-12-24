import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const baseClasses = 'rounded-full';
  const sizeClass = sizeClasses[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${baseClasses} ${sizeClass} object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${baseClasses} ${sizeClass} bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ${className}`}>
      <span className="font-medium text-white">
        {getInitials(name)}
      </span>
    </div>
  );
}
