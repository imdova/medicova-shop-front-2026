"use client";
import Link from "next/link";
import { legalLinks } from "@/constants/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/util/translations";

const AccountFooter = () => {
  const { language } = useLanguage();

  return (
    <footer className="border-t border-gray-200 bg-white py-2 pb-20 text-gray-800 md:pb-0">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col items-center justify-between gap-4 md:pb-0 xl:flex-row xl:items-start">
          {/* Social media and copyright */}
          <p className="w-fit text-gray-600">
            © {new Date().getFullYear()} {t("copyright", language)}
          </p>
          {/* Legal links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {legalLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-gray-600 transition-colors hover:text-green-600"
              >
                {link.name[language]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AccountFooter;
