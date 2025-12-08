import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  name: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * RadioGroup Component
 * Radio button group
 */
export default function RadioGroup({
  label,
  value,
  onChange,
  options,
  name,
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  className = '',
}: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="label-text block font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Radio Options */}
      <div
        className={`${
          orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'
        }`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-start gap-3 cursor-pointer ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="mt-0.5 w-4 h-4 accent-primary"
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-muted mt-0.5">{option.description}</div>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
