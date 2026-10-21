import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { decodeBase62ToBytes } from "@/lib/base62";

const RESERVED_SLUGS = new Set([
    "manage",
    "api",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
]);

const NOT_FOUND_REDIRECT_URL = "/?reason=destination-not-found";

// Security headers standar untuk redirect
const REDIRECT_HEADERS = {
    "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
};

interface RouteContext {
    params: Promise<{
        "unique-path": string;
    }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
    const { "unique-path": slug } = await context.params;

    // Cek slug kosong & blacklist
    if (!slug || RESERVED_SLUGS.has(slug.toLowerCase())) {
        return NextResponse.redirect(new URL(NOT_FOUND_REDIRECT_URL, request.url));
    }

    // Cari berdasarkan uniquePath
    let link = await prisma.url.findUnique({
        where: {
            uniquePath: slug,
        },
        select: {
            originalUrl: true,
        },
    });

    // Fallback: cari via id (Base62)
    if (!link) {
        try {
            const decodedBytes = decodeBase62ToBytes(slug, 8);

            // Bungkus ke ArrayBuffer eksklusif agar aman dari error type Uint8Array Prisma
            const arrayBuffer = new ArrayBuffer(decodedBytes.byteLength);
            new Uint8Array(arrayBuffer).set(decodedBytes);

            link = await prisma.url.findUnique({
                where: {
                    id: new Uint8Array(arrayBuffer),
                },
                select: {
                    originalUrl: true,
                },
            });
        } catch {
            // Abaikan jika format Base62 salah
        }
    }

    // Jika data tidak ada di DB
    if (!link) {
        return NextResponse.redirect(new URL(NOT_FOUND_REDIRECT_URL, request.url));
    }

    // Validasi format URL & skema protokol
    try {
        const destination = new URL(link.originalUrl);

        if (destination.protocol !== "http:" && destination.protocol !== "https:") {
            return NextResponse.redirect(new URL(NOT_FOUND_REDIRECT_URL, request.url));
        }

        destination.searchParams.set("utm_source", "links.ahmadzidni.com");
        destination.searchParams.set("utm_medium", "redirect");
        destination.searchParams.set("utm_campaign", "link-redirect");

        return NextResponse.redirect(destination.toString(), {
            status: 307,
            headers: REDIRECT_HEADERS,
        });
    } catch {
        return NextResponse.redirect(new URL(NOT_FOUND_REDIRECT_URL, request.url));
    }
}