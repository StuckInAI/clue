import { Suspense } from 'react';
import CaseGrid from '@/components/game/CaseGrid';
import Hero from '@/components/layout/Hero';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Hero />
      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Featured Cases</h2>
          <Suspense fallback={<CasesSkeleton />}>
            <CaseGrid />
          </Suspense>
        </section>
        
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-3">1. Choose a Case</h3>
              <p className="text-muted-foreground">Select from various mystery cases with different difficulty levels.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-3">2. Investigate</h3>
              <p className="text-muted-foreground">Explore crime scenes, collect evidence, and interrogate suspects.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-3">3. Solve the Mystery</h3>
              <p className="text-muted-foreground">Use your deduction board to connect clues and submit your solution.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function CasesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  );
}
