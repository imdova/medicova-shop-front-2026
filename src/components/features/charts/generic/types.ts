import { LocalizedTitle } from "@/types/language";
import { LucideIcon } from "lucide-react";
import { LanguageType } from "@/util/translations";

export type TimePeriod = "Yearly" | "Monthly" | "Weekly";
export type ChartType = "line" | "bar" | "area";

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

export interface CardData {
  title: LocalizedTitle;
  value: string;
  color: string;
  icon?: LucideIcon;
}

export interface GenericChartProps {
  data: ChartData;
  showCards?: boolean;
  cards?: CardData[];
  chartTitle?: string;
  defaultSelected?: string;
  chartDisplayType?: "line" | "bar" | "both";
  locale?: LanguageType;
}
