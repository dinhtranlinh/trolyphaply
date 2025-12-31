'use client';

import { useEffect, useState } from 'react';

interface ConnectionStatusProps {
  className?: string;
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'expired' | 'loading'>('loading');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/facebook/connection');
      const data = await response.json();

      if (data.success && data.connection) {
        const isValid = data.connection.isValid ?? data.connection.is_valid;
        if (isValid) {
          setStatus('connected');
        } else {
          setStatus('expired');
        }
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
      setStatus('disconnected');
    }
  };

  if (status === 'loading') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
        <span className="text-xs font-medium text-gray-600">Checking...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-xs font-medium text-green-700">Connected</span>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
        <span className="text-xs font-medium text-yellow-700">Token Expired</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-red-500"></div>
      <span className="text-xs font-medium text-red-700">Disconnected</span>
    </div>
  );
}
