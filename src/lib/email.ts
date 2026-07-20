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

// ── Koyu tema paleti ────────────────────────────────────────────────
const C = {
  bg: "#07070c",          // en dış zemin (near-black, hafif soğuk)
  card: "#121218",        // kart
  cardInner: "#1a1a23",   // iç panel
  border: "#26262f",
  borderSoft: "#20202a",
  heading: "#f4f4ff",
  text: "#9a9ab2",
  textDim: "#6b6b80",
  textFaint: "#4a4a5a",
  primary: "#8b5cf6",
  primaryLt: "#a78bfa",
  grad: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 55%,#a855f7 100%)",
};

function layout(opts: { preheader?: string; body: string; footerNote?: string }) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>Novelya</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;width:100%;background:${C.card};border-radius:20px;overflow:hidden;border:1px solid ${C.border};">
        <!-- Başlık bandı -->
        <tr>
          <td style="background-color:#7c3aed;background:${C.grad};padding:32px 36px 30px;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="vertical-align:middle;">
                  <div style="width:44px;height:44px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.28);border-radius:12px;text-align:center;line-height:44px;font-size:22px;font-weight:900;color:#fff;">N</div>
                </td>
                <td style="vertical-align:middle;padding-left:14px;">
                  <div style="color:#fff;font-size:19px;font-weight:800;letter-spacing:-0.3px;line-height:1.1;">Novelya</div>
                  <div style="color:rgba(255,255,255,0.75);font-size:11.5px;font-weight:500;letter-spacing:0.2px;margin-top:3px;">Yapay Zekâ Destekli Dijital Ajans</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- İnce vurgu çizgisi -->
        <tr><td style="height:3px;background:${C.grad};line-height:3px;font-size:0;">&nbsp;</td></tr>
        <!-- Gövde -->
        <tr><td style="padding:36px 36px 32px;">${opts.body}</td></tr>
        <!-- Alt bilgi -->
        <tr>
          <td style="padding:24px 36px 28px;border-top:1px solid ${C.borderSoft};background:#0d0d12;">
            <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
              <tr><td style="padding-bottom:12px;">
                <a href="${BASE_URL}/dashboard" style="color:${C.primaryLt};text-decoration:none;font-size:12px;font-weight:600;">Dashboard</a>
                <span style="color:${C.textFaint};font-size:12px;">&nbsp;·&nbsp;</span>
                <a href="${BASE_URL}/sss" style="color:${C.primaryLt};text-decoration:none;font-size:12px;font-weight:600;">Yardım</a>
                <span style="color:${C.textFaint};font-size:12px;">&nbsp;·&nbsp;</span>
                <a href="${BASE_URL}/iletisim" style="color:${C.primaryLt};text-decoration:none;font-size:12px;font-weight:600;">İletişim</a>
              </td></tr>
            </table>
            <p style="margin:0 0 6px;font-size:12px;color:${C.textDim};line-height:1.6;">${opts.footerNote ?? "Bu e-postayı hesabınızla ilgili bir işlem nedeniyle aldınız."}</p>
            <p style="margin:0;font-size:12px;color:${C.textFaint};">© ${new Date().getFullYear()} Novelya &nbsp;·&nbsp;<a href="${BASE_URL}" style="color:${C.textDim};text-decoration:none;">novelya.com.tr</a></p>
          </td>
        </tr>
      </table>
      <p style="max-width:580px;margin:16px auto 0;font-size:11px;color:${C.textFaint};text-align:center;line-height:1.5;">Türkiye'nin yapay zekâ destekli dijital ajans platformu</p>
    </td></tr>
  </table>
</body>
</html>`;
}

// Büyük ikon rozeti — önemli maillerin başına
const heroIcon = (emoji: string) =>
  `<div style="width:64px;height:64px;background:${C.cardInner};border:1px solid ${C.border};border-radius:18px;text-align:center;line-height:64px;font-size:30px;margin:0 0 20px;">${emoji}</div>`;

const h = (t: string) => `<h1 style="margin:0 0 10px;font-size:23px;font-weight:800;letter-spacing:-0.4px;color:${C.heading};line-height:1.3;">${t}</h1>`;
const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;color:${C.text};line-height:1.75;">${t}</p>`;
const cta = (t: string, u: string) => `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:10px 0 24px;"><tr><td style="background-color:#7c3aed;background:${C.grad};border-radius:12px;"><a href="${u}" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-weight:700;font-size:14.5px;letter-spacing:0.2px;">${t}&nbsp;&nbsp;→</a></td></tr></table>`;
const divider = () => `<div style="height:1px;background:linear-gradient(90deg,transparent,${C.border} 30%,${C.border} 70%,transparent);margin:24px 0;line-height:1px;font-size:0;">&nbsp;</div>`;
const infoBox = (c: string) => `<div style="background:${C.cardInner};border:1px solid ${C.border};border-radius:14px;padding:18px 22px;margin:18px 0;">${c}</div>`;
const accentBox = (c: string, color = C.primary) => `<table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin:18px 0;"><tr><td style="width:4px;background:${color};border-radius:4px 0 0 4px;">&nbsp;</td><td style="background:${C.cardInner};border:1px solid ${C.border};border-left:none;border-radius:0 14px 14px 0;padding:16px 20px;">${c}</td></tr></table>`;
const badge = (t: string, color = C.primary) => `<span style="display:inline-block;padding:4px 12px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:20px;font-size:12px;font-weight:700;">${t}</span>`;
const note = (t: string) => `<p style="margin:14px 0 0;font-size:12px;color:${C.textDim};line-height:1.6;">${t}</p>`;

