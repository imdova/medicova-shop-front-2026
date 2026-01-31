// utils/dateUtils.ts

// Normalize input (Date | string | number | null) into a Date or null
const normalizeDate = (date: Date | string | number | null): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  return new Date(date);
};

export const formatDate = (
  date: Date | string | number | null,
  formatStr: string = "MMM dd, yyyy",
) => {
  const d = normalizeDate(date);
  if (!d) return "";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const pad = (num: number) => num.toString().padStart(2, "0");

  return formatStr
    .replace(/yyyy/g, d.getFullYear().toString())
    .replace(/yy/g, d.getFullYear().toString().slice(-2))
    .replace(/MMMM/g, months[d.getMonth()])
    .replace(/MMM/g, months[d.getMonth()].slice(0, 3))
    .replace(/MM/g, pad(d.getMonth() + 1))
    .replace(/M/g, (d.getMonth() + 1).toString())
    .replace(/dd/g, pad(d.getDate()))
    .replace(/d/g, d.getDate().toString())
    .replace(/HH/g, pad(d.getHours()))
    .replace(/H/g, d.getHours().toString())
    .replace(/hh/g, pad(d.getHours() % 12 || 12))
    .replace(/h/g, (d.getHours() % 12 || 12).toString())
    .replace(/mm/g, pad(d.getMinutes()))
    .replace(/m/g, d.getMinutes().toString())
    .replace(/ss/g, pad(d.getSeconds()))
    .replace(/s/g, d.getSeconds().toString())
    .replace(/a/g, d.getHours() < 12 ? "am" : "pm")
    .replace(/A/g, d.getHours() < 12 ? "AM" : "PM")
    .replace(/EEEE/g, days[d.getDay()])
    .replace(/E/g, days[d.getDay()].slice(0, 3));
};

export const addDays = (date: Date | string | number | null, days: number) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

export const subDays = (date: Date | string | number | null, days: number) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setDate(result.getDate() - days);
  return result;
};

export const startOfWeek = (
  date: Date | string | number | null,
  firstDayOfWeek: number = 0,
) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  const day = result.getDay();
  const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfWeek = (
  date: Date | string | number | null,
  firstDayOfWeek: number = 0,
) => {
  const start = startOfWeek(date, firstDayOfWeek);
  if (!start) return null;
  const result = new Date(start);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfMonth = (date: Date | string | number | null) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfMonth = (date: Date | string | number | null) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfYear = (date: Date | string | number | null) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfYear = (date: Date | string | number | null) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const isSameDay = (
  date1: Date | string | number | null,
  date2: Date | string | number | null,
) => {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const differenceInDays = (
  date1: Date | string | number | null,
  date2: Date | string | number | null,
) => {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  if (!d1 || !d2) return NaN;
  const timeDiff = d1.getTime() - d2.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

export const addMonths = (
  date: Date | string | number | null,
  months: number,
) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const subMonths = (
  date: Date | string | number | null,
  months: number,
) => {
  const d = normalizeDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setMonth(result.getMonth() - months);
  return result;
};
