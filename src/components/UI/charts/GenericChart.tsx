"use client";

import { LocalizedTitle } from "@/types/language";
import { LanguageType } from "@/util/translations";
import { ApexOptions } from "apexcharts";
import { ChevronDown, BarChart2, LineChart, LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type TimePeriod = "Yearly" | "Monthly" | "Weekly";
type ChartType = "line" | "bar" | "area";

export interface DataPoint {
  name: LocalizedTitle;
  data: number[];
  color: string;
}

export interface TimePeriodData {
  categories: {
    en: string[];
    ar: string[];
  };
  series: DataPoint[];
}

export interface ChartData {
  yearly: TimePeriodData;
  monthly: TimePeriodData;
  weekly: TimePeriodData;
}

interface CardData {
  title: LocalizedTitle;
  value: string;
  color: string;
  icon?: LucideIcon;
}

interface Props {
  data: ChartData;
  showCards?: boolean;
  cards?: CardData[];
  chartTitle?: string;
  defaultSelected?: string;
  chartDisplayType?: "line" | "bar" | "both";
  locale: LanguageType;
}

const GenericChart = ({
  data,
  chartTitle = "Data Overview",
  cards = [],
  showCards = true,
  defaultSelected = "",
  chartDisplayType = "both",
  locale,
}: Props) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Yearly");
  const [chartType, setChartType] = useState<ChartType>(
    chartDisplayType === "both" ? "line" : chartDisplayType,
  );
  const [selectedSeries, setSelectedSeries] = useState<string>(
    defaultSelected || (cards.length > 0 ? cards[0].title.en : ""),
  );

  // Translations
  const translations = {
    en: {
      yearly: "Yearly",
      monthly: "Monthly",
      weekly: "Weekly",
      dataOverview: "Data Overview",
      noData: "No data available",
      yearlyOverview: "Yearly data overview",
      monthlyOverview: "Monthly data overview",
      weeklyOverview: "Weekly data overview",
      lineChart: "Line Chart",
      barChart: "Bar Chart",
    },
    ar: {
      yearly: "سنوي",
      monthly: "شهري",
      weekly: "أسبوعي",
      dataOverview: "نظرة عامة على البيانات",
      noData: "لا تتوفر بيانات",
      yearlyOverview: "نظرة عامة على البيانات السنوية",
      monthlyOverview: "نظرة عامة على البيانات الشهرية",
      weeklyOverview: "نظرة عامة على البيانات الأسبوعية",
      lineChart: "مخطط خطي",
      barChart: "مخطط شريطي",
    },
  };

  const t = translations[locale];

  // Get data based on selected time period
  const getChartData = (): TimePeriodData => {
    const periodData = data[timePeriod.toLowerCase() as keyof typeof data];
    return periodData || { categories: { en: [], ar: [] }, series: [] };
  };

  // Filter series based on selected card (if cards are provided and showCards is true)
  const getFilteredSeries = () => {
    const { series } = getChartData();

    // If not showing cards or no cards configured, return all series
    if (!showCards || !cards.length) return series;

    // If a series is selected, filter by matching either English or Arabic name
    if (selectedSeries) {
      return series.filter(
        (s) => s.name.en === selectedSeries || s.name.ar === selectedSeries,
      );
    }

    return series;
  };

  const { categories } = getChartData();
  const filteredSeries = getFilteredSeries();

  // Transform series data to match ApexCharts expected format
  const getApexSeries = () => {
    return filteredSeries.map((series) => ({
      name: series.name[locale], // Localized name
      data: series.data,
      color: series.color,
    }));
  };

  // More comprehensive no-data check
  const hasNoData =
    filteredSeries.length === 0 ||
    filteredSeries.every((s) => s.data.length === 0) ||
    filteredSeries.every((s) => s.data.every((d) => d === 0));

  const chartOptions: ApexOptions = {
    chart: {
      id: "generic-chart",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
      fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
    },
    stroke: {
      width: chartType === "line" ? [3, 3] : [0],
      curve: "smooth",
    },
    markers: {
      size: chartType === "line" ? 5 : 0,
      hover: {
        size: chartType === "line" ? 7 : 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories[locale],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
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
        formatter: (val: number) => {
          return val.toLocaleString(locale === "ar" ? "ar-EG" : "en-US");
        },
      },
      tickAmount: 4,
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    colors: filteredSeries.map((s) => s.color),
    tooltip: {
      y: {
        formatter: (val: number) => {
          return val.toLocaleString(locale === "ar" ? "ar-EG" : "en-US");
        },
      },
      style: {
        fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
      },
    },
    legend: {
      show: !showCards && filteredSeries.length > 1,
      position: "top",
      fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
      labels: {
        colors: "#6b7280",
        useSeriesColors: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "45%",
      },
    },
  };

  // RTL support for chart
  if (locale === "ar") {
    chartOptions.chart = {
      ...chartOptions.chart,
      animations: {
        ...chartOptions.chart?.animations,
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    };
  }

  // Get overview title based on time period
  const getOverviewTitle = () => {
    switch (timePeriod) {
      case "Yearly":
        return t.yearlyOverview;
      case "Monthly":
        return t.monthlyOverview;
      case "Weekly":
        return t.weeklyOverview;
      default:
        return `${timePeriod} data overview`;
    }
  };

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Header of Chart */}
      <div className="flex flex-col items-start justify-between gap-3 md:mt-3 md:flex-row md:items-center">
        <h1 className="max-w-[250px] text-xl font-bold">
          {chartTitle === "Data Overview" ? t.dataOverview : chartTitle}
        </h1>
        <div className="flex w-full justify-between gap-4 md:w-fit">
          {filteredSeries.length > 0 && (
            <div className="flex items-center gap-4">
              {showCards && filteredSeries.length > 0 && (
                <div className="flex space-x-4 rtl:space-x-reverse">
                  {filteredSeries.map((s) => (
                    <div key={s.name[locale]} className="flex items-center">
                      <div
                        className={`h-4 w-4 rounded-md ${
                          locale === "ar" ? "ml-2" : "mr-2"
                        }`}
                        style={{ backgroundColor: s.color }}
                      ></div>
                      <span className="text-xs">{s.name[locale]}</span>
                    </div>
                  ))}
                </div>
              )}
              {chartDisplayType === "both" && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setChartType("line")}
                    className={`rounded-md p-2 ${
                      chartType === "line" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                    title={t.lineChart}
                  >
                    <LineChart size={16} />
                  </button>
                  <button
                    onClick={() => setChartType("bar")}
                    className={`rounded-md p-2 ${
                      chartType === "bar" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                    title={t.barChart}
                  >
                    <BarChart2 size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className={`appearance-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 leading-tight text-gray-700 focus:outline-none ${
                locale === "ar" ? "pl-4 pr-8" : "pl-4 pr-8"
              }`}
            >
              <option value="Yearly">{t.yearly}</option>
              <option value="Monthly">{t.monthly}</option>
              <option value="Weekly">{t.weekly}</option>
            </select>
            <div
              className={`pointer-events-none absolute inset-y-0 flex items-center px-2 text-gray-700 ${
                locale === "ar" ? "left-0" : "right-0"
              }`}
            >
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {showCards && cards.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-6 text-sm text-secondary">{getOverviewTitle()}</h2>

          <div className="flex flex-col justify-center gap-4 md:flex-row">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title.en}
                  onClick={() => setSelectedSeries(card.title.en)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 shadow-sm transition ${
                    selectedSeries === card.title.en
                      ? "border-gray-400"
                      : "border-gray-100"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      selectedSeries === card.title.en
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-secondary"
                    }`}
                    style={{
                      backgroundColor:
                        selectedSeries === card.title.en
                          ? card.color
                          : undefined,
                    }}
                  >
                    {Icon && <Icon size={15} />}
                  </div>
                  <div>
                    <span className="mb-2 text-xs text-secondary">
                      {card.title[locale]}
                    </span>
                    <p className="font-semibold">{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Chart content */}
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
              series={getApexSeries()}
              type={chartType}
              height="100%"
              width="100%"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center text-gray-500"
              style={{
                fontFamily:
                  locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
              }}
            >
              {t.noData}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenericChart;
