import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedPatterns = [
  "/user",
  "/seller",
  "/admin",
  "/wishlist",
];

const roleAccessMap: Record<string, string[]> = {
  user: ["/user", "/checkout", "/wishlist"],
  seller: ["/checkout", "/seller"],
  admin: ["/*"],
};

function isProtectedRoute(pathname: string): boolean {
  return protectedPatterns.some(
    (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
}

function doesRoleHaveAccessToURL(userType: string, url: string): boolean {
  const accessibleRoutes = roleAccessMap[userType] || [];
  return accessibleRoutes.some((route) => {
    if (route === "/*") return true;
    return url === route || url.startsWith(`${route}/`);
  });
}

/**
 * Strip the locale prefix from a pathname to get the "bare" route.
 */
function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (
      locale !== routing.defaultLocale &&
      (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
    ) {
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }
  return pathname;
}

export default auth((req: NextRequest & { auth: any }) => {
  const pathname = req.nextUrl.pathname;
  const barePath = stripLocale(pathname);
  const isLoggedIn = !!req.auth;

  // If user is already logged in and tries to access signin/signup, redirect to dashboard
  if (isLoggedIn && (barePath === "/signin" || barePath === "/signup")) {
    const userType = (req.auth?.user as any)?.role || "user";
    let targetPath = "/";
    if (userType === "admin") targetPath = "/admin";
    else if (userType === "seller" || userType === "vendor")
      targetPath = "/seller";

    const localeMatch = pathname.match(/^\/([^\/]+)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${targetPath}`, req.url));
  }

  // For protected routes, check auth first
  if (isProtectedRoute(barePath)) {
    if (!isLoggedIn) {
      // Redirect to sign-in
      const signInUrl = new URL("/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userType = (req.auth?.user as any)?.role || "user";
    if (!doesRoleHaveAccessToURL(userType, barePath)) {
      // Get the locale from the request to build the correct localized 403 URL
      const localeMatch = pathname.match(/^\/([^\/]+)/);
      const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
      const target = `/${locale}/403`;
      return NextResponse.rewrite(new URL(target, req.url));
    }
  }

  // Run intl middleware for locale detection + routing
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
