import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    const signIn = new URL("/auth", req.url);
    signIn.searchParams.set("callbackUrl", "/dashboard");
    return Response.redirect(signIn);
  }
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
