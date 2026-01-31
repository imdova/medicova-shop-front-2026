import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

type userType = "user" | "seller" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: userType;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    name?: string | null;
    email: string;
    role: userType;
    phone?: string;
    image?: string;
    accessToken?: string;
    refreshToken?: string;
    language?: string;
    accessTokenExpires?: number;
    tokenIssuedAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: userType;
    accessToken?: string;
    refreshToken?: string;
    language?: string;
    accessTokenExpires?: number; // Timestamp when access token expires
    tokenIssuedAt?: number; // Timestamp when token was issued
  }
}
