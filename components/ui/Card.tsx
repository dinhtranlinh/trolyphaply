import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card Component
 * Variants: default (no shadow), outlined (border), elevated (shadow)
 */
export default function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  padding = 'md',
}: CardProps) {
  const baseStyles = 'card';
  
  const variantStyles = {
    default: '',
    outlined: 'border',
    elevated: 'card-shadow',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;

  if (onClick) {
    return (
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={`${combinedClassName} cursor-pointer hover:shadow-md transition-shadow w-full`}
      >
        {children}
      </div>
    );
  }

  return <div className={combinedClassName}>{children}</div>;
}
