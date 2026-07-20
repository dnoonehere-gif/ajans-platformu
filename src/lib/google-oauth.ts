const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ACCOUNTS_URL = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
const GOOGLE_REVIEWS_URL = "https://mybusiness.googleapis.com/v4";

/**
 * Google Cloud Console'daki "İzin verilen yönlendirme URI'leri" ile BİREBİR
 * eşleşmeli. NEXTAUTH_URL'in sonundaki olası "/" temizlenir; yoksa çift slash
 * (…//api/google/callback) oluşup redirect_uri_mismatch hatası verir.
 * Console'a eklenecek değer tam olarak bu fonksiyonun döndürdüğüdür.
 */
export function getGoogleRedirectUri(): string {
  const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/+$/, "");
  return `${base}/api/google/callback`;
}

export function getGoogleAuthUrl(brandId: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/business.manage",
      "email",
      "profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state: state ?? brandId,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  email?: string;
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("Token alınamadı");
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Token yenilenemedi");
  return res.json();
}

export async function getGoogleAccounts(accessToken: string): Promise<{
  accounts: { name: string; accountName: string; type: string }[];
}> {
  const res = await fetch(GOOGLE_ACCOUNTS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Hesaplar alınamadı");
  return res.json();
}

export async function getGoogleLocations(
  accessToken: string,
  accountName: string
): Promise<{ locations: { name: string; title: string; storefrontAddress?: unknown }[] }> {
  const res = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return { locations: [] };
  return res.json();
}

interface GoogleReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
}

export async function getGoogleReviews(
  accessToken: string,
  locationResourceName: string
): Promise<{ reviews: GoogleReview[]; averageRating: number; totalReviewCount: number }> {
  const url = `${GOOGLE_REVIEWS_URL}/${locationResourceName}/reviews?pageSize=50`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Yorumlar alınamadı: ${err}`);
  }
  const data = await res.json();
  return {
    reviews: data.reviews ?? [],
    averageRating: data.averageRating ?? 0,
    totalReviewCount: data.totalReviewCount ?? 0,
  };
}

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

export function starToNumber(s: string): number {
  return STAR_MAP[s] ?? 0;
}