// Metrik kutucukları (2 sütun) — haftalık özet için
const statTile = (emoji: string, value: string | number, label: string, accent = C.primaryLt) =>
  `<td width="50%" style="padding:6px;"><div style="background:${C.cardInner};border:1px solid ${C.border};border-radius:14px;padding:18px 16px;"><div style="font-size:22px;line-height:1;margin-bottom:8px;">${emoji}</div><div style="font-size:26px;font-weight:800;color:${accent};line-height:1;">${value}</div><div style="font-size:12px;color:${C.textDim};margin-top:6px;">${label}</div></div></td>`;
const statGrid = (tiles: string[]) => {
  const rows: string[] = [];
  for (let i = 0; i < tiles.length; i += 2) {
    rows.push(`<tr>${tiles[i]}${tiles[i + 1] ?? '<td width="50%">&nbsp;</td>'}</tr>`);
  }
  return `<table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin:8px 0 20px;">${rows.join("")}</table>`;
};

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
  const feat = (emoji: string, title: string, desc: string) =>
    `<tr>
      <td style="width:40px;vertical-align:top;padding:10px 0;"><div style="width:36px;height:36px;background:${C.card};border:1px solid ${C.border};border-radius:10px;text-align:center;line-height:36px;font-size:17px;">${emoji}</div></td>
      <td style="padding:10px 0 10px 14px;vertical-align:top;"><div style="font-size:14px;font-weight:700;color:${C.heading};">${title}</div><div style="font-size:12.5px;color:${C.textDim};margin-top:2px;line-height:1.5;">${desc}</div></td>
    </tr>`;
  await sendMail(email, "Novelya'ya hoş geldiniz! 🎉", layout({
    preheader: "Hesabınız hazır — işletmenizi dijitale taşımaya başlayın.",
    body: `
      ${heroIcon("👋")}
      ${h(`Merhaba ${name}, hoş geldiniz!`)}
      ${p("Novelya'ya katıldığınız için teşekkürler. İşletmenizi yapay zekâ ile dijitale taşımak için ihtiyacınız olan her şey tek platformda.")}
      ${infoBox(`
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${C.heading};letter-spacing:0.2px;">NELER YAPABİLİRSİNİZ?</p>
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
          ${feat("🌐", "AI ile web sitesi", "Dakikalar içinde profesyonel bir site oluşturun")}
          ${feat("🤖", "Akıllı chatbot", "Müşteri sorularını 7/24 yanıtlayın")}
          ${feat("✨", "İçerik üretimi", "Sosyal medya ve blog içeriklerini otomatikleştirin")}
          ${feat("⭐", "Yorum analizi", "Müşteri memnuniyetini tek bakışta görün")}
        </table>
      `)}
      ${cta("Dashboard'a Git", `${BASE_URL}/dashboard`)}
      ${note("Kullanıcı sözleşmeniz bu e-postaya eklenmiştir. Lütfen saklayınız.")}
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
      ${p(`<strong style="color:${C.heading};">${opts.inviterName}</strong>, sizi <strong style="color:${C.heading};">${opts.brandName}</strong> markasına ${badge(roleLabel[opts.role] ?? opts.role)} rolüyle davet etti.`)}
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
  await sendMail(email, `${opts.planName} planınız başladı 🚀 — Novelya`, layout({
    preheader: `${opts.planName} planınız aktif. Tüm özellikler kullanıma hazır.`,
    body: `
      ${heroIcon("🚀")}
      ${h("Aboneliğiniz başladı!")}
      ${p(`Merhaba <strong style="color:${C.heading};">${opts.name}</strong>, ödemeniz alındı ve ${badge(opts.planName, "#22c55e")} planınız aktif. Tüm özellikler artık kullanımınıza açık.`)}
      ${accentBox(`<p style="margin:0;font-size:13.5px;color:${C.text};line-height:1.6;">📎 <strong style="color:${C.heading};">Abonelik sözleşmeniz</strong> bu e-postaya PDF olarak eklenmiştir. Yasal kaydınız için lütfen saklayınız.</p>`, "#22c55e")}
      ${cta("Planımı Görüntüle", `${BASE_URL}/dashboard/abonelik`)}
    `,
  }), attachments.length ? attachments : undefined);
}

export async function sendSubscriptionCancelEmail(email: string, opts: {
  name: string; planName: string; endsAt?: string;
}) {
  await sendMail(email, "Aboneliğiniz iptal edildi — Novelya", layout({
    body: `
      ${h("Abonelik iptali")}
      ${p(`Merhaba <strong style="color:${C.heading};">${opts.name}</strong>, <strong style="color:${C.heading};">${opts.planName}</strong> planınız iptal edildi.`)}
      ${cta("Planımı Yenile", `${BASE_URL}/fiyatlar`)}
    `,
  }));
}

export async function sendNegativeReviewAlertEmail(email: string, opts: {
  brandName: string; rating: number; reviewText: string; reviewId: string;
}) {
  const stars = "★".repeat(opts.rating) + "☆".repeat(5 - opts.rating);
  await sendMail(email, `⚠️ ${opts.brandName} için ${opts.rating}★ olumsuz yorum`, layout({
    preheader: `${opts.brandName} için hızlı yanıt vermeniz önerilir.`,
    body: `
      ${heroIcon("⚠️")}
      ${h("Olumsuz yorum uyarısı")}
      ${p(`<strong style="color:${C.heading};">${opts.brandName}</strong> markanız için yeni bir olumsuz yorum alındı. Hızlı ve yapıcı bir yanıt itibarınızı korur.`)}
      ${accentBox(`
        <p style="margin:0 0 8px;font-size:17px;color:#f59e0b;letter-spacing:2px;">${stars}</p>
        <p style="margin:0;font-size:14px;color:${C.text};font-style:italic;line-height:1.6;">"${opts.reviewText.slice(0, 220).replace(/</g, "&lt;")}${opts.reviewText.length > 220 ? "…" : ""}"</p>
      `, "#f59e0b")}
      ${cta("Yorumu İncele ve Yanıtla", `${BASE_URL}/dashboard/reviews`)}
    `,
  }));
}

export async function sendWeeklyDigestEmail(email: string, opts: {
  name?: string; brandName: string;
  reviews: number; negativeCount: number; reservations: number; leads: number; conversations: number;
}) {
  const greeting = opts.name ? `Merhaba ${opts.name},` : "Merhaba,";
  await sendMail(email, `📊 ${opts.brandName} — Haftalık Özet`, layout({
    preheader: `${opts.brandName} için geçen haftanın performans özeti hazır.`,
    body: `
      ${heroIcon("📊")}
      ${h("Haftalık özetiniz hazır")}
      ${p(`${greeting} <strong style="color:${C.heading};">${opts.brandName}</strong> için geçen haftanın performansı:`)}
      ${statGrid([
        statTile("⭐", opts.reviews, opts.negativeCount > 0 ? `Yeni yorum · ${opts.negativeCount} olumsuz` : "Yeni yorum", opts.negativeCount > 0 ? "#f59e0b" : "#a78bfa"),
        statTile("📅", opts.reservations, "Yeni rezervasyon", "#22c55e"),
        statTile("👤", opts.leads, "Yeni müşteri adayı", "#3b82f6"),
        statTile("💬", opts.conversations, "Chatbot konuşması", "#a78bfa"),
      ])}
      ${opts.negativeCount > 0 ? accentBox(`<p style="margin:0;font-size:13px;color:${C.text};line-height:1.6;">Bu hafta <strong style="color:#f59e0b;">${opts.negativeCount} olumsuz yorum</strong> aldınız. İncelemenizi öneririz.</p>`, "#f59e0b") : ""}
      ${cta("Dashboard'da İncele", `${BASE_URL}/dashboard`)}
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
        <p style="margin:0 0 6px;font-size:13px;color:${C.text};"><strong style="color:${C.heading};">Ad:</strong> ${opts.name}</p>
        <p style="margin:0 0 6px;font-size:13px;color:${C.text};"><strong style="color:${C.heading};">E-posta:</strong> ${opts.email}</p>
        <p style="margin:0;font-size:13px;color:${C.text};"><strong style="color:${C.heading};">Konu:</strong> ${opts.subject}</p>
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
