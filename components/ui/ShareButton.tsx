'use client';

import React, { useState } from 'react';
import { trackShare } from '@/lib/analytics';

interface ShareButtonProps {
  /** Tiêu đề nội dung chia sẻ */
  title: string;
  /** Mô tả ngắn */
  description: string;
  /** URL đầy đủ để chia sẻ */
  url: string;
  /** Hashtags (optional) */
  hashtags?: string[];
  /** Loại nội dung */
  type?: 'qa' | 'prompt' | 'law';
  /** Kích thước icon */
  size?: 'sm' | 'md' | 'lg';
  /** Hiển thị label text */
  showLabel?: boolean;
  /** Custom class */
  className?: string;
}

/**
 * ShareButton Component
 * Chia sẻ nội dung lên Facebook, Zalo hoặc Copy Link
 */
export default function ShareButton({
  title,
  description,
  url,
  hashtags = [],
  type = 'prompt',
  size = 'md',
  showLabel = false,
  className = '',
}: ShareButtonProps) {
  const [showCopied, setShowCopied] = useState(false);

  // Build share text với hashtags
  const shareText = `${title}\n\n${description}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;

  // Generate share URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
    zalo: `https://sp.zalo.me/share_inline?u=${encodeURIComponent(url)}&t=${encodeURIComponent(shareText)}`,
  };

  const handleShare = (platform: 'facebook' | 'zalo') => {
    const shareUrl = shareUrls[platform];
    
    // Track share event
    trackShare(platform, type, url);
    
    // Open in popup window
    window.open(
      shareUrl,
      'share-dialog',
      'width=626,height=436,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes'
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      
      // Track copy event
      trackShare('copy', type, url);
      
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Không thể copy link');
    }
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSize = iconSizes[size];
  const buttonSize = buttonSizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-600">Chia sẻ:</span>
      )}

      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook')}
        className={`${buttonSize} rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors`}
        title="Chia sẻ lên Facebook"
        aria-label="Share on Facebook"
      >
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* Zalo */}
      <button
        onClick={() => handleShare('zalo')}
        className={`${buttonSize} rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors`}
        title="Chia sẻ lên Zalo"
        aria-label="Share on Zalo"
      >
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.97 0 11.111c0 3.497 1.745 6.616 4.472 8.652L4.473 24l4.695-2.377c.913.207 1.865.322 2.832.322 6.627 0 12-4.97 12-11.111C24 4.97 18.627 0 12 0zm.5 15h-1l-3-3.5V15h-1v-5h1l3 3.5V10h1v5zm3 0h-2v-5h2v5zm3-3.5h-2V15h-1v-5h3v1.5z" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`${buttonSize} rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors relative`}
        title="Copy link"
        aria-label="Copy link"
      >
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>

        {/* Copied Tooltip */}
        {showCopied && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
            ✓ Đã copy!
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
          </div>
        )}
      </button>
    </div>
  );
}
