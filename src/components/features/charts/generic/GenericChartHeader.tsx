import React from "react";
import { ChevronDown, BarChart2, LineChart } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { ChartType, TimePeriod, DataPoint } from "./types";

interface Props {
  chartTitle: string;
  filteredSeries: DataPoint[];
  showCards: boolean;
  chartDisplayType: "line" | "bar" | "both";
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
}

import { LocalizedTitle } from "@/types/language";
import { useLocale, useTranslations } from "next-intl";

export const GenericChartHeader = ({
  chartTitle,
  filteredSeries,
  showCards,
  chartDisplayType,
  chartType,
  setChartType,
  timePeriod,
  setTimePeriod,
}: Props) => {
  const t = useTranslations("chart");
  const locale = useLocale() as LanguageType;
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
        {chartTitle === "Data Overview" ? t("dataOverview") : chartTitle}
      </h1>
      <div className="flex w-full items-center justify-between gap-6 md:w-auto">
        {filteredSeries.length > 0 && (
          <div className="flex items-center gap-6">
            {showCards && (
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {filteredSeries.map((s) => (
                  <div
                    key={s.name[locale as keyof LocalizedTitle]}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white"
                      style={{ backgroundColor: s.color }}
                    ></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {s.name[locale as keyof LocalizedTitle]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {chartDisplayType === "both" && (
              <div className="flex items-center gap-1.5 rounded-xl bg-gray-50/50 p-1 ring-1 ring-gray-100/50">
                <button
                  type="button"
                  aria-label="Line Chart"
                  onClick={() => setChartType("line")}
                  className={`rounded-lg p-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    chartType === "line"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-400 hover:bg-white/50 hover:text-gray-600"
                  }`}
                  title={t("lineChart")}
                >
                  <LineChart size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Bar Chart"
                  onClick={() => setChartType("bar")}
                  className={`rounded-lg p-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    chartType === "bar"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-400 hover:bg-white/50 hover:text-gray-600"
                  }`}
                  title={t("barChart")}
                >
                  <BarChart2 size={14} />
                </button>
              </div>
            )}
          </div>
        )}
        <div className="group relative">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            aria-label="Time Period"
            className="focus:ring-primary/5 appearance-none rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2 pr-10 text-xs font-bold text-gray-700 outline-none transition-all duration-300 focus:bg-white focus:ring-4 group-hover:bg-white"
          >
            <option value="Yearly">{t("yearly")}</option>
            <option value="Monthly">{t("monthly")}</option>
            <option value="Weekly">{t("weekly")}</option>
          </select>
          <div
            className={`pointer-events-none absolute inset-y-0 flex items-center px-3 text-gray-400 transition-colors group-hover:text-primary ${
              locale === "ar" ? "left-0" : "right-0"
            }`}
          >
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
