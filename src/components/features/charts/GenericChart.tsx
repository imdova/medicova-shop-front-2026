"use client";

import { useState } from "react";
import { ApexOptions } from "apexcharts";
import {
  GenericChartProps,
  TimePeriod,
  ChartType,
  TimePeriodData,
} from "./generic/types";
import { GenericChartHeader } from "./generic/GenericChartHeader";
import { GenericChartCards } from "./generic/GenericChartCards";
import { GenericChartRenderer } from "./generic/GenericChartRenderer";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedTitle } from "@/types/language";
import { LanguageType } from "@/util/translations";

export * from "./generic/types";

const GenericChart = ({
  data,
  chartTitle = "Data Overview",
  cards = [],
  showCards = true,
  defaultSelected = "",
  chartDisplayType = "both",
}: GenericChartProps) => {
  const t = useTranslations("chart");
  const locale = useLocale() as LanguageType;
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Yearly");
  const [chartType, setChartType] = useState<ChartType>(
    chartDisplayType === "both" ? "line" : chartDisplayType,
  );
  const [selectedSeries, setSelectedSeries] = useState<string>(
    defaultSelected || (cards.length > 0 ? cards[0].title.en : ""),
  );

  const getChartData = (): TimePeriodData => {
    const periodData = data[timePeriod.toLowerCase() as keyof typeof data];
    return periodData || { categories: { en: [], ar: [] }, series: [] };
  };

  const { categories, series } = getChartData();

  const filteredSeries =
    !showCards || !cards.length
      ? series
      : selectedSeries
        ? series.filter(
            (s) => s.name.en === selectedSeries || s.name.ar === selectedSeries,
          )
        : series;

  const apexSeries = filteredSeries.map((s) => ({
    name: s.name[locale as keyof LocalizedTitle],
    data: s.data,
    color: s.color,
  }));

  const hasNoData =
    filteredSeries.length === 0 ||
    filteredSeries.every((s) => s.data.length === 0) ||
    filteredSeries.every((s) => s.data.every((d) => d === 0));

  const chartOptions: ApexOptions = {
    chart: {
      id: "generic-chart",
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: locale === "ar" ? 350 : 800,
        dynamicAnimation: { enabled: true, speed: 350 },
      },
      fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
    },
    stroke: { width: chartType === "line" ? [3, 3] : [0], curve: "smooth" },
    markers: {
      size: chartType === "line" ? 5 : 0,
      hover: { size: chartType === "line" ? 7 : 0 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories[locale as keyof typeof categories],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
          fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
          fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
        },
        formatter: (val: number) =>
          val.toLocaleString(locale === "ar" ? "ar-EG" : "en-US"),
      },
      tickAmount: 4,
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    colors: filteredSeries.map((s) => s.color),
    tooltip: {
      y: {
        formatter: (val: number) =>
          val.toLocaleString(locale === "ar" ? "ar-EG" : "en-US"),
      },
      style: {
        fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
      },
    },
    legend: {
      show: !showCards && filteredSeries.length > 1,
      position: "top",
      fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
      labels: { colors: "#6b7280", useSeriesColors: false },
    },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "45%" } },
  };

  const getOverviewTitle = () => {
    switch (timePeriod) {
      case "Yearly":
        return t("yearlyOverview");
      case "Monthly":
        return t("monthlyOverview");
      case "Weekly":
        return t("weeklyOverview");
      default:
        return `${timePeriod} data overview`;
    }
  };

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      <GenericChartHeader
        chartTitle={chartTitle}
        filteredSeries={filteredSeries}
        showCards={showCards}
        chartDisplayType={chartDisplayType}
        chartType={chartType}
        setChartType={setChartType}
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
      />

      {showCards && cards.length > 0 && (
        <GenericChartCards
          cards={cards}
          selectedSeries={selectedSeries}
          setSelectedSeries={setSelectedSeries}
          overviewTitle={getOverviewTitle()}
        />
      )}

      <GenericChartRenderer
        showCards={showCards}
        hasNoData={hasNoData}
        chartOptions={chartOptions}
        apexSeries={apexSeries}
        chartType={chartType}
        noDataText={t("noData")}
      />
    </div>
  );
};

export default GenericChart;
