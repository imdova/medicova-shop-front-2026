import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LanguageType } from "@/util/translations";

type FormData = {
  email: string;
  password: string;
  name?: string;
};

type AuthLoginProps = {
  redirect?: string;
  locale?: LanguageType;
};

const authMessages = {
  loginTitle: {
    en: "Login",
    ar: "تسجيل الدخول",
  },
  signupTitle: {
    en: "Sign Up",
    ar: "إنشاء حساب",
  },
  loginHeading: {
    en: "Welcome back!",
    ar: "مرحبًا بعودتك!",
  },
  signupHeading: {
    en: "Create your account",
    ar: "إنشاء حساب جديد",
  },
  loginSubtitle: {
    en: "Sign in to access your Medicova account",
    ar: "سجّل الدخول للوصول إلى حسابك في Medicova",
  },
  signupSubtitle: {
    en: "Join Medicova today",
    ar: "انضم إلى Medicova اليوم",
  },
  loginButton: {
    en: "Log in",
    ar: "تسجيل الدخول",
  },
  signupButton: {
    en: "Sign up",
    ar: "إنشاء حساب",
  },
  emailLabel: {
    en: "Email address",
    ar: "البريد الإلكتروني",
  },
  emailPlaceholder: {
    en: "your@email.com",
    ar: "بريدك الإلكتروني",
  },
  passwordLabel: {
    en: "Password",
    ar: "كلمة المرور",
  },
  passwordPlaceholder: {
    en: "••••••••",
    ar: "••••••••",
  },
  nameLabel: {
    en: "Full Name",
    ar: "الاسم الكامل",
  },
  namePlaceholder: {
    en: "Your full name",
    ar: "اسمك الكامل",
  },
  forgotPassword: {
    en: "Forgot password?",
    ar: "نسيت كلمة المرور؟",
  },
  submitLogin: {
    en: "Sign In",
    ar: "تسجيل الدخول",
  },
  submitSignup: {
    en: "Sign Up",
    ar: "إنشاء الحساب",
  },
  submittingLogin: {
    en: "Signing in...",
    ar: "جارٍ تسجيل الدخول...",
  },
  submittingSignup: {
    en: "Creating account...",
    ar: "جارٍ إنشاء الحساب...",
  },
  termsText: {
    en: "By continuing, you agree to our",
    ar: "بالمتابعة، فإنك توافق على",
  },
  terms: {
    en: "Terms of Service",
    ar: "شروط الخدمة",
  },
  privacy: {
    en: "Privacy Policy",
    ar: "سياسة الخصوصية",
  },
};

const AuthLogin: React.FC<AuthLoginProps> = ({ redirect, locale = "en" }) => {
  const t = (key: keyof typeof authMessages) => authMessages[key][locale];

  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    reset();
    setError(null);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          router.push(redirect ?? "/");
        }
      } else {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Sign up failed");
        }

        const loginResult = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (loginResult?.error) {
          setError(loginResult.error);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center p-4 ${locale === "ar" ? "rtl text-right" : ""}`}
    >
      <Head>
        <title>{isLogin ? t("loginTitle") : t("signupTitle")} | Medicova</title>
      </Head>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md overflow-hidden bg-white"
        >
          <div className="p-2">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 text-center"
            >
              <h1 className="mb-2 text-3xl font-bold text-primary">
                {isLogin ? t("loginHeading") : t("signupHeading")}
              </h1>
              <p className="text-gray-600">
                {isLogin ? t("loginSubtitle") : t("signupSubtitle")}
              </p>
            </motion.div>

            <div className="mb-8 flex justify-center gap-2">
              <button
                type="button"
                onClick={toggleAuthMode}
                className={`rounded-full px-6 py-2 font-medium transition-all duration-300 ${
                  isLogin
                    ? "bg-primary text-white shadow-md"
                    : "border border-primary bg-transparent text-primary"
                }`}
              >
                {t("loginButton")}
              </button>
              <button
                type="button"
                onClick={toggleAuthMode}
                className={`rounded-full px-6 py-2 font-medium transition-all duration-300 ${
                  !isLogin
                    ? "bg-primary text-white shadow-md"
                    : "border border-primary bg-transparent text-primary"
                }`}
              >
                {t("signupButton")}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <motion.div className="mb-4">
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t("emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={`w-full rounded-lg border px-4 py-3 outline-none transition-all ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("emailPlaceholder")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </motion.div>

              <motion.div className="mb-4">
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t("passwordLabel")}
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={`w-full rounded-lg border px-4 py-3 outline-none transition-all ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("passwordPlaceholder")}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </motion.div>

              {!isLogin && (
                <motion.div className="mb-4">
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t("nameLabel")}
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name", {
                      required: !isLogin ? "Name is required" : false,
                    })}
                    className={`w-full rounded-lg border px-4 py-3 outline-none transition-all ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={t("namePlaceholder")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </motion.div>
              )}

              {isLogin && (
                <motion.div className="mb-6 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                </motion.div>
              )}

              <motion.div className="mb-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-green-700 ${
                    isSubmitting ? "opacity-70" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {isLogin ? t("submittingLogin") : t("submittingSignup")}
                    </>
                  ) : isLogin ? (
                    t("submitLogin")
                  ) : (
                    t("submitSignup")
                  )}
                </button>
              </motion.div>

              <motion.div className="text-center text-sm text-gray-500">
                <p>
                  {t("termsText")}{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    {t("terms")}
                  </Link>{" "}
                  {locale === "ar" ? "و" : "and"}{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    {t("privacy")}
                  </Link>
                </p>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLogin;
