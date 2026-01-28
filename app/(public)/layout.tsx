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
    <div className="flex flex-col min-h-screen">
      <Header competitors={competitors} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
