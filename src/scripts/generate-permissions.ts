// scripts/generate-permissions.ts
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function generatePermissions() {
  const permissions = await prisma.permissions.findMany();
  const lines = permissions.map((perm) => {
    const constName = perm.permission_name.toUpperCase().replace(/:/g, '_').replace(/-/g, '_'); // crea una constante en formato apropiado
    return `export const ${constName} = '${perm.permission_name}';`;
  });

  const content = lines.join('\n');
  const filePath = join(__dirname, '../constants/permissions.ts');
  
  writeFileSync(filePath, content, { encoding: 'utf8' });
  console.log(`Permissions constants file generated at ${filePath}`);
}

generatePermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });