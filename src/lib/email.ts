import { Resend } from "resend";

const FROM = `Novelya <novelya@novelya.com.tr>`;
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

interface Attachment {
  filename: string;
  content: Buffer;
}

async function sendMail(
  to: string | string[],
  subject: string,
  html: string,
  attachments?: Attachment[],
) {
  const resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder");
  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });
}

function layout(opts: { preheader?: string; body: string; footerNote?: string }) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Novelya</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',Arial,sans-serif;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:inline-block;text-align:center;line-height:32px;font-size:16px;font-weight:900;color:#fff;">N</div>
              <span style="color:#fff;font-size:16px;font-weight:700;margin-left:8px;">Novelya</span>
            </div>
          </td>
        </tr>
        <tr><td style="padding:32px;">${opts.body}</td></tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a35;background:#13131a;">
            <p style="margin:0 0 6px;font-size:12px;color:#666;">${opts.footerNote ?? "Bu e-postayı hesabınızla ilgili bir işlem nedeniyle aldınız."}</p>
            <p style="margin:0;font-size:12px;color:#444;">© ${new Date().getFullYear()} Novelya &nbsp;·&nbsp;<a href="${BASE_URL}" style="color:#6366f1;text-decoration:none;">novelya.com.tr</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const h = (t: string) => `<h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f0f0ff;">${t}</h1>`;
const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;color:#a0a0b8;line-height:1.7;">${t}</p>`;
const cta = (t: string, u: string) => `<a href="${u}" style="display:inline-block;margin:8px 0 24px;padding:13px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">${t}</a>`;
const divider = () => `<hr style="border:none;border-top:1px solid #2a2a35;margin:24px 0;" />`;
const infoBox = (c: string) => `<div style="background:#1e1e2e;border:1px solid #2a2a35;border-radius:10px;padding:16px 20px;margin:16px 0;">${c}</div>`;
const badge = (t: string, color = "#6366f1") => `<span style="display:inline-block;padding:3px 10px;background:${color}22;color:${color};border-radius:20px;font-size:12px;font-weight:700;">${t}</span>`;
const note = (t: string) => `<p style="margin:16px 0 0;font-size:12px;color:#555;line-height:1.6;">${t}</p>`;

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${BASE_URL}/mail-dogrulama?token=${token}`;
  await sendMail(email, "E-posta adresinizi doğrulayın — Novelya", layout({
    preheader: "Hesabınızı etkinleştirmek için e-postanızı doğrulayın.",
    body: `
      ${h("Hoş geldiniz! 🎉")}
      ${p("Novelya'ya kaydolduğunuz için teşekkürler. Hesabınızı etkinleştirmek için aşağıdaki butona tıklayın.")}
      ${cta("E-postamı Doğrula", url)}
      ${divider()}
      ${note("Bu link <strong>24 saat</strong> geçerlidir.")}
      ${note(`Buton çalışmıyorsa: <span style="color:#6366f1;word-break:break-all;">${url}</span>`)}
    `,
  }));
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${BASE_URL}/sifremi-sifirla?token=${token}`;
  await sendMail(email, "Şifre sıfırlama isteği — Novelya", layout({
    preheader: "Şifrenizi sıfırlamak için butona tıklayın.",
    body: `
      ${h("Şifrenizi sıfırlayın 🔑")}
      ${p("Hesabınız için şifre sıfırlama isteği aldık.")}
      ${cta("Şifremi Sıfırla", url)}
      ${divider()}
      ${note("Bu link <strong>1 saat</strong> geçerlidir.")}
      ${note("Bu isteği siz yapmadıysanız bu maili yok sayabilirsiniz.")}
    `,
  }));
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  pdfBuffer?: Buffer,
) {
  const attachments: Attachment[] = pdfBuffer
    ? [{ filename: "Novelya-Kullanici-Sozlesmesi.pdf", content: pdfBuffer }]
    : [];
  await sendMail(email, "Novelya'ya hoş geldiniz!", layout({
    preheader: "Novelya'ya hoş geldiniz!",
    body: `
      ${h(`Merhaba ${name}! 👋`)}
      ${p("Novelya'ya hoş geldiniz.")}
      ${infoBox(`
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#f0f0ff;">Neler yapabilirsiniz?</p>
        <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#a0a0b8;width:100%;">
          <tr><td style="padding:4px 0;">✨</td><td style="padding:4px 8px;">AI ile içerik üretin</td></tr>
          <tr><td style="padding:4px 0;">🤖</td><td style="padding:4px 8px;">Chatbot kurun</td></tr>
          <tr><td style="padding:4px 0;">⭐</td><td style="padding:4px 8px;">Müşteri yorumlarını analiz edin</td></tr>
          <tr><td style="padding:4px 0;">🌐</td><td style="padding:4px 8px;">AI website oluşturun</td></tr>
        </table>
      `)}
      ${cta("Dashboard'a Git", `${BASE_URL}/dashboard`)}
    `,
  }), attachments.length ? attachments : undefined);
}

