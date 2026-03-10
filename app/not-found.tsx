// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h1 className="text-6xl font-black uppercase tracking-tighter text-text-primary mb-4">404</h1>
      <p className="text-text-secondary mb-8">Page not found</p>
      <Link 
        href="/"
        className="text-audius-purple hover:text-text-primary transition-colors"
      >
        ← Back to comparison
      </Link>
    </div>
  );
}
