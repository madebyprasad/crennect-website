import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page">
      <section
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(80px, 20vw, 150px)',
              fontWeight: '800',
              color: 'var(--accent)',
              lineHeight: '1',
              marginBottom: '20px',
            }}
          >
            404
          </h1>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '700',
              marginBottom: '16px',
            }}
          >
            Page Not Found
          </h2>
          <p
            style={{
              color: 'var(--text-light)',
              marginBottom: '32px',
              maxWidth: '400px',
            }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/portfolio" className="portfolio-button portfolio-button-primary">
            Go to Portfolio
          </Link>
        </div>
      </section>
    </div>
  );
}
