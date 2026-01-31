"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, PasswordInput } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import Link from "next/link";

// UI text translations
const translations = {
  title: {
    en: "Login to your account",
    ar: "تسجيل الدخول إلى حسابك",
  },
  subtitle: {
    en: "Enter your email below to login to your account",
    ar: "أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك",
  },
  email: {
    en: "Email",
    ar: "البريد الإلكتروني",
  },
  password: {
    en: "Password",
    ar: "كلمة المرور",
  },
  forgotPassword: {
    en: "Forgot your password?",
    ar: "نسيت كلمة المرور؟",
  },
  login: {
    en: "Login",
    ar: "تسجيل الدخول",
  },
  loggingIn: {
    en: "Logging in...",
    ar: "جاري تسجيل الدخول...",
  },
  orContinueWith: {
    en: "Or continue with",
    ar: "أو تابع مع",
  },
  loginWithGoogle: {
    en: "Login with Google",
    ar: "تسجيل الدخول مع جوجل",
  },
  noAccount: {
    en: "Don't have an account?",
    ar: "ليس لديك حساب؟",
  },
  signUp: {
    en: "Sign up",
    ar: "إنشاء حساب",
  },
  loginFailed: {
    en: "Login failed. Please try again.",
    ar: "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.",
  },
};

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, direction } = useLanguage();
  const router = useRouter();

  const t = (key: keyof typeof translations) => translations[key][language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("loginFailed"));
        setIsLoading(false);
      } else if (result?.ok) {
        // Wait a bit for session to update, then redirect
        setTimeout(async () => {
          // Fetch session to get user role
          const response = await fetch("/api/auth/session");
          const session = await response.json();
          
          if (session?.user?.role) {
            switch (session.user.role) {
              case "admin":
                router.push("/admin");
                break;
              case "seller":
                router.push("/seller");
                break;
              case "user":
              default:
                router.push("/");
                break;
            }
          } else {
            router.push("/");
          }
          router.refresh();
        }, 100);
      }
    } catch {
      setError(t("loginFailed"));
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth would be implemented here
    console.log("Google login clicked");
  };

  return (
    <div dir={direction} className="min-h-screen flex">
      {/* Green top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-green-600 z-10" />
      
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-500 mb-8">
            {t("subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-11 text-base font-medium"
            >
              {isLoading ? t("loggingIn") : t("login")}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-11 border-gray-300 bg-white hover:bg-gray-50"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("loginWithGoogle")}
          </Button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t("noAccount")} </span>
            <Link
              href="/auth/signup"
              className="text-green-600 hover:text-green-700 underline font-medium"
            >
              {t("signUp")}
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-green-50 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, #f8a5c2 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Illustration SVG */}
        <div className="relative w-full h-full flex items-center justify-center p-12">
          <svg
            viewBox="0 0 600 600"
            className="w-full h-full max-w-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Green Arrow Path - bold upward arrow */}
            <path
              d="M 80 520 L 80 480 Q 80 400 120 360 Q 200 280 280 240 Q 360 200 420 160 Q 460 130 480 100 L 480 60"
              stroke="#16a34a"
              strokeWidth="80"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 480 60 L 450 50 L 480 40 Z"
              fill="#16a34a"
            />

            {/* Woman figure on the left */}
            <g transform="translate(150, 440)">
              {/* Head */}
              <circle cx="30" cy="15" r="18" fill="#fbbf24" />
              {/* Body - green top */}
              <rect x="15" y="33" width="30" height="45" fill="#16a34a" rx="3" />
              {/* Pants - dark gray */}
              <rect x="15" y="78" width="30" height="35" fill="#374151" rx="2" />
              {/* Right arm extended for handshake */}
              <rect x="42" y="40" width="8" height="25" fill="#fbbf24" rx="4" />
              <circle cx="46" cy="65" r="6" fill="#fbbf24" />
              {/* Shoes */}
              <rect x="18" y="113" width="10" height="6" fill="#000" rx="1" />
              <rect x="32" y="113" width="10" height="6" fill="#000" rx="1" />
            </g>

            {/* Man figure on the right */}
            <g transform="translate(320, 400)">
              {/* Head */}
              <circle cx="30" cy="15" r="18" fill="#fbbf24" />
              {/* Body - green shirt with collar */}
              <rect x="15" y="33" width="30" height="45" fill="#16a34a" rx="3" />
              {/* Collar */}
              <path d="M 20 33 L 30 38 L 40 33" stroke="#374151" strokeWidth="2" fill="none" />
              {/* Tie */}
              <path d="M 28 38 L 30 55 L 32 38" fill="#374151" />
              {/* Pants - dark gray */}
              <rect x="15" y="78" width="30" height="35" fill="#374151" rx="2" />
              {/* Left arm extended for handshake */}
              <rect x="5" y="40" width="8" height="25" fill="#fbbf24" rx="4" />
              <circle cx="9" cy="65" r="6" fill="#fbbf24" />
              {/* Briefcase in left hand */}
              <rect x="-5" y="50" width="18" height="12" fill="#16a34a" rx="2" />
              <rect x="-5" y="50" width="18" height="2" fill="#0d4f1c" />
              <rect x="1" y="52" width="6" height="1" fill="#0d4f1c" />
              {/* Shoes */}
              <rect x="18" y="113" width="10" height="6" fill="#374151" rx="1" />
              <rect x="32" y="113" width="10" height="6" fill="#374151" rx="1" />
            </g>

            {/* Handshake connection */}
            <circle cx="300" cy="465" r="8" fill="#fbbf24" />

            {/* Flag at the top */}
            <g transform="translate(460, 80)">
              {/* Flag pole */}
              <rect x="0" y="0" width="6" height="50" fill="#374151" />
              {/* Flag base */}
              <rect x="-8" y="50" width="22" height="10" fill="#374151" rx="2" />
              {/* Flag */}
              <path
                d="M 6 0 L 6 30 L 40 15 Z"
                fill="#16a34a"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
