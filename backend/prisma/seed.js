"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping Master Admin seed.');
        return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Master Admin account for ${email} already exists — skipping.`);
        return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: { email, passwordHash, role: client_1.Role.ADMIN, isMasterAdmin: true, adminPermissions: [] },
    });
    console.log(`Master Admin account created for ${email}.`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map