import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const t = initTRPC.create({
  isServer: true,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const session = await auth();
  if (!session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: session.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: 'healthy' })),
  getCases: publicProcedure.query(async () => {
    const cases = await db.gameCase.findMany({
      include: {
        locations: true,
        suspects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return cases;
  }),
  getCaseById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const gameCase = await db.gameCase.findUnique({
        where: { id: input.id },
        include: {
          locations: true,
          suspects: true,
          clues: {
            include: { location: true },
            orderBy: { order: 'asc' },
          },
        },
      });
      return gameCase;
    }),
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await db.gameStat.findUnique({
      where: { userId: ctx.user.id },
    });
    return stats;
  }),
  createGameSession: protectedProcedure
    .input(z.object({ caseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await db.gameSession.create({
        data: {
          userId: ctx.user.id,
          gameCaseId: input.caseId,
          status: 'active',
        },
      });
      return session;
    }),
  collectClue: protectedProcedure
    .input(z.object({ sessionId: z.string(), clueId: z.string() }))
    .mutation(async ({ input }) => {
      const collectedClue = await db.gameSessionClue.create({
        data: {
          gameSessionId: input.sessionId,
          clueId: input.clueId,
        },
        include: { clue: true },
      });
      return collectedClue;
    }),
  submitSolution: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        suspectId: z.string(),
        method: z.string().min(10),
        motive: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if solution is correct
      const solution = await db.solution.findFirst({
        where: {
          gameCaseId: {
            in: await db.gameSession
              .findUnique({ where: { id: input.sessionId } })
              .then((s) => s?.gameCaseId || ''),
          },
          suspectId: input.suspectId,
        },
      });

      const isCorrect = !!solution;
      const points = isCorrect ? 100 : 0;

      const submission = await db.submission.create({
        data: {
          gameSessionId: input.sessionId,
          suspectId: input.suspectId,
          method: input.method,
          motive: input.motive,
          isCorrect,
          pointsAwarded: points,
        },
      });

      // Update game session
      await db.gameSession.update({
        where: { id: input.sessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          score: points,
        },
      });

      // Update user stats
      const stats = await db.gameStat.upsert({
        where: { userId: ctx.user.id },
        update: {
          gamesPlayed: { increment: 1 },
          gamesSolved: { increment: isCorrect ? 1 : 0 },
          totalScore: { increment: points },
          bestScore: {
            increment: points,
          },
        },
        create: {
          userId: ctx.user.id,
          gamesPlayed: 1,
          gamesSolved: isCorrect ? 1 : 0,
          totalScore: points,
          bestScore: points,
        },
      });

      return { submission, isCorrect, stats };
    }),
});

export type AppRouter = typeof appRouter;
