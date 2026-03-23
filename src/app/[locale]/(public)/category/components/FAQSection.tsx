"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="my-16 flex flex-col items-center">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HelpCircle size={24} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
        </h2>
        <p className="mt-2 text-gray-500">
          {isArabic 
            ? "كل ما تحتاج معرفته قبل البدء في التسوق في هذا القسم" 
            : "Everything you need to know before you start shopping in this category"}
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-5 text-start transition-colors hover:bg-gray-50"
            >
              <span className="text-lg font-bold text-gray-900">
                {faq.question}
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="border-t border-gray-50 p-5 text-gray-600 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
