import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

// Env: AUTH_SECRET (or NEXTAUTH_SECRET). Discord: DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET
// (or AUTH_DISCORD_ID / AUTH_DISCORD_SECRET).
//
// Discord Developer Portal → your app (same Client ID as DISCORD_CLIENT_ID) → OAuth2 → Redirects.
// Add this EXACTLY (no trailing slash, scheme must match how you browse the site):
//   http://localhost:3000/api/auth/callback/discord
// If you open the site via http://127.0.0.1:3000 or a LAN IP, add those callback URLs too, OR set:
//   AUTH_URL=http://localhost:3000
// so the OAuth redirect_uri always uses localhost (then only open the app at that URL when testing).

const secret = (
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  ""
).trim();

const discordId = (
  process.env.DISCORD_CLIENT_ID ??
  process.env.AUTH_DISCORD_ID ??
  ""
).trim();

const discordSecret = (
  process.env.DISCORD_CLIENT_SECRET ??
  process.env.AUTH_DISCORD_SECRET ??
  ""
).trim();

if (process.env.NODE_ENV === "development") {
  if (!secret)
    console.warn(
      "[auth] Missing AUTH_SECRET (or NEXTAUTH_SECRET). Auth will return Configuration errors."
    );
  if (!discordId || !discordSecret)
    console.warn(
      "[auth] Missing Discord OAuth credentials. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET."
    );
  const canon = (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    ""
  ).trim().replace(/\/$/, "");
  if (discordId && canon)
    console.info(
      "[auth] In Discord Developer Portal → OAuth2 → Redirects for this Client ID, add exactly:\n       " +
        `${canon}/api/auth/callback/discord`
    );
  else if (discordId)
    console.warn(
      '[auth] Set AUTH_URL=http://localhost:3000 (or NEXTAUTH_URL) so the OAuth redirect stays stable while testing.'
    );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  basePath: "/api/auth",
  secret,
  providers: [
    Discord({
      clientId: discordId,
      clientSecret: discordSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "discord" && account.providerAccountId) {
        token.discordId = account.providerAccountId;
        try {
          const { upsertUserOnDiscordSignIn } = await import("@/lib/user-db");
          const p = profile as { global_name?: string; username?: string } | undefined;
          await upsertUserOnDiscordSignIn({
            discordId: account.providerAccountId,
            name: user?.name ?? p?.global_name ?? p?.username,
            image: user?.image,
            email: user?.email,
          });
        } catch (e) {
          console.error("[auth] Mongo upsert on sign-in failed:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.discordId && typeof token.discordId === "string") {
        session.user.discordId = token.discordId;
      }
      return session;
    },
  },
});
