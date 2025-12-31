'use client';

import { useState, useEffect } from 'react';

interface SafeModeToggleProps {
  className?: string;
  onToggle?: (enabled: boolean) => void;
}

export default function SafeModeToggle({ className = '', onToggle }: SafeModeToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadSafeMode();
  }, []);

  const loadSafeMode = async () => {
    try {
      const response = await fetch('/api/facebook/safe-mode');
      const data = await response.json();
      
      if (data.success) {
        setEnabled(data.safe_mode_enabled);
      }
    } catch (error) {
      console.error('Failed to load safe mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    setToggling(true);
    try {
      const response = await fetch('/api/facebook/safe-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEnabled(data.safe_mode_enabled);
        if (onToggle) {
          onToggle(data.safe_mode_enabled);
        }
      }
    } catch (error) {
      console.error('Failed to toggle safe mode:', error);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="h-8 w-14 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span className="text-sm text-gray-700">
        {enabled ? 'Paused' : 'Running'}
      </span>
      <button
        onClick={toggle}
        disabled={toggling}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
          enabled ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-1' : 'translate-x-7'
          }`}
        />
      </button>
    </div>
  );
}
