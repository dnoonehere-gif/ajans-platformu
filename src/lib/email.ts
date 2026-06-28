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
const BRAND_COLOR = "#6366f1";

// ─── Ortak şablon ────────────────────────────────────────────────────────────

function layout(opts: {
  preheader?: string;
  body: string;
  footerNote?: string;
}) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Ajans Platformu</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',Arial,sans-serif;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-flex;align-items:center;gap:10px;">
                    <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:inline-block;text-align:center;line-height:32px;font-size:16px;font-weight:900;color:#fff;">A</div>
                    <span style="color:#fff;font-size:16px;font-weight:700;margin-left:8px;">Ajans Platformu</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${opts.body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a35;background:#13131a;">
            <p style="margin:0 0 6px;font-size:12px;color:#666;">${opts.footerNote ?? "Bu e-postayı hesabınızla ilgili bir işlem nedeniyle aldınız."}</p>
            <p style="margin:0;font-size:12px;color:#444;">
              © ${new Date().getFullYear()} Ajans Platformu &nbsp;·&nbsp;
              <a href="${BASE_URL}" style="color:#6366f1;text-decoration:none;">ajansplatformu.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f0f0ff;">${text}</h1>`;
}

function para(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#a0a0b8;line-height:1.7;">${text}</p>`;
}

function cta(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin:8px 0 24px;padding:13px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">${text}</a>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #2a2a35;margin:24px 0;" />`;
}

function infoBox(content: string) {
  return `<div style="background:#1e1e2e;border:1px solid #2a2a35;border-radius:10px;padding:16px 20px;margin:16px 0;">${content}</div>`;
}

function badge(text: string, color = BRAND_COLOR) {
  return `<span style="display:inline-block;padding:3px 10px;background:${color}22;color:${color};border-radius:20px;font-size:12px;font-weight:700;">${text}</span>`;
}

function smallNote(text: string) {
  return `<p style="margin:16px 0 0;font-size:12px;color:#555;line-height:1.6;">${text}</p>`;
}

// ─── Mail fonksiyonları ───────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${BASE_URL}/mail-dogrulama?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "E-posta adresinizi doğrulayın — Ajans Platformu",
    html: layout({
      preheader: "Hesabınızı etkinleştirmek için e-postanızı doğrulayın.",
      body: `
        ${heading("Hoş geldiniz! 🎉")}
        ${para("Ajans Platformu'na kaydolduğunuz için teşekkürler. Hesabınızı etkinleştirmek için aşağıdaki butona tıklayın.")}
        ${cta("E-postamı Doğrula", url)}
        ${divider()}
        ${smallNote("Bu link <strong>24 saat</strong> geçerlidir. Eğer kaydolmadıysanız bu maili dikkate almayın.")}
        ${smallNote(`Buton çalışmıyorsa bu linki tarayıcınıza yapıştırın:<br/><span style="color:#6366f1;word-break:break-all;">${url}</span>`)}
      `,
    }),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${BASE_URL}/sifremi-sifirla?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Şifre sıfırlama isteği — Ajans Platformu",
    html: layout({
      preheader: "Şifrenizi sıfırlamak için butona tıklayın.",
      body: `
        ${heading("Şifrenizi sıfırlayın 🔑")}
        ${para("Hesabınız için şifre sıfırlama isteği aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyin.")}
        ${cta("Şifremi Sıfırla", url)}
        ${divider()}
        ${smallNote("Bu link <strong>1 saat</strong> geçerlidir.")}
        ${smallNote("Bu isteği siz yapmadıysanız hesabınız güvende, bu maili yok sayabilirsiniz.")}
      `,
    }),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Ajans Platformu'na hoş geldiniz!",
    html: layout({
      preheader: "14 günlük ücretsiz denemeniz başladı.",
      body: `
        ${heading(`Merhaba ${name}! 👋`)}
        ${para("Ajans Platformu'na hoş geldiniz. Markanızı büyütmek için ihtiyacınız olan her şey burada.")}
        ${infoBox(`
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#f0f0ff;">Neler yapabilirsiniz?</p>
          <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#a0a0b8;width:100%;">
            <tr><td style="padding:4px 0;">✨</td><td style="padding:4px 8px;">AI ile içerik üretin</td></tr>
            <tr><td style="padding:4px 0;">🤖</td><td style="padding:4px 8px;">Chatbot kurun</td></tr>
            <tr><td style="padding:4px 0;">⭐</td><td style="padding:4px 8px;">Müşteri yorumlarını analiz edin</td></tr>
            <tr><td style="padding:4px 0;">🌐</td><td style="padding:4px 8px;">AI website oluşturun</td></tr>
            <tr><td style="padding:4px 0;">📊</td><td style="padding:4px 8px;">Google Business'ı yönetin</td></tr>
          </table>
        `)}
        ${cta("Dashboard'a Git", `${BASE_URL}/dashboard`)}
        ${divider()}
        ${smallNote("Sorularınız için destek ekibimize ulaşabilirsiniz.")}
      `,
    }),
  });
}

export async function sendTeamInviteEmail(email: string, opts: {
  inviterName: string;
  brandName: string;
  role: string;
  token: string;
}) {
  const url = `${BASE_URL}/davet?token=${opts.token}`;
  const roleLabel: Record<string, string> = {
    OWNER: "Sahip", ADMIN: "Yönetici", EDITOR: "Editör", VIEWER: "İzleyici",
  };
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${opts.inviterName} sizi ${opts.brandName} takımına davet etti`,
    html: layout({
      preheader: `${opts.brandName} markasına ${roleLabel[opts.role] ?? opts.role} olarak katılın.`,
      body: `
        ${heading("Takım daveti 👥")}
        ${para(`<strong style="color:#f0f0ff;">${opts.inviterName}</strong>, sizi <strong style="color:#f0f0ff;">${opts.brandName}</strong> markasına ${badge(roleLabel[opts.role] ?? opts.role)} rolüyle davet etti.`)}
        ${cta("Daveti Kabul Et", url)}
        ${divider()}
        ${smallNote("Bu davet <strong>7 gün</strong> geçerlidir. Daveti reddedebilir veya yok sayabilirsiniz.")}
      `,
    }),
  });
}

