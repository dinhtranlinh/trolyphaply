'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import TextInput from '@/components/forms/TextInput';
import Card from '@/components/ui/Card';

/**
 * Admin Login Page
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Đăng nhập thất bại');
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
            style={{ background: 'var(--color-primary-soft)' }}
          >
            ⚖️
          </div>
          <h1 className="page-title mb-2">Admin Dashboard</h1>
          <p className="text-sm text-muted">Đăng nhập để quản lý hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="admin@trolyphaply.vn"
            required
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            }
          />

          <TextInput
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />

          {error && (
            <div className="p-3 rounded" style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)' }}>
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            type="submit"
            loading={loading}
            disabled={loading || !email || !password}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-primary hover:underline"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </Card>
    </div>
  );
}
