import React from 'react';

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  helperText?: string;
  className?: string;
}

/**
 * TextArea Component
 * Multiline text input
 */
export default function TextArea({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  helperText,
  className = '',
}: TextAreaProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label className="label-text block font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* TextArea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`input textarea ${
          error ? 'border-red-500 focus:border-red-500 focus:shadow-red-100' : ''
        }`}
        suppressHydrationWarning
      />

      {/* Character Count / Error / Helper */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          {error ? (
            <p className="text-xs text-error">{error}</p>
          ) : helperText ? (
            <p className="text-xs text-muted">{helperText}</p>
          ) : null}
        </div>

        {maxLength && (
          <p className="text-xs text-muted shrink-0">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
