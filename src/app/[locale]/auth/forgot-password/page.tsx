"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { Button } from "@/components/shared/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronDown, 
  Lock, 
  KeyRound, 
  Smartphone,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";


const COUNTRY_CODES = [
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "UAE", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧" },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶" },
  { name: "Libya", code: "LY", dialCode: "+218", flag: "🇱🇾" },
  { name: "Tunisia", code: "TN", dialCode: "+216", flag: "🇹🇳" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
  { name: "Sudan", code: "SD", dialCode: "+249", flag: "🇸🇩" },
  { name: "Palestine", code: "PS", dialCode: "+970", flag: "🇵🇸" },
  { name: "Syria", code: "SY", dialCode: "+963", flag: "🇸🇾" },
  { name: "Yemen", code: "YE", dialCode: "+967", flag: "🇾🇪" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
];

type Step = 1 | 2 | 3 | 4;

const translations = {
  title1: { en: "Forgot Password?", ar: "نسيت كلمة المرور؟" },
  subtitle1: { en: "No worries, we'll send you a reset code via SMS.", ar: "لا تقلق، سنرسل لك كود إعادة التعيين عبر رسالة نصية." },
  title2: { en: "Verify Code", ar: "التحقق من الكود" },
  subtitle2: { en: "Enter the 6-digit code sent to", ar: "أدخل الكود المكون من 6 أرقام المرسل إلى" },
  title3: { en: "New Password", ar: "كلمة مرور جديدة" },
  subtitle3: { en: "Set a secure password for your account.", ar: "قم بتعيين كلمة مرور آمنة لحسابك." },
  title4: { en: "Success!", ar: "تم بنجاح!" },
  subtitle4: { en: "Your password has been reset successfully.", ar: "تمت إعادة تعيين كلمة المرور الخاصة بك بنجاح." },
  phoneLabel: { en: "Phone Number", ar: "رقم الهاتف" },
  phonePlaceholder: { en: "XXXXXXXXXX", ar: "XXXXXXXXXX" },
  otpLabel: { en: "6-Digit Code", ar: "كود التحقق" },
  otpPlaceholder: { en: "000000", ar: "000000" },
  newPasswordLabel: { en: "New Password", ar: "كلمة المرور الجديدة" },
  confirmPasswordLabel: { en: "Confirm New Password", ar: "تأكيد كلمة المرور" },
  button1: { en: "Send Code", ar: "إرسال الكود" },
  button2: { en: "Verify & Continue", ar: "تحقق واستمرار" },
  button3: { en: "Reset Password", ar: "إعادة تعيين كلمة المرور" },
  button4: { en: "Back to Login", ar: "العودة لتسجيل الدخول" },
  sending: { en: "Processing...", ar: "جاري المعالجة..." },
  back: { en: "Back", ar: "رجوع" },
  notReceived: { en: "Didn't receive the code?", ar: "لم يصلك الكود؟" },
  resend: { en: "Resend", ar: "إعادة إرسال" },
  errorMismatch: { en: "Passwords do not match", ar: "كلمات المرور غير متوافقة" },
  errorShort: { en: "Password is too short", ar: "كلمة المرور قصيرة جداً" },
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<Step>(1);
  const [countryCode, setCountryCode] = useState("+20");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const locale = useAppLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const router = useRouter();

  const t = (key: keyof typeof translations) => translations[key][locale];
  const fullPhone = `${countryCode}${phone}`;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 10) return;
    setPhone(val);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient({
        endpoint: "/auth/forgot-password/send-otp",
        body: { phone: fullPhone, channel: "sms" },
      });
      toast.success(isAr ? "تم إرسال الكود" : "OTP sent successfully");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || (isAr ? "حدث خطأ ما" : "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response: any = await apiClient({
        endpoint: "/auth/forgot-password/verify-otp",
        body: { phone: fullPhone, channel: "sms", code: otp },
      });
      
      // The API wraps data in a 'data' object
      const token = response.data?.resetToken || response.resetToken;
      
      if (!token) {
        throw new Error(isAr ? "فشل الحصول على رمز الاستعادة" : "Could not retrieve reset token");
      }
      
      setResetToken(token);
      toast.success(isAr ? "تم التحقق" : "Verified successfully");
      setStep(3);
    } catch (error: any) {
      toast.error(error.message || (isAr ? "كود غير صحيح" : "Invalid OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("errorMismatch"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("errorShort"));
      return;
    }

    setIsLoading(true);
    try {
      await apiClient({
        endpoint: "/auth/forgot-password/reset",
        body: { 
          resetToken, 
          newPassword, 
          confirmNewPassword: confirmPassword 
        },
      });
      toast.success(isAr ? "تم تغيير كلمة المرور" : "Password reset successfully");
      setStep(4);
    } catch (error: any) {
      toast.error(error.message || (isAr ? "فشل التغيير" : "Reset failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20 }}
          >
            <Link
              href="/signin"
              className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
              {t("button4")}
            </Link>

            <h1 className="mb-2 text-3xl font-bold text-gray-800">{t("title1")}</h1>
            <p className="mb-8 text-gray-500">{t("subtitle1")}</p>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phoneLabel")}</Label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      id="countryCode"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className={`h-12 appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2 ${isAr ? "pl-8 pr-3" : "pl-3 pr-8"} text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all`}
                      style={{ minWidth: "110px" }}
                    >
                      {COUNTRY_CODES.map((country) => (
                        <option key={country.code} value={country.dialCode}>
                          {country.flag} {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <div className={`pointer-events-none absolute inset-y-0 ${isAr ? "left-3" : "right-3"} flex items-center`}>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder={t("phonePlaceholder")}
                      value={phone}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      required
                      className="h-12 bg-gray-50 border-gray-200 pl-10 rounded-xl focus:ring-green-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {isAr ? `${phone.length}/10 رقم` : `${phone.length}/10 digits`}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-base font-bold text-white shadow-lg shadow-green-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("sending")}
                  </div>
                ) : (
                  t("button1")
                )}
              </Button>
            </form>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20 }}
          >
            <button
              onClick={() => setStep(1)}
              className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
              {t("back")}
            </button>

            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-gray-800">{t("title2")}</h1>
            <p className="mb-8 text-gray-500">
              {t("subtitle2")} <span className="font-semibold text-gray-800" dir="ltr">{fullPhone}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">{t("otpLabel")}</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder={t("otpPlaceholder")}
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    required
                    className="h-12 text-center text-2xl tracking-[0.5em] font-bold bg-gray-50 border-gray-200 rounded-xl focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                {t("notReceived")}{" "}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="font-bold text-green-600 hover:underline"
                >
                  {t("resend")}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-base font-bold text-white shadow-lg shadow-green-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("sending")}
                  </div>
                ) : (
                  t("button2")
                )}
              </Button>
            </form>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20 }}
          >
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <Lock className="h-8 w-8" />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-gray-800">{t("title3")}</h1>
            <p className="mb-8 text-gray-500">{t("subtitle3")}</p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("newPasswordLabel")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-12 pl-10 pr-10 bg-gray-50 border-gray-200 rounded-xl focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 pl-10 bg-gray-50 border-gray-200 rounded-xl focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-base font-bold text-white shadow-lg shadow-green-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t("sending")}
                    </div>
                  ) : (
                    t("button3")
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-3 text-3xl font-bold text-gray-800">{t("title4")}</h1>
            <p className="mb-10 text-lg text-gray-500 leading-relaxed">{t("subtitle4")}</p>

            <Button
              onClick={() => router.push("/signin")}
              className="h-14 w-full rounded-2xl bg-gray-900 text-base font-bold text-white shadow-xl shadow-gray-200 transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className={`mr-2 h-5 w-5 ${isAr ? "rotate-180" : ""}`} />
              {t("button4")}
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div dir={direction} className="flex min-h-screen bg-white">
      {/* Decorative top bar */}
      <div className="absolute left-0 right-0 top-0 z-20 h-1 bg-gradient-to-r from-green-600 via-green-400 to-green-600" />

      {/* Left side - Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-20 lg:px-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="relative hidden lg:flex flex-1 items-center justify-center overflow-hidden bg-[#f3fbf6]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #16a34a 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
        
        {/* Floating background shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 w-full max-w-lg p-12 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative mx-auto w-64 h-64 mb-12">
              <div className="absolute inset-0 bg-green-600 rounded-[3rem] rotate-6 opacity-10" />
              <div className="absolute inset-0 bg-green-600 rounded-[3rem] -rotate-3" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-24 h-24 text-white" strokeWidth={1.5} />
              </div>
              
              {/* Key illustration */}
              <motion.div 
                className="absolute -bottom-6 -right-6 h-24 w-24 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <KeyRound className="h-10 w-10 text-green-600" />
              </motion.div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isAr ? "نظام حماية متطور" : "Advanced Security System"}
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {isAr 
                ? "نحن نستخدم أحدث تقنيات التشفير لضمان أمان حسابك وبياناتك الشخصية في كل خطوة."
                : "We use the latest encryption technologies to ensure your account and personal data remain secure at every step."}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
