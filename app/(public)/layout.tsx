// app/(public)/layout.tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCompetitors } from '@/lib/data';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const competitors = await getCompetitors();
  
  return (
    <div className="min-h-screen bg-surface text-text-primary font-sans flex flex-col relative">
      <div
        className="noise-overlay fixed inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
        aria-hidden="true"
      />
      <Header competitors={competitors} />
      <main className="flex-1 relative z-10 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
