import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const userType = token?.role as string;

    const haveAccess = doesRoleHaveAccessToURL(userType, pathname);
    if (!haveAccess) {
      // Redirect to 403 page if user has no access to that particular page
      return NextResponse.rewrite(new URL("/403", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      error: "/auth/error",
    },
  },
);

export const config = {
  matcher: [
    "/checkout",
    "/checkout/:path*",
    "/user/:path*",
    "/seller/:path*",
    "/admin/:path*",
  ],
};

const roleAccessMap: Record<string, string[]> = {
  user: ["/user", "/user/:path*", "/checkout", "/checkout/:path*"],
  seller: ["/checkout", "/checkout/:path", "/seller", "/seller/:path*"],
  admin: ["/*"],
};

function doesRoleHaveAccessToURL(userType: string, url: string): boolean {
  const accessibleRoutes = roleAccessMap[userType] || [];
  return accessibleRoutes.some((route) => {
    // Create a regex from the route by replacing dynamic segments
    const regexPattern = route
      .replace(/:\w+/g, "[^/]+") // Replace path parameters like :path*
      .replace(/\*/g, ".*") // Replace wildcards
      .replace(/\//g, "\\/"); // Escape forward slashes
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  });
}
