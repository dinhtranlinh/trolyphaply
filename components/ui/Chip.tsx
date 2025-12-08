import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'primary' | 'accent';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Chip Component
 * Dùng cho tags, filters, categories
 */
export default function Chip({
  children,
  active = false,
  onClick,
  onRemove,
  variant = 'default',
  size = 'md',
  className = '',
}: ChipProps) {
  const baseStyles = 'chip';

  const variantStyles = {
    default: active ? 'chip-active' : '',
    primary: active
      ? 'bg-blue-600 text-white'
      : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    accent: active
      ? 'bg-yellow-600 text-white'
      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
  };

  const sizeStyles = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <span className={combinedClassName} onClick={onClick}>
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 -mr-1 hover:bg-white/20 rounded-full p-0.5"
          aria-label="Xóa"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
