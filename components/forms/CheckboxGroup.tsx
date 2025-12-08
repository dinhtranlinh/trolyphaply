import React from 'react';

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
}

interface CheckboxGroupProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: CheckboxOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * CheckboxGroup Component
 * Multiple checkbox selection
 */
export default function CheckboxGroup({
  label,
  values,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  className = '',
}: CheckboxGroupProps) {
  const handleToggle = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((v) => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="label-text block font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Checkbox Options */}
      <div
        className={`${
          orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'
        }`}
      >
        {options.map((option) => {
          const isChecked = values.includes(option.value);

          return (
            <label
              key={option.value}
              className={`flex items-start gap-3 cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(option.value)}
                disabled={disabled}
                className="mt-0.5 w-4 h-4 accent-primary rounded"
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
          );
        })}
      </div>

      {/* Error */}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
