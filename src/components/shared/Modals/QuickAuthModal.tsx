"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { checkPhoneExists } from "@/services/userService";

interface QuickAuthModalProps {
  onClose: () => void;
  redirectUrl?: string;
}

type AuthStep = "phone" | "password";

const QuickAuthModal: React.FC<QuickAuthModalProps> = ({ onClose, redirectUrl = "/checkout" }) => {
  const locale = useLocale();
  const t = useTranslations("auth");
  const router = useRouter();
  
  const [step, setStep] = useState<AuthStep>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ phone: string; password?: string }>();

  const handlePhoneSubmit = async (data: { phone: string }) => {
    setLoading(true);
    setError(null);
    try {
      const exists = await checkPhoneExists(data.phone);
      setPhone(data.phone);
      if (exists) {
        setStep("password");
      } else {
        // Redirect to checkout as new user
        router.push(`${redirectUrl}?phone=${encodeURIComponent(data.phone)}&isNew=true`);
        onClose();
      }
    } catch (err) {
      setError("Something went wrong checking the phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: { password?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: phone,
        password: data.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(redirectUrl);
        onClose();
      }
    } catch (err) {
      setError("Login failed. Please check your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 ${locale === "ar" ? "rtl text-right" : ""}`}>
      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="mb-4 text-2xl font-bold text-primary">
              {locale === "ar" ? "رقم الهاتف" : "Phone Number"}
            </h2>
            <p className="mb-6 text-gray-600">
              {locale === "ar" 
                ? "أدخل رقم هاتفك للمتابعة إلى الدفع" 
                : "Enter your phone number to proceed to checkout"}
            </p>
            
            <form onSubmit={handleSubmit(handlePhoneSubmit)}>
              <div className="mb-4">
                <input
                  type="tel"
                  {...register("phone", { 
                    required: locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required",
                    pattern: {
                       value: /^\+?[0-9]{10,15}$/,
                       message: locale === "ar" ? "رقم غير صالح" : "Invalid phone number"
                    }
                  })}
                  className={`w-full rounded-xl border p-3 outline-none transition-all ${
                    errors.phone ? "border-red-500" : "border-gray-200 focus:border-primary"
                  }`}
                  placeholder="012XXXXXXXX"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-xl py-3 font-bold"
              >
                {loading ? "..." : (locale === "ar" ? "متابعة" : "Continue")}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="password-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="mb-4 text-2xl font-bold text-primary">
              {locale === "ar" ? "كلمة المرور" : "Password"}
            </h2>
            <p className="mb-4 text-gray-600">
              {locale === "ar" 
                ? "يبدو أنك مسجل لدينا بالفعل. أدخل كلمة المرور الخاصة بك." 
                : "It looks like you're already registered. Please enter your password."}
            </p>
            
            <form onSubmit={handleSubmit(handlePasswordSubmit)}>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { 
                      required: locale === "ar" ? "كلمة المرور مطلوبة" : "Password is required" 
                    })}
                    className={`w-full rounded-xl border p-3 outline-none transition-all ${
                      errors.password ? "border-red-500" : "border-gray-200 focus:border-primary"
                    } ${locale === "ar" ? "pl-11 pr-3" : "pr-11 pl-3"}`}
                    placeholder="••••••••"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute bottom-3 top-3 h-6 w-6 text-gray-400 hover:text-primary ${
                      locale === "ar" ? "left-3" : "right-3"
                    }`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-xl py-3 font-bold"
              >
                {loading ? "..." : (locale === "ar" ? "تسجيل الدخول" : "Login")}
              </button>
              
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="mt-4 w-full text-sm text-gray-500 hover:text-primary"
              >
                {locale === "ar" ? "تغيير رقم الهاتف" : "Change phone number"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickAuthModal;
