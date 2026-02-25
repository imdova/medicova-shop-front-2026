"use client";

import { useState, useEffect, useRef } from "react";
import {
  formatDate,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  differenceInDays,
  addMonths,
  subMonths,
} from "@/util/dateUtils";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { motion, AnimatePresence } from "framer-motion";

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

type PresetRange = {
  label: string;
  value: () => DateRange;
};

type DateRangeSelectorProps = {
  onDateChange: (range: DateRange) => void;
  initialRange?: DateRange;
  formatString?: string;
  className?: string;
};

import { useTranslations, useLocale } from "next-intl";
import { useMemo } from "react";

const DateRangeSelector = ({
  onDateChange,
  initialRange = { startDate: null, endDate: null },
  formatString = "MMM dd, yyyy",
  className = "",
}: DateRangeSelectorProps) => {
  const locale = useLocale() as LanguageType;
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = useTranslations("dateRange");
  const isRTL = locale === "ar";

  const weekDays = t.raw("weekDays") as string[];
  const monthNames = t.raw("monthNames") as string[];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presetRanges: PresetRange[] = [
    {
      label: t("today"),
      value: () => ({ startDate: new Date(), endDate: new Date() }),
    },
    {
      label: t("yesterday"),
      value: () => ({
        startDate: subDays(new Date(), 1),
        endDate: subDays(new Date(), 1),
      }),
    },
    {
      label: t("last7Days"),
      value: () => ({ startDate: subDays(new Date(), 6), endDate: new Date() }),
    },
    {
      label: t("thisWeek"),
      value: () => ({
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date()),
      }),
    },
    {
      label: t("thisMonth"),
      value: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      }),
    },
    {
      label: t("lastMonth"),
      value: () => ({
        startDate: startOfMonth(subMonths(new Date(), 1)),
        endDate: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
  ];

  const applyPresetRange = (preset: PresetRange) => {
    const newRange = preset.value();
    setDateRange(newRange);
    setIsCustomRange(false);
    setActivePreset(preset.label);
    onDateChange(newRange);
    setShowDropdown(false);
  };

  const formatDateDisplay = () => {
    if (!dateRange.startDate || !dateRange.endDate) return t("selectDateRange");
    if (isSameDay(dateRange.startDate, dateRange.endDate))
      return formatDate(dateRange.startDate, formatString);
    return `${formatDate(dateRange.startDate, "MMM dd")} - ${formatDate(dateRange.endDate, "MMM dd, yyyy")}`;
  };

  const renderCalendar = (
    date: Date | null,
    onChange: (date: Date | null) => void,
    isStart: boolean,
  ) => {
    const viewDate = date || new Date();
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const isSelected =
        (isStart &&
          dateRange.startDate &&
          isSameDay(dateObj, dateRange.startDate)) ||
        (!isStart &&
          dateRange.endDate &&
          isSameDay(dateObj, dateRange.endDate));
      const isInRange =
        dateRange.startDate &&
        dateRange.endDate &&
        dateObj >= dateRange.startDate &&
        dateObj <= dateRange.endDate;

      days.push(
        <button
          key={`day-${day}`}
          onClick={() => {
            onChange(dateObj);
            if (isStart) setShowStartCalendar(false);
            else setShowEndCalendar(false);
            if (isStart && !dateRange.endDate) setShowEndCalendar(true);
          }}
          className={`group relative flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold transition-all ${
            isSelected
              ? "bg-[#31533A] text-white shadow-lg shadow-emerald-900/20"
              : isInRange
                ? "bg-[#31533A]/10 text-[#31533A] hover:bg-[#31533A]/20"
                : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>,
      );
    }

    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xl ring-1 ring-black/5">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => onChange(subMonths(viewDate, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-xs font-black uppercase tracking-wider text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </div>
          <button
            onClick={() => onChange(addMonths(viewDate, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="flex h-9 w-9 items-center justify-center text-[10px] font-black uppercase text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex h-14 w-full min-w-[200px] items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 transition-all hover:border-[#31533A]/20 hover:bg-white sm:w-auto`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#31533A] shadow-sm ring-1 ring-black/5">
            <Calendar size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B39371]">
              {t("selectDateRange")}
            </span>
            <span className="text-[11px] font-bold text-gray-900">
              {formatDateDisplay()}
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute z-50 mt-3 w-80 overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-2xl shadow-slate-200/50 ring-1 ring-black/5 backdrop-blur-xl ${
              isRTL ? "right-0" : "left-0"
            }`}
          >
            <div className="mb-6 grid grid-cols-2 gap-2">
              {presetRanges.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPresetRange(preset)}
                  className={`flex h-10 items-center justify-center rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                    activePreset === preset.label
                      ? "bg-[#31533A] text-white shadow-lg shadow-emerald-900/10"
                      : "bg-slate-50 text-gray-500 hover:bg-slate-100 hover:text-gray-900"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setIsCustomRange(true);
                  setActivePreset(null);
                }}
                className={`col-span-2 flex h-10 items-center justify-center rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  isCustomRange
                    ? "bg-[#B39371] text-white shadow-lg shadow-amber-900/10"
                    : "bg-slate-50 text-gray-500 hover:bg-slate-100 hover:text-gray-900"
                }`}
              >
                {t("customRange")}
              </button>
            </div>

            {isCustomRange && (
              <div className="space-y-4 border-t border-slate-50 pt-4">
                <div className="space-y-2">
                  <span className="px-1 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                    {t("startDateLabel")}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowStartCalendar(!showStartCalendar);
                        setShowEndCalendar(false);
                      }}
                      className="flex h-12 w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-[11px] font-bold text-gray-900 outline-none transition-all hover:bg-white"
                    >
                      {dateRange.startDate
                        ? formatDate(dateRange.startDate, formatString)
                        : t("selectStartDate")}
                    </button>
                    {showStartCalendar && (
                      <div className="absolute left-0 right-0 top-full z-[60] mt-2">
                        {renderCalendar(
                          dateRange.startDate,
                          (date) => {
                            const newRange = { ...dateRange, startDate: date };
                            if (
                              date &&
                              dateRange.endDate &&
                              date > dateRange.endDate
                            )
                              newRange.endDate = date;
                            setDateRange(newRange);
                            onDateChange(newRange);
                          },
                          true,
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="px-1 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                    {t("endDateLabel")}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowEndCalendar(!showEndCalendar);
                        setShowStartCalendar(false);
                      }}
                      className="flex h-12 w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-[11px] font-bold text-gray-900 outline-none transition-all hover:bg-white"
                    >
                      {dateRange.endDate
                        ? formatDate(dateRange.endDate, formatString)
                        : t("selectEndDate")}
                    </button>
                    {showEndCalendar && (
                      <div className="absolute left-0 right-0 top-full z-[60] mt-2">
                        {renderCalendar(
                          dateRange.endDate || dateRange.startDate,
                          (date) => {
                            const newRange = { ...dateRange, endDate: date };
                            if (
                              date &&
                              dateRange.startDate &&
                              date < dateRange.startDate
                            )
                              newRange.startDate = date;
                            setDateRange(newRange);
                            onDateChange(newRange);
                          },
                          false,
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangeSelector;
