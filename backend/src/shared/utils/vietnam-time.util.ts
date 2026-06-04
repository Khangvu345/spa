import { BUSINESS_TIME_ZONE_OFFSET_MINUTES } from '../constants/business-rules';

const OFFSET_MS = BUSINESS_TIME_ZONE_OFFSET_MINUTES * 60 * 1000;

export interface VietnamDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export function getVietnamDateTimeParts(date: Date): VietnamDateTimeParts {
  const shifted = new Date(date.getTime() + OFFSET_MS);

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    millisecond: shifted.getUTCMilliseconds(),
  };
}

export function createVietnamDateTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond) -
      OFFSET_MS,
  );
}

export function parseVietnamDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const result = createVietnamDateTime(year, month, day);
  const parts = getVietnamDateTimeParts(result);

  if (parts.year !== year || parts.month !== month || parts.day !== day) {
    return null;
  }

  return result;
}

export function parseVietnamDateTime(value: string): Date | null {
  const hasExplicitOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  if (hasExplicitOffset) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(
      value,
    );
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] ? Number(match[6]) : 0;
  const millisecond = match[7] ? Number(match[7].padEnd(3, '0')) : 0;
  const result = createVietnamDateTime(
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
  );
  const parts = getVietnamDateTimeParts(result);

  if (
    parts.year !== year ||
    parts.month !== month ||
    parts.day !== day ||
    parts.hour !== hour ||
    parts.minute !== minute ||
    parts.second !== second ||
    parts.millisecond !== millisecond
  ) {
    return null;
  }

  return result;
}

export function addVietnamDays(date: Date, days: number): Date {
  const parts = getVietnamDateTimeParts(date);

  return createVietnamDateTime(
    parts.year,
    parts.month,
    parts.day + days,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
}

export function formatVietnamDateKey(date: Date): string {
  const parts = getVietnamDateTimeParts(date);

  return [
    parts.year,
    String(parts.month).padStart(2, '0'),
    String(parts.day).padStart(2, '0'),
  ].join('-');
}

export function formatVietnamTime(date: Date): string {
  const parts = getVietnamDateTimeParts(date);

  return [
    String(parts.hour).padStart(2, '0'),
    String(parts.minute).padStart(2, '0'),
  ].join(':');
}
