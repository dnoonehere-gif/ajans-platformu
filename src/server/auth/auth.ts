// =============================================================
//  KİMLİK DOĞRULAMA (NextAuth v5)
//  Kredensiyel (e-posta + şifre) girişi + Prisma adaptörü.
// =============================================================
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/server/security/totp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/giris" },
  providers: [
    // ── Sosyal giriş ──
    // Kimlik bilgisi tanımlı DEĞİLSE sağlayıcı hiç eklenmez; böylece eksik
    // yapılandırmada giriş sayfası hata vermek yerine sadece butonu göstermez.
    // NOT: allowDangerousEmailAccountLinking BİLEREK açılmadı — açık olsaydı,
    // saldırgan kurbanın e-postasıyla (doğrulamadan) şifreli hesap açıp
    // kurban Google ile girince o hesaba erişebilirdi.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    Credentials({
      name: "Kredensiyel",
      credentials: { email: {}, password: {}, totp: {} },
      async authorize(credentials) {
        const identifier = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        const totp = String(credentials?.totp ?? "").replace(/\s/g, "");
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

        // ── İki adımlı doğrulama ──
        // 2FA açık olan hesaplarda şifre TEK BAŞINA yetmez; TOTP kodu da
        // sunucuda doğrulanır. Daha önce 2FA uçları vardı ama girişte hiç
        // zorlanmıyordu, yani özellik fiilen kapalıydı.
        if (user.twoFactorEnabled) {
          if (!user.twoFactorSecret) return null; // tutarsız kayıt: girişe izin verme
          if (!totp) return null;                 // kod girilmemiş
          if (!(await verifyTotp(totp, user.twoFactorSecret))) return null;
        }

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
      // Google ile girişte `user` adapter'dan gelir ve alan adı `globalRole`
      // olduğu için `role` boş kalıyordu; middleware de boş rolü CUSTOMER
      // sayıp admin panelini /dashboard'a yönlendiriyordu. Rol yoksa DB'den
      // okunur — böylece hem OAuth girişleri hem de sonradan yükseltilen
      // hesaplar doğru yetkiyi alır.
      if (!token.role && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { globalRole: true },
        });
        if (dbUser) token.role = dbUser.globalRole;
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
