"use client";
import { useAppLocale } from "@/hooks/useAppLocale";
import { signIn } from "next-auth/react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input, PasswordInput } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { Button } from "@/components/shared/button";
import { Checkbox } from "@/components/shared/Check-Box";
import { callRegisterApi } from "@/lib/auth/registerApi";
import Link from "next/link";

// Country code data – Egypt is first (default)
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
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Tanzania", code: "TZ", dialCode: "+255", flag: "🇹🇿" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪" },
  { name: "Cuba", code: "CU", dialCode: "+53", flag: "🇨🇺" },
  { name: "Dominican Republic", code: "DO", dialCode: "+1-809", flag: "🇩🇴" },
  { name: "Jamaica", code: "JM", dialCode: "+1-876", flag: "🇯🇲" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵" },
  { name: "Myanmar", code: "MM", dialCode: "+95", flag: "🇲🇲" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭" },
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫" },
  { name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷" },
  { name: "Somalia", code: "SO", dialCode: "+252", flag: "🇸🇴" },
  { name: "Mauritania", code: "MR", dialCode: "+222", flag: "🇲🇷" },
  { name: "Comoros", code: "KM", dialCode: "+269", flag: "🇰🇲" },
  { name: "Djibouti", code: "DJ", dialCode: "+253", flag: "🇩🇯" },
];

// UI text translations
const translations = {
  title: {
    en: "Join Our Shopping Community!",
    ar: "انضم إلى مجتمع التسوق لدينا!",
  },
  subtitle: {
    en: "Create your account to begin your journey. Access a world of products and connect with trusted sellers.",
    ar: "أنشئ حسابك لبدء رحلتك. احصل على عالم من المنتجات وتواصل مع البائعين الموثوقين.",
  },
  firstName: {
    en: "First Name",
    ar: "الاسم الأول",
  },
  lastName: {
    en: "Last Name",
    ar: "اسم العائلة",
  },
  email: {
    en: "Email",
    ar: "البريد الإلكتروني",
  },
  password: {
    en: "Password",
    ar: "كلمة المرور",
  },
  phone: {
    en: "Phone Number",
    ar: "رقم الهاتف",
  },
  createAccount: {
    en: "Create My Account",
    ar: "إنشاء حسابي",
  },
  creating: {
    en: "Creating account...",
    ar: "جاري إنشاء الحساب...",
  },
  orContinueWith: {
    en: "Or continue with",
    ar: "أو تابع مع",
  },
  registerWithGoogle: {
    en: "Register with Google",
    ar: "التسجيل مع جوجل",
  },
  alreadyHaveAccount: {
    en: "Already have account?",
    ar: "لديك حساب بالفعل؟",
  },
  login: {
    en: "Login",
    ar: "تسجيل الدخول",
  },
  areYouVendor: {
    en: "Are you a vendor?",
    ar: "هل أنت بائع؟",
  },
  registerAsVendor: {
    en: "Register as a vendor",
    ar: "التسجيل كبائع",
  },
  registerAsSeller: {
    en: "Register as a seller",
    ar: "التسجيل كبائع",
  },
  registrationFailed: {
    en: "Registration failed. Please try again.",
    ar: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
  },
  passwordInvalid: {
    en: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&#)",
    ar: "يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم ورمز خاص واحد على الأقل (مثلاً @$!%*?&#)",
  },
  phoneInvalid: {
    en: "Phone number must be 10 digits and start with 1",
    ar: "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 1",
  },
};

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+20");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useAppLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const router = useRouter();

  const t = (key: keyof typeof translations) => translations[key][locale];

  // Handle phone input – only digits, must start with 1
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // strip non-digits
    if (val.length === 0) {
      setPhoneLocal("");
      return;
    }
    // First digit must be 1
    if (val[0] !== "1") return;
    if (val.length > 10) return;
    setPhoneLocal(val);
  };

  // Find the currently selected country for display
  const selectedCountry = useMemo(
    () => COUNTRY_CODES.find((c) => c.dialCode === countryCode) || COUNTRY_CODES[0],
    [countryCode],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Phone validation – exactly 10 digits starting with 1
    if (phoneLocal.length !== 10 || phoneLocal[0] !== "1") {
      setError(t("phoneInvalid"));
      setIsLoading(false);
      return;
    }

    // Password validation
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&#]/.test(password);

    if (
      password.length < 6 ||
      !hasUpper ||
      !hasLower ||
      !hasNumber ||
      !hasSpecial
    ) {
      setError(t("passwordInvalid"));
      setIsLoading(false);
      return;
    }

    const fullPhone = countryCode + phoneLocal;

    try {
      // Call the registration API
      const registerData = await callRegisterApi({
        firstName,
        lastName,
        email,
        password,
        role: isSeller ? "seller" : "user",
        language: locale,
        phone: fullPhone,
      });

      if (registerData.status === "success" && registerData.data) {
        // After successful registration, attempt auto sign-in
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        // Redirect based on user role regardless of signIn result
        // (account is already created; if signIn failed, auth will redirect to login)
        const userRole = registerData.data.user.role;
        switch (userRole) {
          case "admin":
            router.push("/admin");
            break;
          case "seller":
            router.push("/seller");
            break;
          case "user":
          default:
            router.push("/user");
            break;
        }
        router.refresh();
      } else {
        throw new Error(registerData.message || t("registrationFailed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div dir={direction} className="flex min-h-screen">
      {/* Green top border */}
      <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-green-600" />

      {/* Left side - Illustration */}
      <div className="relative hidden flex-1 overflow-hidden bg-green-50 lg:flex">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #16a34a 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Office furniture outlines in background */}
        <svg
          className="absolute inset-0 h-full w-full opacity-10"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Filing cabinet */}
          <rect
            x="50"
            y="200"
            width="80"
            height="200"
            stroke="#16a34a"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="60"
            y="220"
            width="20"
            height="20"
            stroke="#16a34a"
            strokeWidth="1"
            fill="none"
          />
          <rect
            x="100"
            y="220"
            width="20"
            height="20"
            stroke="#16a34a"
            strokeWidth="1"
            fill="none"
          />

          {/* Desk with monitor */}
          <rect
            x="200"
            y="300"
            width="150"
            height="80"
            stroke="#16a34a"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="220"
            y="250"
            width="110"
            height="60"
            stroke="#16a34a"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="225"
            y="255"
            width="100"
            height="50"
            stroke="#16a34a"
            strokeWidth="1"
            fill="none"
          />

          {/* Window with blinds */}
          <rect
            x="400"
            y="150"
            width="120"
            height="150"
            stroke="#16a34a"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="400"
            y1="200"
            x2="520"
            y2="200"
            stroke="#16a34a"
            strokeWidth="1"
          />
          <line
            x1="400"
            y1="225"
            x2="520"
            y2="225"
            stroke="#16a34a"
            strokeWidth="1"
          />
          <line
            x1="400"
            y1="250"
            x2="520"
            y2="250"
            stroke="#16a34a"
            strokeWidth="1"
          />

          {/* Potted plant */}
          <ellipse
            cx="480"
            cy="380"
            rx="25"
            ry="20"
            stroke="#16a34a"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="475"
            y="400"
            width="10"
            height="30"
            stroke="#16a34a"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Illustration SVG - Three people */}
        <div className="relative flex h-full w-full items-center justify-center p-12">
          <svg
            viewBox="0 0 600 600"
            className="h-full w-full max-w-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Leftmost Man - Dark skin, dark grey shirt, green tie, green pants */}
            <g transform="translate(100, 350)">
              {/* Head */}
              <circle cx="30" cy="15" r="18" fill="#8b5a3c" />
              {/* Body - dark grey shirt */}
              <rect
                x="15"
                y="33"
                width="30"
                height="45"
                fill="#374151"
                rx="3"
              />
              {/* Green tie */}
              <path d="M 28 38 L 30 55 L 32 38" fill="#16a34a" />
              {/* Green pants */}
              <rect
                x="15"
                y="78"
                width="30"
                height="35"
                fill="#16a34a"
                rx="2"
              />
              {/* Left hand on hip */}
              <rect x="5" y="45" width="8" height="20" fill="#8b5a3c" rx="4" />
              {/* Right arm bent, gesturing */}
              <rect x="42" y="40" width="8" height="25" fill="#8b5a3c" rx="4" />
              <circle cx="46" cy="65" r="6" fill="#8b5a3c" />
              {/* Shoes */}
              <rect x="18" y="113" width="10" height="6" fill="#000" rx="1" />
              <rect x="32" y="113" width="10" height="6" fill="#000" rx="1" />
            </g>

            {/* Middle Man - Light skin, bright green shirt, dark grey tie, dark grey pants */}
            <g transform="translate(250, 340)">
              {/* Head */}
              <circle cx="30" cy="15" r="18" fill="#fbbf24" />
              {/* Body - bright green shirt */}
              <rect
                x="15"
                y="33"
                width="30"
                height="45"
                fill="#22c55e"
                rx="3"
              />
              {/* Dark grey tie */}
              <path d="M 28 38 L 30 55 L 32 38" fill="#374151" />
              {/* Dark grey pants */}
              <rect
                x="15"
                y="78"
                width="30"
                height="35"
                fill="#374151"
                rx="2"
              />
              {/* Right arm bent, hand near leftmost man's shoulder */}
              <rect x="42" y="40" width="8" height="25" fill="#fbbf24" rx="4" />
              <circle cx="46" cy="65" r="6" fill="#fbbf24" />
              {/* Left arm bent, gesturing */}
              <rect x="5" y="40" width="8" height="25" fill="#fbbf24" rx="4" />
              <circle cx="9" cy="65" r="6" fill="#fbbf24" />
              {/* Shoes */}
              <rect
                x="18"
                y="113"
                width="10"
                height="6"
                fill="#374151"
                rx="1"
              />
              <rect
                x="32"
                y="113"
                width="10"
                height="6"
                fill="#374151"
                rx="1"
              />
            </g>

            {/* Rightmost Woman - Light skin, dark grey blazer, bright green top, dark grey pants */}
            <g transform="translate(400, 350)">
              {/* Head */}
              <circle cx="30" cy="15" r="18" fill="#fbbf24" />
              {/* Blazer - dark grey */}
              <rect
                x="12"
                y="33"
                width="36"
                height="50"
                fill="#374151"
                rx="3"
              />
              {/* Green top visible under blazer */}
              <rect x="18" y="40" width="24" height="35" fill="#22c55e" />
              {/* Dark grey pants */}
              <rect
                x="15"
                y="83"
                width="30"
                height="30"
                fill="#374151"
                rx="2"
              />
              {/* Left arm bent, gesturing */}
              <rect x="5" y="40" width="8" height="25" fill="#fbbf24" rx="4" />
              <circle cx="9" cy="65" r="6" fill="#fbbf24" />
              {/* Right arm bent */}
              <rect x="47" y="45" width="8" height="20" fill="#fbbf24" rx="4" />
              {/* Shoes */}
              <rect
                x="18"
                y="113"
                width="10"
                height="6"
                fill="#374151"
                rx="1"
              />
              <rect
                x="32"
                y="113"
                width="10"
                height="6"
                fill="#374151"
                rx="1"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex flex-1 items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            {t("title")}
          </h1>
          <p className="mb-8 text-sm text-gray-500">{t("subtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name Field */}

            <div className="flex gap-3">
              <div className="w-1/2 space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="eg. James"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Last Name Field */}
              <div className="w-1/2 space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="eg. Bond"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

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
              <Label htmlFor="password">{t("password")}</Label>
              <PasswordInput
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Phone Field with Country Code */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <div className="flex gap-2">
                {/* Country code dropdown */}
                <div className="relative">
                  <select
                    id="countryCode"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-10 appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    style={{ minWidth: "110px" }}
                  >
                    {COUNTRY_CODES.map((country) => (
                      <option key={country.code} value={country.dialCode}>
                        {country.flag} {country.dialCode}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {/* Local phone number input */}
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="1XXXXXXXXXX"
                  value={phoneLocal}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  required
                  className="w-full"
                />
              </div>
              {/* Helper text */}
              <p className="text-xs text-gray-400">
                {locale === "ar"
                  ? `يبدأ بـ 1 — ${phoneLocal.length}/10 رقم`
                  : `Starts with 1 — ${phoneLocal.length}/10 digits`}
              </p>
            </div>

            {/* Seller Role Checkbox */}
            <div
              className={`flex items-center gap-2 ${direction === "rtl" ? "flex-row-reverse" : ""}`}
            >
              <Checkbox
                id="seller-role"
                checked={isSeller}
                onCheckedChange={(checked) => setIsSeller(checked === true)}
              />
              <Label
                htmlFor="seller-role"
                className="cursor-pointer text-sm font-normal text-gray-700"
              >
                {t("registerAsSeller")}
              </Label>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Create Account Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-green-600 text-base font-medium text-white hover:bg-green-700"
            >
              {isLoading ? t("creating") : t("createAccount")}
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

          {/* Google Register Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleRegister}
            className="h-11 w-full border-gray-300 bg-white hover:bg-gray-50"
          >
            <svg
              className="mr-2 h-5 w-5"
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
            {t("registerWithGoogle")}
          </Button>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t("alreadyHaveAccount")} </span>
            <Link
              href="/signin"
              className="font-medium text-green-600 underline hover:text-green-700"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
