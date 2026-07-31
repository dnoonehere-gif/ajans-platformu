import dns from "dns/promises";
import net from "net";

/**
 * SSRF koruması.
 *
 * Sunucunun kullanıcıdan gelen bir URL'i çekmesi gereken her yerde kullanılır.
 * Saldırgan aksi hâlde URL'i buluta ait iç adreslere yönlendirip (örn.
 * 169.254.169.254 metadata servisi) sunucunun kimlik bilgilerini sızdırabilir.
 *
 * Kontroller: yalnızca http/https, DNS çözümlemesi sonrası özel/iç IP blokları
 * yasak, yönlendirmeler kapalı (çağıran tarafta redirect: "manual" ile).
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "instance-data",
]);

function isPrivateIPv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true; // şüpheliyse engelle
  const [a, b] = p;
  return (
    a === 0 ||                          // 0.0.0.0/8
    a === 10 ||                         // özel
    a === 127 ||                        // loopback
    (a === 169 && b === 254) ||         // link-local / bulut metadata
    (a === 172 && b >= 16 && b <= 31) || // özel
    (a === 192 && b === 168) ||         // özel
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    a >= 224                            // multicast / reserved
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  if (v.startsWith("fc") || v.startsWith("fd")) return true; // unique local
  if (v.startsWith("fe80")) return true;                     // link-local
  if (v.startsWith("::ffff:")) return isPrivateIPv4(v.slice(7)); // eşlenmiş IPv4
  return false;
}

export class SsrfError extends Error {}

/**
 * URL'i doğrular; güvenli değilse SsrfError fırlatır.
 * Güvenliyse normalize edilmiş URL'i döndürür.
 */
export async function assertPublicUrl(raw: string): Promise<string> {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new SsrfError("Geçerli bir adres girin (https:// ile başlamalı)");
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new SsrfError("Yalnızca http ve https adresleri desteklenir");
  }

  const host = u.hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith(".internal") || host.endsWith(".local")) {
    throw new SsrfError("Bu adres taranamaz");
  }

  // Doğrudan IP verilmişse hemen kontrol et
  if (net.isIP(host)) {
    const bad = net.isIPv4(host) ? isPrivateIPv4(host) : isPrivateIPv6(host);
    if (bad) throw new SsrfError("Bu adres taranamaz");
    return u.toString();
  }

  // Alan adı ise çözümleyip TÜM kayıtları kontrol et
  let addrs: { address: string; family: number }[];
  try {
    addrs = await dns.lookup(host, { all: true });
  } catch {
    throw new SsrfError("Adres çözümlenemedi");
  }
  if (!addrs.length) throw new SsrfError("Adres çözümlenemedi");

  for (const { address, family } of addrs) {
    const bad = family === 4 ? isPrivateIPv4(address) : isPrivateIPv6(address);
    if (bad) throw new SsrfError("Bu adres taranamaz");
  }

  return u.toString();
}
