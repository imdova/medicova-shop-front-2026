"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { checkPhoneExists } from "@/services/userService";
import { useAppDispatch } from "@/store/hooks";
import { setCheckoutPhone } from "@/store/slices/checkoutSlice";

interface QuickAuthModalProps {
  onClose: () => void;
  redirectUrl?: string;
}

type AuthStep = "phone" | "password";

const QuickAuthModal: React.FC<QuickAuthModalProps> = ({ onClose, redirectUrl = "/checkout" }) => {
  const locale = useLocale();
  const t = useTranslations("auth");
  const router = useRouter();
  const dispatch = useAppDispatch();
  
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
      const exists = await checkPhoneExists(data.phone); // checkPhoneExists already prepends +2 now
      setPhone(data.phone);
      if (exists) {
        setStep("password");
      } else {
        // Store in Redux and Redirect to checkout as new user
        dispatch(setCheckoutPhone({ phoneNumber: data.phone, isNewUser: true }));
        router.push(redirectUrl);
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
        // Also store in Redux for the checkout page to know it's not a "new" user anymore
        // but it's signed in. Actually, the checkout page will check session.
        dispatch(setCheckoutPhone({ phoneNumber: phone, isNewUser: false }));
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
      <h2 className="mb-4 text-2xl font-bold text-primary">
        {locale === "ar" ? "رقم الهاتف" : "Phone Number"}
      </h2>
      <p className="mb-6 text-gray-600">
        {step === "phone" 
          ? (locale === "ar" ? "أدخل رقم هاتفك للمتابعة إلى الدفع" : "Enter your phone number to proceed to checkout")
          : (locale === "ar" ? "يبدو أنك مسجل لدينا بالفعل. أدخل كلمة المرور الخاصة بك." : "It looks like you're already registered. Please enter your password.")
        }
      </p>
      
      <form onSubmit={handleSubmit(step === "phone" ? handlePhoneSubmit : handlePasswordSubmit)}>
        <div className="mb-4">
          <input
            type="tel"
            disabled={loading || step === "password"}
            {...register("phone", { 
              required: locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required",
              pattern: {
                 value: /^[0-9]{11}$/,
                 message: locale === "ar" ? "يجب أن يكون الرقم 11 رقماً" : "Must be 11 digits"
              }
            })}
            className={`w-full rounded-xl border p-3 outline-none transition-all ${
              errors.phone ? "border-red-500" : "border-gray-200 focus:border-primary"
            } ${step === "password" ? "bg-gray-50 opacity-70" : ""}`}
            placeholder="01XXXXXXXXX"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        {step === "password" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
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
          </motion.div>
        )}

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded-xl py-3 font-bold"
        >
          {loading ? "..." : (
            step === "phone" 
              ? (locale === "ar" ? "متابعة" : "Continue")
              : (locale === "ar" ? "تسجيل الدخول" : "Login")
          )}
        </button>

        {step === "password" && (
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="mt-4 w-full text-sm text-gray-500 hover:text-primary transition-colors"
          >
            {locale === "ar" ? "تغيير رقم الهاتف" : "Change phone number"}
          </button>
        )}
      </form>
    </div>
  );
};

export default QuickAuthModal;
