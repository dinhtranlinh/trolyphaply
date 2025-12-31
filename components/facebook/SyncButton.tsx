'use client';

import { useState } from 'react';

interface SyncButtonProps {
  onSync?: () => Promise<void>;
  className?: string;
}

export default function SyncButton({ onSync, className = '' }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      if (onSync) {
        await onSync();
      } else {
        const response = await fetch('/api/facebook/pages/sync', {
          method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
          alert(`Successfully synced ${data.pages?.length || 0} pages from Facebook!`);
          window.location.reload();
        } else {
          alert(`Failed to sync: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to sync pages:', error);
      alert('Failed to sync pages');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2 ${className}`}
    >
      {syncing ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
          Syncing...
        </>
      ) : (
        <>
          <span>🔄</span>
          Sync from Facebook
        </>
      )}
    </button>
  );
}
