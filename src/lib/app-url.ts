/** Public origin of this deployment, used to build checkout return URLs. */
export function getAppBaseUrl(): string {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  )
    .trim()
    .replace(/\/$/, "");
}
