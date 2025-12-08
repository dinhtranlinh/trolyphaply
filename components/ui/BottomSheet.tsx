'use client';

import React, { useEffect, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

/**
 * BottomSheet Component
 * Modal drawer từ bottom - dùng cho filters, options
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '80vh',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end"
      onClick={handleBackdropClick}
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        ref={sheetRef}
        className="w-full rounded-t-2xl overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          maxHeight,
          animation: 'slide-up 0.3s ease-out',
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center py-3">
          <div
            className="w-12 h-1 rounded-full"
            style={{ background: 'var(--color-border-subtle)' }}
          />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <h2 className="section-title">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Animations cần thêm vào globals.css:
// @keyframes fade-in {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
// @keyframes slide-up {
//   from { transform: translateY(100%); }
//   to { transform: translateY(0); }
// }
