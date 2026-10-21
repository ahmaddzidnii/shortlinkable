import superjson from 'superjson';
import { initTRPC, TRPCError } from '@trpc/server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';


export const createTRPCContext = async (opts: { headers: Headers }) => {
    return {
        prisma,
        headers: opts.headers,

    };
};

const t = initTRPC
    .context<Awaited<ReturnType<typeof createTRPCContext>>>()
    .create({
        transformer: superjson,
    });

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
    const session = await auth.api.getSession({
        headers: ctx.headers,
    });

    if (!session) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource.',
        });
    }

    return next({
        ctx: {
            ...ctx,
            session,
        }
    })

})