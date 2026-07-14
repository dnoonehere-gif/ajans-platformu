// =============================================================
//  KİMLİK DOĞRULAMA (NextAuth v5)
//  Kredensiyel (e-posta + şifre) girişi + Prisma adaptörü.
// =============================================================
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/giris" },
  providers: [
    Credentials({
      name: "Kredensiyel",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const identifier = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!identifier || !password) return null;

        // E-posta, telefon veya kullanıcı adı (isim) ile giriş
        const phoneDigits = identifier.replace(/\D/g, "");
        const phoneVariants = phoneDigits.length >= 10
          ? [phoneDigits, phoneDigits.startsWith("0") ? phoneDigits.slice(1) : `0${phoneDigits}`]
          : [];
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier.toLowerCase() },
              ...(phoneVariants.length ? [{ phone: { in: phoneVariants } }] : []),
              { name: identifier },
            ],
          },
        });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.globalRole };
      },
    }),
  ],
  callbacks: {
    // Rol bilgisini token ve oturuma taşı
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
