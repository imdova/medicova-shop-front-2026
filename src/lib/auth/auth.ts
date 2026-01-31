import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
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

          // Use the shared login API function
          // This will use BASE_URL environment variable or fallback to the default API URL
          console.log("Attempting login for email:", credentials.email);
          
          const data = await callLoginApi(credentials.email, credentials.password) as ApiLoginResponse;

          if (data.status === "success" && data.data) {
            const { user, accessToken, refreshToken } = data.data;

            // Combine firstName and lastName for the name field
            const fullName = `${user.firstName} ${user.lastName}`.trim();

            // Map API role to our userType
            let role: "user" | "seller" | "admin" = "user";
            if (user.role === "admin") {
              role = "admin";
            } else if (user.role === "seller" || user.role === "vendor") {
              role = "seller";
            }

            console.log("Login successful for user:", user.email, "role:", role);

            // Calculate token expiration (55 minutes from now)
            const tokenIssuedAt = Math.floor(Date.now() / 1000); // Current time in seconds
            const accessTokenExpires = tokenIssuedAt + 55 * 60; // 55 minutes in seconds

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
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // NEXTAUTH_URL is automatically used by NextAuth for callback URL generation
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        // Store tokens in the token object
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.language = user.language;
        // Store token expiration times
        token.accessTokenExpires = user.accessTokenExpires;
        token.tokenIssuedAt = user.tokenIssuedAt;
        return token;
      }

      // Check if token needs to be refreshed (after 55 minutes)
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const tokenIssuedAt = token.tokenIssuedAt || 0;
      const timeSinceIssued = now - tokenIssuedAt;
      const refreshInterval = 55 * 60; // 55 minutes in seconds

      // If token was issued more than 55 minutes ago, refresh it
      if (timeSinceIssued >= refreshInterval && token.refreshToken && token.id) {
        try {
          console.log("Token expired, refreshing...");
          const refreshData = await callRefreshTokenApi(token.refreshToken, token.id);

          if (refreshData.status === "success" && refreshData.data) {
            const { accessToken, refreshToken: newRefreshToken } = refreshData.data;

            // Update tokens
            token.accessToken = accessToken;
            token.refreshToken = newRefreshToken;
            
            // Update expiration times
            token.tokenIssuedAt = Math.floor(Date.now() / 1000);
            token.accessTokenExpires = token.tokenIssuedAt + 55 * 60;

            console.log("Token refreshed successfully");
          } else {
            console.error("Token refresh failed: Invalid response format");
          }
        } catch (error) {
          console.error("Token refresh error:", error);
          // If refresh fails, the token will be invalid and user will need to re-login
          // You could also throw an error here to force re-authentication
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role;
        // Add tokens to session if needed
        if (token.accessToken) {
          (session as { accessToken?: string }).accessToken = token.accessToken;
        }
        if (token.refreshToken) {
          (session as { refreshToken?: string }).refreshToken = token.refreshToken;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
