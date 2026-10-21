import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });
async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Administrator";

    if (!email || !password) {
        console.warn("⚠️  ADMIN_EMAIL atau ADMIN_PASSWORD tidak ditemukan di environment. Melewati seed user.");
        process.exit(0);
    }

    console.log(`⏳ Memeriksa keberadaan user: ${email}...`);

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log("✅ User sudah terdaftar. Melewati pembuatan.");
        process.exit(0);
    }

    console.log("🌱 Membuat user baru via Better Auth...");

    try {
        // Gunakan internal API Better Auth agar hashing password & row tabel account otomatis dibuat
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
        });

        console.log("🎉 Berhasil seed user admin!");
    } catch (error) {
        console.error("❌ Gagal membuat user admin:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();