export async function sendSubscriptionConfirmEmail(email: string, opts: {
  name: string;
  planName: string;
  trialDays: number;
  endsAt?: string;
}) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${opts.planName} planınız başladı — Ajans Platformu`,
    html: layout({
      preheader: `${opts.trialDays} günlük ücretsiz denemeniz başladı.`,
      body: `
        ${heading("Aboneliğiniz başladı 🚀")}
        ${para(`Merhaba <strong style="color:#f0f0ff;">${opts.name}</strong>, ${badge(opts.planName, "#22c55e")} planınız aktif!`)}
        ${infoBox(`
          <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#a0a0b8;width:100%;">
            <tr>
              <td style="padding:4px 0;color:#666;">Plan</td>
              <td style="padding:4px 0;color:#f0f0ff;text-align:right;font-weight:700;">${opts.planName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#666;">Deneme süresi</td>
              <td style="padding:4px 0;color:#f0f0ff;text-align:right;font-weight:700;">${opts.trialDays} gün</td>
            </tr>
            ${opts.endsAt ? `<tr><td style="padding:4px 0;color:#666;">Bitiş tarihi</td><td style="padding:4px 0;color:#f0f0ff;text-align:right;font-weight:700;">${new Date(opts.endsAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</td></tr>` : ""}
          </table>
        `)}
        ${cta("Dashboard'a Git", `${BASE_URL}/dashboard/abonelik`)}
        ${smallNote("İstediğiniz zaman plan değiştirebilir veya iptal edebilirsiniz.")}
      `,
    }),
  });
}

export async function sendSubscriptionCancelEmail(email: string, opts: {
  name: string;
  planName: string;
  endsAt?: string;
}) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Aboneliğiniz iptal edildi — Ajans Platformu",
    html: layout({
      preheader: "Aboneliğiniz iptal edildi, kalan süreniz devam ediyor.",
      body: `
        ${heading("Abonelik iptali")}
        ${para(`Merhaba <strong style="color:#f0f0ff;">${opts.name}</strong>, <strong style="color:#f0f0ff;">${opts.planName}</strong> planınız iptal edildi.`)}
        ${opts.endsAt ? infoBox(`<p style="margin:0;font-size:13px;color:#a0a0b8;">
          <strong style="color:#f0f0ff;">${new Date(opts.endsAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</strong> tarihine kadar tüm özelliklere erişmeye devam edebilirsiniz.
        </p>`) : ""}
        ${cta("Planımı Yenile", `${BASE_URL}/fiyatlar`)}
        ${smallNote("Geri dönmek isterseniz dilediğiniz zaman yeni bir plan seçebilirsiniz.")}
      `,
    }),
  });
}

export async function sendNegativeReviewAlertEmail(email: string, opts: {
  brandName: string;
  rating: number;
  reviewText: string;
  reviewId: string;
}) {
  const stars = "⭐".repeat(opts.rating) + "☆".repeat(5 - opts.rating);
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${opts.brandName} için ${opts.rating}⭐ olumsuz yorum alındı`,
    html: layout({
      preheader: `${opts.brandName} markanıza olumsuz yorum geldi, hemen inceleyin.`,
      body: `
        ${heading("Olumsuz yorum uyarısı ⚠️")}
        ${para(`<strong style="color:#f0f0ff;">${opts.brandName}</strong> markanız için yeni bir olumsuz yorum alındı.`)}
        ${infoBox(`
          <p style="margin:0 0 8px;font-size:18px;">${stars}</p>
          <p style="margin:0;font-size:14px;color:#a0a0b8;line-height:1.6;font-style:italic;">"${opts.reviewText.slice(0, 200)}${opts.reviewText.length > 200 ? "…" : ""}"</p>
        `)}
        ${cta("Yorumu İncele", `${BASE_URL}/dashboard/reviews`)}
        ${smallNote("Hızlı yanıt vermek müşteri memnuniyetini artırır.")}
      `,
    }),
  });
}

export async function sendCustomEmail(to: string, subject: string, content: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html: layout({
      body: `
        ${heading(subject)}
        ${para(content)}
        ${cta("Dashboard'a Git", `${BASE_URL}/dashboard`)}
      `,
    }),
  });
}

export async function sendBulkEmail(addresses: string[], subject: string, content: string) {
  // Toplu gönderim — BCC ile gizlilik korunarak
  const chunks = [];
  for (let i = 0; i < addresses.length; i += 50) chunks.push(addresses.slice(i, i + 50));

  for (const chunk of chunks) {
    await transporter.sendMail({
      from: FROM,
      to: FROM,
      bcc: chunk,
      subject,
      html: layout({
        body: `
          ${heading(subject)}
          ${para(content)}
          ${cta("Dashboard'a Git", `${BASE_URL}/dashboard`)}
        `,
      }),
    });
  }
}
