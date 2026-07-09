import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = await bcrypt.hash('Zengincetomaxx.1', 12);
await prisma.user.update({
  where: { email: 'dnoonehere@gmail.com' },
  data: { passwordHash: hash }
});
console.log('Şifre güncellendi:', hash);
await prisma.$disconnect();
