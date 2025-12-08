'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

/**
 * Header Component
 * - Homepage: Logo + "Trợ Lý Pháp Lý"
 * - Inner pages: Back button + Page title
 * - Optional right action (search, settings, etc.)
 */
export default function Header({ title, showBackButton = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Back button hoặc Logo */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Quay lại"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4V17c0 4.52-3.13 8.77-8 9.92-4.87-1.15-8-5.4-8-9.92V8.18l8-4z" />
                    <path d="M11 7h2v7h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Title hoặc Logo text */}
            {title ? (
              <h1 className="page-title">{title}</h1>
            ) : (
              <div>
                <h1 className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                  Trợ Lý Pháp Lý
                </h1>
              </div>
            )}
          </div>

          {/* Right: Optional action */}
          {rightAction && <div className="flex items-center">{rightAction}</div>}
        </div>
      </div>
    </header>
  );
}
