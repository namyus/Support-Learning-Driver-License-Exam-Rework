export interface CoursePeriodLike {
  courseMonth?: number;
  courseYear?: number;
  startDate?: string;
}

const ISO_DATE_PREFIX_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;
const VIETNAM_NOON_UTC_HOUR = 5; // 12:00:00 Asia/Ho_Chi_Minh (UTC+07:00) === 05:00:00 UTC
const MAX_SET_TIMEOUT_MS = 2_147_483_647;

/**
 * Parses a strict YYYY-MM-DD calendar date from startDate without timezone drift.
 * Returns null if missing or not a valid calendar date (e.g. 2026-02-30).
 */
export function parseCourseStartDateYMD(startDate?: string | null): {
  year: number;
  month: number;
  day: number;
} | null {
  if (typeof startDate !== 'string') {
    return null;
  }

  const trimmed = startDate.trim();
  if (!trimmed) {
    return null;
  }

  const match = ISO_DATE_PREFIX_REGEX.exec(trimmed);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year <= 0 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

/**
 * Computes the UTC epoch millisecond timestamp for 12:00:00 PM Asia/Ho_Chi_Minh (UTC+07:00)
 * on the calendar day immediately following Course.startDate.
 *
 * Example:
 * - startDate: 2026-11-27
 * - cutoff:    2026-11-28 12:00:00+07:00 (2026-11-28T05:00:00.000Z)
 */
export function getCourseExpirationCutoffMs(
  startDate?: string | null
): number | null {
  const parsed = parseCourseStartDateYMD(startDate);
  if (!parsed) {
    return null;
  }

  return Date.UTC(
    parsed.year,
    parsed.month - 1,
    parsed.day + 1,
    VIETNAM_NOON_UTC_HOUR,
    0,
    0,
    0
  );
}

/**
 * Returns true if the course is still visible in the public/member course catalog
 * at `now`: strictly before 12:00:00 PM Asia/Ho_Chi_Minh on the day after `startDate`.
 * Missing or invalid start dates return false safely.
 */
export function isCourseCatalogVisible(
  course: CoursePeriodLike,
  now: Date = new Date()
): boolean {
  const cutoffMs = getCourseExpirationCutoffMs(course.startDate);
  if (cutoffMs === null) {
    return false;
  }

  return now.getTime() < cutoffMs;
}

/**
 * Filters an available-course catalog list using the shared Asia/Ho_Chi_Minh
 * 12:00 PM next-day expiration rule. Upcoming courses remain visible; expired
 * or invalid-date courses are excluded.
 */
export function filterAvailableCatalogCourses<T extends CoursePeriodLike>(
  courses: T[],
  now: Date = new Date()
): T[] {
  return courses.filter((course) => isCourseCatalogVisible(course, now));
}

/**
 * Computes the delay in milliseconds until the earliest upcoming course expiration
 * cutoff among `courses` (capped for safe setTimeout scheduling).
 * Returns null if no courses have a future expiration cutoff.
 */
export function getNextCourseExpirationDelayMs(
  courses: CoursePeriodLike[],
  now: Date = new Date()
): number | null {
  const nowMs = now.getTime();
  let earliestRemaining: number | null = null;

  for (const course of courses) {
    const cutoffMs = getCourseExpirationCutoffMs(course.startDate);
    if (cutoffMs === null || cutoffMs <= nowMs) {
      continue;
    }

    const remaining = cutoffMs - nowMs;
    if (earliestRemaining === null || remaining < earliestRemaining) {
      earliestRemaining = remaining;
    }
  }

  if (earliestRemaining === null) {
    return null;
  }

  return Math.min(earliestRemaining, MAX_SET_TIMEOUT_MS);
}
