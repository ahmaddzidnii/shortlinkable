import { createTRPCRouter, } from '../init';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import urlsRouter from './urls';

export const appRouter = createTRPCRouter({
    urls: urlsRouter
});


export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;