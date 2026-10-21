import { z } from "zod";

import { protectedProcedure, createTRPCRouter } from "../init";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { Prisma } from "@/generated/prisma/client";
import { decodeBase62ToBytes, encodeBytesToBase62 } from "@/lib/base62";
import { TRPCError } from "@trpc/server";


export const generate8ByteId = (): Uint8Array<ArrayBuffer> => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return bytes;
}


const urlsRouter = createTRPCRouter({
    getAll: protectedProcedure.input(
        z.object({
            page: z.number().min(MIN_PAGE_SIZE).default(DEFAULT_PAGE),
            pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
            search: z.string().nullish(),
        })).query(async ({ ctx, input }) => {
            const start = performance.now();
            const { page, pageSize, search } = input;

            const where: Prisma.UrlWhereInput = search
                ? {
                    OR: [
                        { originalUrl: { contains: search } },
                        { uniquePath: { contains: search } },
                    ],
                }
                : {};

            const [links, total] = await Promise.all([
                ctx.prisma.url.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                ctx.prisma.url.count({ where }),
            ]);

            const totalPages = Math.ceil(total / pageSize);

            const duration = Math.round(performance.now() - start);

            return {
                items: links.map((link) => ({
                    ...link,
                    id: encodeBytesToBase62(link.id),
                })),
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                    startRecord: total === 0 ? 0 : (page - 1) * pageSize + 1,
                    endRecord: Math.min(page * pageSize, total),
                },
                duration,
            };
        }),
    checkUniquePath: protectedProcedure.input(
        z.object({
            uniquePath: z.string().min(1).max(100),
        })
    ).query(async ({ ctx, input }) => {
        const { uniquePath } = input;

        const existingUrl = await ctx.prisma.url.findUnique({
            where: {
                uniquePath,
            },
        });
        if (existingUrl) {
            return { isAvailable: false };
        }
        return { isAvailable: true };
    }),
    create: protectedProcedure.input(
        z.object({
            originalUrl: z.string().url(),
            uniquePath: z.string().min(1).max(64).optional(),
        })
    ).mutation(async ({ ctx, input }) => {
        const { originalUrl, uniquePath } = input;

        const cleanPath = input.uniquePath ? input.uniquePath.trim() : null;

        if (cleanPath) {
            const existing = await ctx.prisma.url.findUnique({
                where: { uniquePath: cleanPath },
            });

            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Custom path sudah digunakan. Silakan gunakan path lain.",
                });
            }
        }

        const bytes = generate8ByteId();
        const newUrlId = encodeBytesToBase62(bytes);

        const newUrl = await ctx.prisma.url.create({
            data: {
                id: bytes,
                originalUrl,
                uniquePath,
            },
        });

        return {
            ...newUrl,
            id: encodeBytesToBase62(newUrl.id),
        };

    }),
    destroy: protectedProcedure.input(
        z.object({
            id: z.string().min(1),
        })
    ).mutation(async ({ ctx, input }) => {
        const { id } = input;
        await ctx.prisma.url.delete({
            where: {
                id: decodeBase62ToBytes(id),
            },
        });
    })
})


export default urlsRouter;