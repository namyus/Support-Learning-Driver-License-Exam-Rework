export interface CoursePeriodLike {
  courseMonth?: number;
  courseYear?: number;
  startDate?: string;
}

const ISO_DATE_PREFIX_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Returns the current calendar year and 1-based month in Asia/Ho_Chi_Minh.
 */
export function getCurrentYearMonthInHoChiMinh(now: Date = new Date()): {
  year: number;
  month: number;
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);

  return { year, month };
}

/**
 * Resolves a course's calendar (year, month) from its displayed courseYear/courseMonth
 * or startDate opening date.
 */
export function getCourseYearMonth(course: CoursePeriodLike): {
  year: number;
  month: number;
} | null {
  if (
    typeof course.courseYear === 'number' &&
    Number.isInteger(course.courseYear) &&
    course.courseYear > 0 &&
    typeof course.courseMonth === 'number' &&
    Number.isInteger(course.courseMonth) &&
    course.courseMonth >= 1 &&
    course.courseMonth <= 12
  ) {
    return { year: course.courseYear, month: course.courseMonth };
  }

  if (typeof course.startDate === 'string' && course.startDate.trim().length > 0) {
    const trimmed = course.startDate.trim();
    const match = ISO_DATE_PREFIX_REGEX.exec(trimmed);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      if (year > 0 && month >= 1 && month <= 12) {
        return { year, month };
      }
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return {
        year: parsed.getFullYear(),
        month: parsed.getMonth() + 1,
      };
    }
  }

  return null;
}

/**
 * Filters courses for the HomePage so ONLY courses belonging to the single latest
 * eligible (year, month) <= current (year, month) in Asia/Ho_Chi_Minh are returned.
 *
 * - Excludes courses from any year later than the current year.
 * - Excludes courses from any month later than the current month within the current year.
 * - Among remaining eligible courses, picks the latest available (year, month) and returns
 *   ONLY courses in that exact month/year.
 * - Returns [] if no eligible courses exist (no fallback to future or all historical courses).
 */
export function filterLatestEligibleMonthCourses<T extends CoursePeriodLike>(
  courses: T[],
  now: Date = new Date()
): T[] {
  const { year: currentYear, month: currentMonth } =
    getCurrentYearMonthInHoChiMinh(now);
  const currentKey = currentYear * 12 + currentMonth;

  let latestEligibleKey = -1;
  const eligible: Array<{ course: T; key: number }> = [];

  for (const course of courses) {
    const ym = getCourseYearMonth(course);
    if (!ym) {
      continue;
    }

    const key = ym.year * 12 + ym.month;
    if (key > currentKey) {
      continue;
    }

    eligible.push({ course, key });
    if (key > latestEligibleKey) {
      latestEligibleKey = key;
    }
  }

  if (latestEligibleKey < 0) {
    return [];
  }

  return eligible
    .filter((entry) => entry.key === latestEligibleKey)
    .map((entry) => entry.course);
}
