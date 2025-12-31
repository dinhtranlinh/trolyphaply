'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Connection {
  id: string;
  page_access_token: string;
  expiresAt: string | null;
  scopes: string[];
  isValid: boolean;
  created_at: string;
}

function formatExpiresAt(value: string | number | null | undefined): string {
  if (!value) {
    return 'Unknown';
  }

  let date: Date;
  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value;
    date = new Date(ms);
  } else {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      const ms = numeric < 1e12 ? numeric * 1000 : numeric;
      date = new Date(ms);
    } else {
      date = new Date(value);
    }
  }

  if (Number.isNaN(date.getTime()) || date.getTime() <= 0) {
    return 'Unknown';
  }

  return date.toLocaleString('vi-VN');
}

export default function ConnectionPage() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/connection');
      const data = await response.json();
      
      if (data.success && data.connection) {
        setConnection(data.connection);
      } else {
        setConnection(null);
      }
    } catch (error) {
      console.error('Failed to load connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    if (!tokenInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a token' });
      return;
    }

    setVerifying(true);
    setMessage(null);

    try {
      const response = await fetch('/api/facebook/connection/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: tokenInput }),
      });

      const data = await response.json();

      if (data.success && data.valid) {
        const info = data.tokenInfo;
        setMessage({
          type: 'success',
          text: `Token is valid! User ID: ${info.user_id || 'Unknown'}, Expires: ${formatExpiresAt(info.expiresAt)}`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `Token verification failed: ${data.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to verify token',
      });
    } finally {
      setVerifying(false);
    }
  };

  const saveToken = async () => {
    if (!tokenInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a token' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/facebook/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: tokenInput }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Token saved successfully! You can now sync your pages.',
        });
        setTokenInput('');
        await loadConnection();
      } else {
        setMessage({
          type: 'error',
          text: `Failed to save token: ${data.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to save token',
      });
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    if (!confirm('Are you sure you want to disconnect? This will remove all pages and rules.')) {
      return;
    }

    setDisconnecting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/facebook/connection', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Disconnected successfully',
        });
        setConnection(null);
      } else {
        setMessage({
          type: 'error',
          text: `Failed to disconnect: ${data.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to disconnect',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facebook Connection</h1>
        <p className="text-sm text-gray-600 mt-1">
          Connect your Facebook account to manage page automation
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Connection Status */}
      {connection && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <span className="text-4xl">
                {connection.isValid ? '✅' : '⚠️'}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {connection.isValid ? 'Connected' : 'Token Expired'}
                </h2>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Expires:</span>{' '}
                    {formatExpiresAt(connection.expiresAt)}
                  </p>
                  <p>
                    <span className="font-medium">Scopes:</span>{' '}
                    {connection.scopes.join(', ')}
                  </p>
                  <p>
                    <span className="font-medium">Connected since:</span>{' '}
                    {new Date(connection.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={disconnect}
              disabled={disconnecting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>

          {!connection.isValid && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              ⚠️ Your token has expired. Please enter a new token below to reconnect.
            </div>
          )}
        </div>
      )}

      {/* Token Input Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {connection ? 'Update Token' : 'Connect Facebook'}
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              User Access Token
            </label>
            <textarea
              id="token"
              rows={4}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste your Facebook User Access Token here..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={verifyToken}
              disabled={verifying || !tokenInput.trim()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {verifying ? 'Verifying...' : 'Verify Token'}
            </button>
            <button
              onClick={saveToken}
              disabled={saving || !tokenInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {saving ? 'Saving...' : 'Save & Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📘 How to Get Your Access Token
        </h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>
              Go to{' '}
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                Facebook Graph API Explorer
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>Select your app from the dropdown</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>Click "Generate Access Token" and grant all permissions</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">4.</span>
            <span>Copy the token and paste it above</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">5.</span>
            <span>
              Required permissions: <code className="bg-blue-100 px-1 rounded">pages_show_list</code>,{' '}
              <code className="bg-blue-100 px-1 rounded">pages_read_engagement</code>,{' '}
              <code className="bg-blue-100 px-1 rounded">pages_manage_posts</code>,{' '}
              <code className="bg-blue-100 px-1 rounded">pages_manage_engagement</code>,{' '}
              <code className="bg-blue-100 px-1 rounded">pages_messaging</code>
            </span>
          </li>
        </ol>
      </div>

      {/* Next Steps */}
      {connection && connection.isValid && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            ✅ Next Steps
          </h3>
          <ol className="space-y-2 text-sm text-green-800">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>
                Go to{' '}
                <Link href="/admin/facebook/pages" className="underline hover:text-green-900">
                  Pages Management
                </Link>{' '}
                and sync your pages
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>Enable automation for pages you want to manage</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>
                Create{' '}
                <Link href="/admin/facebook/reply-rules" className="underline hover:text-green-900">
                  Reply Rules
                </Link>{' '}
                for auto-replying to comments
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>
                Configure{' '}
                <Link href="/admin/facebook/message-rules" className="underline hover:text-green-900">
                  Message Rules
                </Link>{' '}
                for inbox automation
              </span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
