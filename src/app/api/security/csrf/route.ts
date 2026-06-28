import { csrfTokenResponse } from "@/server/security/csrf";

export async function GET() {
  return csrfTokenResponse();
}
