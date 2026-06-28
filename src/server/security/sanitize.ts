// XSS & injection koruması — harici kütüphane gerektirmez

// HTML özel karakterlerini escape et — user input'u HTML'e yansıtmadan önce
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Tehlikeli script/event pattern'lerini sil (fallback — React zaten escape eder)
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,           // onerror=, onclick= vb.
  /data\s*:\s*text\/html/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /expression\s*\(/gi,     // CSS expression()
  /vbscript\s*:/gi,
];

export function sanitizeString(input: string): string {
  let out = input.trim();
  for (const pattern of DANGEROUS_PATTERNS) {
    out = out.replace(pattern, "");
  }
  return out;
}

// Derin sanitize — obje/array içindeki string değerleri temizle (JSON body'ler için)
export function sanitizeDeep<T>(value: T): T {
  if (typeof value === "string") return sanitizeString(value) as unknown as T;
  if (Array.isArray(value)) return value.map(sanitizeDeep) as unknown as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeDeep(v)])
    ) as T;
  }
  return value;
}

// SQL injection için ek kontrol (Prisma parametreli sorgular kullandığı için
// temel koruma zaten var, bu extra katman string interpolasyon hatalarına karşı)
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(--|;|\/\*|\*\/|xp_)/gi,
];

export function hasSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some((p) => p.test(input));
}

// Slug güvenliği
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// URL güvenliği — sadece http/https izin ver
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Dosya adı güvenliği
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 255);
}
