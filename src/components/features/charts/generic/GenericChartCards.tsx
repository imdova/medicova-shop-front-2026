import React from "react";
import { motion } from "framer-motion";
import { LanguageType } from "@/util/translations";
import { CardData } from "./types";

interface Props {
  cards: CardData[];
  selectedSeries: string;
  setSelectedSeries: (series: string) => void;
  overviewTitle: string;
}

import { LocalizedTitle } from "@/types/language";

import { useLocale } from "next-intl";

export const GenericChartCards = ({
  cards,
  selectedSeries,
  setSelectedSeries,
  overviewTitle,
}: Props) => {
  const locale = useLocale() as LanguageType;
  return (
    <section className="mt-10" aria-label="Chart Summary Cards">
      <h2 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
        {overviewTitle}
      </h2>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedSeries === card.title.en;
          return (
            <motion.div
              key={card.title.en}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedSeries(card.title.en)}
              role="button"
              aria-pressed={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedSeries(card.title.en);
                }
              }}
              className={`flex flex-1 cursor-pointer items-center gap-4 rounded-[1.5rem] border p-3 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? "border-primary/20 shadow-primary/5 ring-primary/5 bg-white shadow-xl ring-1"
                  : "border-gray-50 bg-gray-50/30 hover:border-gray-200 hover:bg-white"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-500 ${
                  isSelected
                    ? "text-white shadow-lg"
                    : "bg-white text-gray-400 shadow-sm"
                }`}
                style={{
                  backgroundColor: isSelected ? card.color : undefined,
                }}
              >
                {Icon && <Icon size={16} />}
              </div>
              <div>
                <span
                  className={`block text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    isSelected ? "text-primary/70" : "text-gray-400"
                  }`}
                >
                  {card.title[locale as keyof LocalizedTitle]}
                </span>
                <p
                  className={`text-lg font-extrabold tracking-tight transition-colors ${
                    isSelected ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {card.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
