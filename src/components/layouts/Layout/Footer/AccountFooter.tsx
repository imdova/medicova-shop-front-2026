"use client";
import Link from "next/link";
import { getFooterData } from "@/data";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";

const AccountFooter = () => {
  const locale = useAppLocale();
  const t = useTranslations("common");
  const { legalLinks } = getFooterData();

  return (
    <footer
      className="border-t border-gray-200 bg-white py-2 pb-20 text-gray-800 md:pb-0"
      role="contentinfo"
    >
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col items-center justify-between gap-4 md:pb-0 xl:flex-row xl:items-start">
          {/* Social media and copyright */}
          <p
            className="w-fit text-gray-600"
            aria-label={`Copyright ${new Date().getFullYear()}`}
          >
            © {new Date().getFullYear()} {t("copyright")}
          </p>
          {/* Legal links */}
          <nav
            className="flex flex-wrap justify-center gap-4 text-sm"
            aria-label="Legal links"
          >
            {legalLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-gray-600 transition-colors hover:text-green-600"
              >
                {link.name[locale]}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default AccountFooter;
