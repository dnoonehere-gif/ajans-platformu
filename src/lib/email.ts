import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"Ajans Platformu" <${process.env.SMTP_USER ?? "noreply@ajansplatformu.com"}>`;
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${BASE_URL}/mail-dogrulama?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "E-posta adresinizi doğrulayın",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#6366f1">Hoş geldiniz!</h2>
        <p>Aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          E-postamı Doğrula
        </a>
        <p style="color:#888;font-size:13px">Bu link 24 saat geçerlidir. Eğer kaydolmadıysanız bu maili yok sayın.</p>
      </div>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${BASE_URL}/sifremi-sifirla?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Şifre sıfırlama isteği",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#6366f1">Şifrenizi sıfırlayın</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Şifremi Sıfırla
        </a>
        <p style="color:#888;font-size:13px">Bu link 1 saat geçerlidir. Eğer bu isteği siz yapmadıysanız güvende olduğunuzu bilmenizi isteriz.</p>
      </div>`,
  });
}