export async function sendTeamInviteEmail(email: string, opts: {
  inviterName: string; brandName: string; role: string; token: string;
}) {
  const url = `${BASE_URL}/davet?token=${opts.token}`;
  const roleLabel: Record<string, string> = { OWNER: "Sahip", ADMIN: "Yönetici", EDITOR: "Editör", VIEWER: "İzleyici" };
  await sendMail(email, `${opts.inviterName} sizi ${opts.brandName} takımına davet etti`, layout({
    body: `
      ${h("Takım daveti 👥")}
      ${p(`<strong style="color:#f0f0ff;">${opts.inviterName}</strong>, sizi <strong style="color:#f0f0ff;">${opts.brandName}</strong> markasına ${badge(roleLabel[opts.role] ?? opts.role)} rolüyle davet etti.`)}
      ${cta("Daveti Kabul Et", url)}
      ${note("Bu davet <strong>7 gün</strong> geçerlidir.")}
    `,
  }));
}

export async function sendSubscriptionConfirmEmail(email: string, opts: {
  name: string; planName: string; trialDays: number; endsAt?: string; pdfBuffer?: Buffer;
}) {
  const attachments: Attachment[] = opts.pdfBuffer
    ? [{ filename: "Novelya-Abonelik-Sozlesmesi.pdf", content: opts.pdfBuffer }]
    : [];
  await sendMail(email, `${opts.planName} planınız başladı — Novelya`, layout({
    body: `
      ${h("Aboneliğiniz başladı 🚀")}
      ${p(`Merhaba <strong style="color:#f0f0ff;">${opts.name}</strong>, ${badge(opts.planName, "#22c55e")} planınız aktif!`)}
      ${p("Abonelik sözleşmeniz bu e-postaya eklenmiştir. Lütfen saklayınız.")}
      ${cta("Dashboard'a Git", `${BASE_URL}/dashboard/abonelik`)}
    `,
  }), attachments.length ? attachments : undefined);
}

export async function sendSubscriptionCancelEmail(email: string, opts: {
  name: string; planName: string; endsAt?: string;
}) {
  await sendMail(email, "Aboneliğiniz iptal edildi — Novelya", layout({
    body: `
      ${h("Abonelik iptali")}
      ${p(`Merhaba <strong style="color:#f0f0ff;">${opts.name}</strong>, <strong style="color:#f0f0ff;">${opts.planName}</strong> planınız iptal edildi.`)}
      ${cta("Planımı Yenile", `${BASE_URL}/fiyatlar`)}
    `,
  }));
}

export async function sendNegativeReviewAlertEmail(email: string, opts: {
  brandName: string; rating: number; reviewText: string; reviewId: string;
}) {
  const stars = "⭐".repeat(opts.rating) + "☆".repeat(5 - opts.rating);
  await sendMail(email, `${opts.brandName} için ${opts.rating}⭐ olumsuz yorum alındı`, layout({
    body: `
      ${h("Olumsuz yorum uyarısı ⚠️")}
      ${p(`<strong style="color:#f0f0ff;">${opts.brandName}</strong> markanız için yeni bir olumsuz yorum alındı.`)}
      ${infoBox(`
        <p style="margin:0 0 8px;font-size:18px;">${stars}</p>
        <p style="margin:0;font-size:14px;color:#a0a0b8;font-style:italic;">"${opts.reviewText.slice(0, 200)}${opts.reviewText.length > 200 ? "…" : ""}"</p>
      `)}
      ${cta("Yorumu İncele", `${BASE_URL}/dashboard/reviews`)}
    `,
  }));
}

export async function sendCustomEmail(to: string, subject: string, content: string) {
  await sendMail(to, subject, layout({
    body: `${h(subject)}${p(content)}${cta("Dashboard'a Git", `${BASE_URL}/dashboard`)}`,
  }));
}

export async function sendContactEmail(opts: {
  name: string; email: string; subject: string; message: string;
}) {
  const to = process.env.CONTACT_EMAIL ?? "novelya@novelya.com.tr";
  await sendMail(to, `İletişim formu: ${opts.subject}`, layout({
    preheader: `${opts.name} bir mesaj gönderdi.`,
    body: `
      ${h("Yeni iletişim mesajı 📬")}
      ${infoBox(`
        <p style="margin:0 0 6px;font-size:13px;color:#a0a0b8;"><strong style="color:#f0f0ff;">Ad:</strong> ${opts.name}</p>
        <p style="margin:0 0 6px;font-size:13px;color:#a0a0b8;"><strong style="color:#f0f0ff;">E-posta:</strong> ${opts.email}</p>
        <p style="margin:0;font-size:13px;color:#a0a0b8;"><strong style="color:#f0f0ff;">Konu:</strong> ${opts.subject}</p>
      `)}
      ${p(opts.message.replace(/</g, "&lt;").replace(/\n/g, "<br/>"))}
      ${note(`Yanıtlamak için doğrudan ${opts.email} adresine e-posta gönderebilirsiniz.`)}
    `,
  }));
}

export async function sendBulkEmail(addresses: string[], subject: string, content: string) {
  const chunks: string[][] = [];
  for (let i = 0; i < addresses.length; i += 50) chunks.push(addresses.slice(i, i + 50));
  for (const chunk of chunks) {
    await sendMail(chunk, subject, layout({
      body: `${h(subject)}${p(content)}${cta("Dashboard'a Git", `${BASE_URL}/dashboard`)}`,
    }));
  }
}
