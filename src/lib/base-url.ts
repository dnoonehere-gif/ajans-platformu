/**
 * Kullanıcıya dönecek mutlak URL üretir.
 *
 * Railway gibi bir proxy arkasında `req.url` iç adrese (ör. localhost:8080)
 * çözülüyor; `new URL(path, req.url)` ile kurulan yönlendirmeler tarayıcıda
 * ERR_CONNECTION_REFUSED veriyordu. Bu yüzden dışa dönük yönlendirmeler her
 * zaman NEXTAUTH_URL üzerinden kurulmalı.
 */
export function appUrl(path: string, req?: { url: string }): URL {
  const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/+$/, "");
  if (base) return new URL(path.startsWith("/") ? path : `/${path}`, base);
  // NEXTAUTH_URL tanımsızsa (yalnızca yerel) isteğin kendi adresine düş
  return new URL(path, req?.url ?? "http://localhost:3000");
}
