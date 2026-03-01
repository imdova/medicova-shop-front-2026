"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  FooterSection,
  AppLink,
  SocialMedia,
  PaymentMethod,
  LegalLink,
} from "@/types";

const FullFooter = ({ footerData }: { footerData: any }) => {
  const { sections, appLinks, socialMedia, paymentMethods, legalLinks } =
    footerData as {
      sections: FooterSection[];
      appLinks: AppLink[];
      socialMedia: SocialMedia[];
      paymentMethods: PaymentMethod[];
      legalLinks: LegalLink[];
    };
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const t = useTranslations("footer");
  const locale = useAppLocale();

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <footer
      className="border-t border-gray-200 bg-white text-gray-800"
      role="contentinfo"
    >
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">{t("helpTitle")}</h2>
          <p className="text-gray-600">{t("helpSubtitle")}</p>
        </div>

        {/* Footer sections grid */}
        <nav
          className="mb-8 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4 xl:grid-cols-7"
          aria-label="Footer Navigation"
        >
          {sections.map((section, index) => (
            <div
              key={index}
              className="mb-4 border-b border-gray-200 md:mb-6 md:border-none"
            >
              <button
                className="flex w-full items-center justify-between py-3 text-left font-semibold uppercase md:pointer-events-none md:py-0"
                onClick={() => toggleSection(section.title[locale])}
                aria-expanded={expandedSections[section.title[locale]] || false}
                aria-controls={`footer-section-${index}`}
              >
                <h3 className="text-sm">{section.title[locale]}</h3>
                <span className="md:hidden" aria-hidden="true">
                  {expandedSections[section.title[locale]] ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </span>
              </button>

              <div
                id={`footer-section-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections[section.title[locale]]
                    ? "max-h-96 py-2"
                    : "max-h-0 py-0"
                } md:max-h-full md:py-2`}
              >
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="block py-1 text-xs text-gray-600 transition-colors hover:text-green-600"
                      >
                        {link.name[locale]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </nav>

        <div className="mb-8 flex flex-col justify-between gap-4 border-gray-200 pt-8 md:flex-row md:border-t">
          {/* App Section */}
          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-sm font-bold uppercase">
              {t("shopOnTheGo")}
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {appLinks.map((app, index) => (
                <Link
                  key={index}
                  href={app.href}
                  className="inline-block transition-opacity hover:opacity-80"
                  aria-label={`Download on ${app.name}`}
                >
                  <Image
                    src={app.icon}
                    alt=""
                    width={120}
                    height={40}
                    className="h-10 object-contain"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-sm font-bold uppercase">
              {t("connectWithUs")}
            </h3>
            <nav
              className="mb-4 flex items-center gap-3 md:mb-0"
              aria-label="Social media links"
            >
              {socialMedia.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  aria-label={social.name}
                >
                  <Image
                    src={social.icon}
                    alt=""
                    width={28}
                    height={28}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pb-12 md:py-3 md:pb-0 xl:flex-row xl:items-start">
          <p
            className="w-fit text-gray-600"
            aria-label={`Copyright ${new Date().getFullYear()}`}
          >
            © {new Date().getFullYear()} {t("copyright")}
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-4"
            aria-label="Accepted payment methods"
          >
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center">
                <Image
                  src={method.icon}
                  alt={method.name}
                  width={40}
                  height={24}
                  className="h-6 object-contain"
                />
              </div>
            ))}
          </div>

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

export default FullFooter;
