// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <Link 
        href="/"
        className="text-purple-600 hover:underline"
      >
        ← Back to comparison
      </Link>
    </div>
  );
}
