import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";

import { encodeBytesToBase62 } from "@/lib/base62";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
    adapter,
});

function generate8ByteId(): Uint8Array<ArrayBuffer> {
    const buf = randomBytes(8);
    const arrayBuffer = new ArrayBuffer(8);
    new Uint8Array(arrayBuffer).set(buf);
    return new Uint8Array(arrayBuffer);
}

const dummyLinks = [
    {
        uniquePath: "porto",
        originalUrl: "https://ahmadzidni.com",
    },
    {
        uniquePath: "github",
        originalUrl: "https://github.com/ahmaddzidnii",
    },
    {
        uniquePath: "linkedin",
        originalUrl: "https://www.linkedin.com/in/ahmad-zidni-hidayat",
    },
    {
        uniquePath: null,
        originalUrl: "https://nextjs.org/docs",
    },
    {
        uniquePath: null,
        originalUrl: "https://www.prisma.io/docs",
    },
    {
        uniquePath: "youtube",
        originalUrl: "https://www.youtube.com/@ahmaddzidnii",
    },
];

async function main() {
    console.log("🌱 Menghapus data lama...");
    await prisma.url.deleteMany();

    console.log("🚀 Memulai seeding data URL...");

    for (const item of dummyLinks) {
        const id = generate8ByteId();
        const base62Id = encodeBytesToBase62(id);

        const created = await prisma.url.create({
            data: {
                id,
                uniquePath: item.uniquePath,
                originalUrl: item.originalUrl,
            },
        });

        const activeSlug = created.uniquePath ?? base62Id;
        console.log(
            `✓ Link dibuat: /${activeSlug} -> ${created.originalUrl} (ID Base62: ${base62Id})`
        );
    }

    console.log("\n✅ Seeding selesai dengan sukses!");
}

main()
    .catch((e) => {
        console.error("❌ Error saat seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });