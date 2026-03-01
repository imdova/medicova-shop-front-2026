import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { LanguageType } from "@/util/translations";
import { ChartType } from "./types";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  showCards: boolean;
  hasNoData: boolean;
  chartOptions: ApexOptions;
  apexSeries: any[];
  chartType: ChartType;
  noDataText: string;
}

import { useLocale } from "next-intl";

export const GenericChartRenderer = ({
  showCards,
  hasNoData,
  chartOptions,
  apexSeries,
  chartType,
  noDataText,
}: Props) => {
  const locale = useLocale() as LanguageType;
  return (
    <div className="pt-6">
      <div
        className={`${showCards ? "min-h-72" : "min-h-[320px]"} h-full w-full`}
      >
        {!hasNoData ? (
          <Chart
            options={{
              ...chartOptions,
              chart: {
                ...chartOptions.chart,
              },
            }}
            series={apexSeries}
            type={chartType}
            height="100%"
            width="100%"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-gray-500"
            style={{
              fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
            }}
          >
            {noDataText}
          </div>
        )}
      </div>
    </div>
  );
};
