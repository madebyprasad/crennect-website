'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/assets/images/logo.svg" alt="Crennect" style={{ filter: 'invert(1)' }} />
        </div>

        <h1 className="login-title">Portfolio Dashboard</h1>
        <p className="login-subtitle">Sign in to manage your portfolios</p>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="admin-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@crennect.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="admin-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="portfolio-button portfolio-button-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            href="/portfolio"
            style={{ color: 'var(--text-light)', fontSize: '14px' }}
          >
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
