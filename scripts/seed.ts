// import "dotenv/config";
// import { randomBytes } from "node:crypto";
// import { PrismaPg } from "@prisma/adapter-pg";

// import { encodeBytesToBase62 } from "@/lib/base62";
// import { PrismaClient } from "@/generated/prisma/client";

// const adapter = new PrismaPg({
//     connectionString: process.env.DATABASE_URL,
// });
// const prisma = new PrismaClient({
//     adapter,
// });

// function generate8ByteId(): Uint8Array<ArrayBuffer> {
//     const buf = randomBytes(8);
//     const arrayBuffer = new ArrayBuffer(8);
//     new Uint8Array(arrayBuffer).set(buf);
//     return new Uint8Array(arrayBuffer);
// }

// const dummyLinks = [
//     {
//         uniquePath: "porto",
//         originalUrl: "https://ahmadzidni.com",
//     },
//     {
//         uniquePath: "github",
//         originalUrl: "https://github.com/ahmaddzidnii",
//     },
//     {
//         uniquePath: "linkedin",
//         originalUrl: "https://www.linkedin.com/in/ahmad-zidni-hidayat",
//     },
//     {
//         uniquePath: null,
//         originalUrl: "https://nextjs.org/docs",
//     },
//     {
//         uniquePath: null,
//         originalUrl: "https://www.prisma.io/docs",
//     },
//     {
//         uniquePath: "youtube",
//         originalUrl: "https://www.youtube.com/@ahmaddzidnii",
//     },
// ];

// async function main() {
//     console.log("🌱 Menghapus data lama...");
//     await prisma.url.deleteMany();

//     console.log("🚀 Memulai seeding data URL...");

//     for (const item of dummyLinks) {
//         const id = generate8ByteId();
//         const base62Id = encodeBytesToBase62(id);

//         const created = await prisma.url.create({
//             data: {
//                 id,
//                 uniquePath: item.uniquePath,
//                 originalUrl: item.originalUrl,
//             },
//         });

//         const activeSlug = created.uniquePath ?? base62Id;
//         console.log(
//             `✓ Link dibuat: /${activeSlug} -> ${created.originalUrl} (ID Base62: ${base62Id})`
//         );
//     }

//     console.log("\n✅ Seeding selesai dengan sukses!");
// }

// main()
//     .catch((e) => {
//         console.error("❌ Error saat seeding:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });



import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";

import { encodeBytesToBase62 } from "@/lib/base62";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const TOTAL_DATA = 100_000;
const BATCH_SIZE = 5_000;

const DOMAINS = [
    "example.com",
    "github.com",
    "nextjs.org",
    "prisma.io",
    "stackoverflow.com",
    "developer.mozilla.org",
    "vercel.com",
    "typescriptlang.org",
    "react.dev",
    "npmjs.com",
];

const PATHS = [
    "docs/getting-started",
    "blog/technology",
    "products",
    "about",
    "documentation",
    "guides/database",
    "articles/web-development",
    "resources/tutorials",
    "projects",
    "learn/typescript",
];

export function generate8ByteId(): Uint8Array<ArrayBuffer> {
    const buf = randomBytes(8);
    const arrayBuffer = new ArrayBuffer(8);

    new Uint8Array(arrayBuffer).set(buf);

    return new Uint8Array(arrayBuffer);
}

function generateDummyLink(index: number) {
    const id = generate8ByteId();
    const base62Id = encodeBytesToBase62(id);

    const domain = DOMAINS[index % DOMAINS.length];
    const path = PATHS[index % PATHS.length];

    // 60% custom slug, 40% menggunakan ID Base62 sebagai path.
    const uniquePath =
        index % 10 < 6 ? `link-${index.toString(36)}` : null;

    return {
        id,
        uniquePath,
        originalUrl: `https://${domain}/${path}/${index.toString(36)}`,
    };
}

async function main() {
    console.log("🌱 Menghapus data lama...");

    // PERHATIAN: menghapus seluruh data URL yang sudah ada.
    await prisma.url.deleteMany();

    console.log(`🚀 Membuat ${TOTAL_DATA.toLocaleString()} dummy URLs...`);

    const startedAt = Date.now();
    let inserted = 0;

    for (let start = 0; start < TOTAL_DATA; start += BATCH_SIZE) {
        const size = Math.min(BATCH_SIZE, TOTAL_DATA - start);

        const batch = Array.from({ length: size }, (_, offset) =>
            generateDummyLink(start + offset),
        );

        await prisma.url.createMany({
            data: batch,
        });

        inserted += batch.length;

        const percentage = ((inserted / TOTAL_DATA) * 100).toFixed(1);

        console.log(
            `✓ ${inserted.toLocaleString()} / ${TOTAL_DATA.toLocaleString()} (${percentage}%)`,
        );
    }

    const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(2);

    console.log("\n✅ Seeding selesai!");
    console.log(`📦 Total data : ${inserted.toLocaleString()}`);
    console.log(`⏱️ Durasi     : ${elapsedSeconds} detik`);
}

main()
    .catch((error) => {
        console.error("❌ Seeding gagal:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
