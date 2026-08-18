import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STAFF_USERNAMES = ["usu_pdu", "usu_mdeo", "usu_young", "usu_trini"];

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "cambiar123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Usuario admin listo -> usuario: "${username}"`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      `No definiste ADMIN_PASSWORD en .env, se usó la contraseña por defecto "cambiar123". Cambiala antes de usar en producción.`,
    );
  }

  for (const staffUsername of STAFF_USERNAMES) {
    const existing = await prisma.adminUser.findUnique({ where: { username: staffUsername } });
    if (existing) {
      console.log(`Usuario "${staffUsername}" ya existe, no se modifica.`);
      continue;
    }

    const staffPassword = crypto.randomBytes(6).toString("base64url");
    const staffPasswordHash = await bcrypt.hash(staffPassword, 10);
    await prisma.adminUser.create({
      data: { username: staffUsername, passwordHash: staffPasswordHash },
    });
    console.log(
      `Usuario "${staffUsername}" creado -> contraseña: "${staffPassword}" (guardala, no se vuelve a mostrar)`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
