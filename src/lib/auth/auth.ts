import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { callLoginApi } from "./loginApi";
import { callRefreshTokenApi } from "./refreshApi";

interface ApiLoginResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
      language: string;
    };
  };
  message: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            return null;
          }

          console.log("Attempting login for email:", credentials.email);
          
          const data = await callLoginApi(credentials.email as string, credentials.password as string) as ApiLoginResponse;

          if (data.status === "success" && data.data) {
            const { user, accessToken, refreshToken } = data.data;
            const fullName = `${user.firstName} ${user.lastName}`.trim();

            let role: "user" | "seller" | "admin" = "user";
            const roleStr = user.role?.toLowerCase();
            if (roleStr === "admin") {
              role = "admin";
            } else if (roleStr === "seller" || roleStr === "vendor") {
              role = "seller";
            }

            console.log("Login successful for user:", user.email, "role:", role);

            const tokenIssuedAt = Math.floor(Date.now() / 1000);
            const accessTokenExpires = tokenIssuedAt + 55 * 60;

            return {
              id: user.id,
              name: fullName,
              email: user.email,
              role: role,
              accessToken: accessToken,
              refreshToken: refreshToken,
              language: user.language,
              accessTokenExpires: accessTokenExpires,
              tokenIssuedAt: tokenIssuedAt,
            };
          }

          console.error("Unexpected response format:", data);
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: (user as any).role,
          accessToken: (user as any).accessToken,
          refreshToken: (user as any).refreshToken,
          language: (user as any).language,
          accessTokenExpires: (user as any).accessTokenExpires,
          tokenIssuedAt: (user as any).tokenIssuedAt,
        };
      }

      // Token rotation logic
      const now = Math.floor(Date.now() / 1000);
      const tokenIssuedAt = (token.tokenIssuedAt as number) || 0;
      const timeSinceIssued = now - tokenIssuedAt;
      const refreshInterval = 55 * 60;

      if (timeSinceIssued >= refreshInterval && token.refreshToken && token.id) {
        try {
          console.log("Token expired, refreshing...");
          const refreshData = await callRefreshTokenApi(token.refreshToken as string, token.id as string);

          if (refreshData.status === "success" && refreshData.data) {
            const { accessToken, refreshToken: newRefreshToken } = refreshData.data;
            
            return {
              ...token,
              accessToken,
              refreshToken: newRefreshToken,
              tokenIssuedAt: Math.floor(Date.now() / 1000),
              accessTokenExpires: Math.floor(Date.now() / 1000) + 55 * 60,
            };
          }
        } catch (error) {
          console.error("Token refresh error:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});

