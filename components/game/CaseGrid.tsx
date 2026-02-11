"use client";

import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CaseGrid() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: cases, isLoading } = trpc.getCases.useQuery();

  const handleCaseClick = (caseId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }
    router.push(`/game/${caseId}`);
  };

  if (isLoading) {
    return null; // Skeleton is handled in parent
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases?.map((gameCase) => (
        <Card
          key={gameCase.id}
          className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-border"
          onClick={() => handleCaseClick(gameCase.id)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{gameCase.title}</CardTitle>
              <div className="flex items-center gap-2">
                {gameCase.difficulty === 'hard' ? (
                  <Lock className="w-4 h-4 text-destructive" />
                ) : (
                  <Unlock className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm text-muted-foreground capitalize">
                  {gameCase.difficulty}
                </span>
              </div>
            </div>
            <CardDescription className="line-clamp-2">
              {gameCase.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {gameCase.timeLimit ? `${gameCase.timeLimit} min` : 'No limit'}
                </span>
              </div>
              <span className="text-lg font-bold text-primary">
                {gameCase.points} pts
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                {gameCase.locations.length} locations
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                {gameCase.suspects.length} suspects
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg">
              {session ? 'Investigate' : 'Login to Play'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
