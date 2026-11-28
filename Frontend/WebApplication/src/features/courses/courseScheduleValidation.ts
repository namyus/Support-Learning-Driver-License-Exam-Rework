export interface CourseDetailScheduleRow {
  courseContent: string;
  courseTimeStart: string;
  courseTimeEnd: string;
  courseId?: string;
}

export interface CourseDateBounds {
  startDate?: string;
  endDate?: string;
}

export interface SectionValidationResult {
  index: number;
  contentName: string;
  isComplete: boolean;
  isValid: boolean;
  durationDays: number | null;
  requiredStartMin: string | null;
  requiredStartMax: string | null;
  requiredEndMin: string | null;
  requiredEndMax: string | null;
  specialNote: string | null;
  contentError: string | null;
  startDateError: string | null;
  endDateError: string | null;
  errors: string[];
}

export interface CourseScheduleValidationResult {
  isValid: boolean;
  hasCourseBounds: boolean;
  sections: SectionValidationResult[];
  summaryErrors: string[];
}

export const MIN_SECTION_DURATION_DAYS = 7;

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

const PARALLEL_ROAD_CONTENT = 'thực hành trên đường';
const PARALLEL_AUTO_CONTENT = 'thực hành trên xe tự động';

function normalizeVietnamese(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isParallelContentPair(first: string, second: string): boolean {
  const a = normalizeVietnamese(first);
  const b = normalizeVietnamese(second);
  return a === PARALLEL_ROAD_CONTENT && b === PARALLEL_AUTO_CONTENT;
}

export function parseStrictYMDToUtcMs(value?: string | null): number | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const match = ISO_DATE_REGEX.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcMs = Date.UTC(year, month - 1, day);
  const check = new Date(utcMs);

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return utcMs;
}

export function addDaysYMD(ymd: string, days: number): string | null {
  const utcMs = parseStrictYMDToUtcMs(ymd);
  if (utcMs === null) return null;
  const shifted = new Date(utcMs + days * MS_PER_DAY);
  const y = shifted.getUTCFullYear().toString().padStart(4, '0');
  const m = (shifted.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = shifted.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function diffDaysYMD(startYmd: string, endYmd: string): number | null {
  const startMs = parseStrictYMDToUtcMs(startYmd);
  const endMs = parseStrictYMDToUtcMs(endYmd);
  if (startMs === null || endMs === null) return null;
  return Math.round((endMs - startMs) / MS_PER_DAY);
}

export function formatYMDToVN(ymd?: string | null): string {
  const utcMs = parseStrictYMDToUtcMs(ymd);
  if (utcMs === null) return '—';
  const d = new Date(utcMs);
  const day = d.getUTCDate().toString().padStart(2, '0');
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function sectionLabel(index: number, content?: string): string {
  const trimmed = content?.trim();
  return trimmed ? `Học phần ${index + 1} (${trimmed})` : `Học phần ${index + 1}`;
}

/**
 * Validates all course detail sections against the verified DrivingLicense
 * Create Course business rules:
 * 1. Every section requires content, start date, and end date.
 * 2. All section dates must stay within [Course.startDate, Course.endDate].
 * 3. Each section's end date must be >= start date + 7 days (minimum 7-day duration).
 * 4. Learning content names must not be duplicated across sections.
 * 5. Sections must be ordered sequentially: later section startDate > earlier section endDate
 *    (minimum valid startDate = previous section endDate + 1 day),
 *    EXCEPT "Thực Hành Trên Đường" followed by "Thực Hành Trên Xe Tự Động",
 *    which are permitted to share the same start date.
 */
export function validateCourseSchedule(
  rows: CourseDetailScheduleRow[],
  courseBounds: CourseDateBounds
): CourseScheduleValidationResult {
  const courseStartMs = parseStrictYMDToUtcMs(courseBounds.startDate);
  const courseEndMs = parseStrictYMDToUtcMs(courseBounds.endDate);
  const hasCourseBounds =
    courseStartMs !== null && courseEndMs !== null && courseEndMs >= courseStartMs;

  const courseStartYmd = hasCourseBounds ? courseBounds.startDate!.trim() : null;
  const courseEndYmd = hasCourseBounds ? courseBounds.endDate!.trim() : null;
  const maxStartFromCourseEnd =
    courseEndYmd !== null
      ? addDaysYMD(courseEndYmd, -MIN_SECTION_DURATION_DAYS)
      : null;

  const sections: SectionValidationResult[] = rows.map((row, index) => {
    const contentName = row.courseContent.trim();
    const startMs = parseStrictYMDToUtcMs(row.courseTimeStart);
    const endMs = parseStrictYMDToUtcMs(row.courseTimeEnd);

    let contentError: string | null = null;
    let startDateError: string | null = null;
    let endDateError: string | null = null;
    let specialNote: string | null = null;

    // Determine minimum valid start date from overall course start and preceding sections
    let requiredStartMin: string | null = courseStartYmd;
    let requiredStartMinMs: number | null = courseStartMs;

    if (index > 0) {
      const prevRow = rows[index - 1];
      const prevStartMs = parseStrictYMDToUtcMs(prevRow.courseTimeStart);
      const prevEndMs = parseStrictYMDToUtcMs(prevRow.courseTimeEnd);
      const isParallelWithPrev = isParallelContentPair(
        prevRow.courseContent,
        row.courseContent
      );

      if (isParallelWithPrev) {
        specialNote = `Được phép bắt đầu cùng ngày với ${sectionLabel(index - 1, prevRow.courseContent)}.`;
        if (prevStartMs !== null) {
          if (requiredStartMinMs === null || prevStartMs > requiredStartMinMs) {
            requiredStartMin = prevRow.courseTimeStart.trim();
            requiredStartMinMs = prevStartMs;
          }
        }
      } else if (prevEndMs !== null) {
        const dayAfterPrevEnd = addDaysYMD(prevRow.courseTimeEnd.trim(), 1);
        const dayAfterPrevEndMs =
          dayAfterPrevEnd !== null ? parseStrictYMDToUtcMs(dayAfterPrevEnd) : null;
        if (
          dayAfterPrevEnd !== null &&
          dayAfterPrevEndMs !== null &&
          (requiredStartMinMs === null || dayAfterPrevEndMs > requiredStartMinMs)
        ) {
          requiredStartMin = dayAfterPrevEnd;
          requiredStartMinMs = dayAfterPrevEndMs;
        }
      }
    }

    const baseForEndMin =
      startMs !== null ? row.courseTimeStart.trim() : requiredStartMin;
    const requiredEndMin =
      baseForEndMin !== null
        ? addDaysYMD(baseForEndMin, MIN_SECTION_DURATION_DAYS)
        : null;

    // 1. Content validation (required + duplicate check against earlier rows)
    if (!contentName) {
      contentError = `Vui lòng chọn nội dung đào tạo cho Học phần ${index + 1}.`;
    } else {
      const normCurrent = normalizeVietnamese(contentName);
      for (let prev = 0; prev < index; prev++) {
        if (normalizeVietnamese(rows[prev].courseContent) === normCurrent) {
          contentError = `Nội dung "${contentName}" bị trùng với Học phần ${prev + 1}. Vui lòng chọn nội dung khác.`;
          break;
        }
      }
    }

    // 2. Start date validation
    if (!row.courseTimeStart.trim()) {
      startDateError =
        requiredStartMin !== null
          ? `Vui lòng chọn ngày bắt đầu (tối thiểu từ ${formatYMDToVN(requiredStartMin)}).`
          : `Vui lòng chọn ngày bắt đầu cho Học phần ${index + 1}.`;
    } else if (startMs === null) {
      startDateError = `Ngày bắt đầu của Học phần ${index + 1} không đúng định dạng ngày hợp lệ.`;
    } else {
      if (courseStartMs !== null && startMs < courseStartMs) {
        startDateError = `Ngày bắt đầu phải từ ngày khai giảng (${formatYMDToVN(courseStartYmd)}) trở đi.`;
      } else if (courseEndMs !== null && startMs > courseEndMs) {
        startDateError = `Ngày bắt đầu không được vượt quá ngày bế giảng (${formatYMDToVN(courseEndYmd)}).`;
      } else {
        // Check ordering against every earlier section i < index
        for (let prev = 0; prev < index; prev++) {
          const prevRow = rows[prev];
          const prevStartMs = parseStrictYMDToUtcMs(prevRow.courseTimeStart);
          const prevEndMs = parseStrictYMDToUtcMs(prevRow.courseTimeEnd);
          const parallelAllowed = isParallelContentPair(
            prevRow.courseContent,
            row.courseContent
          );

          if (prevStartMs !== null && startMs === prevStartMs) {
            if (parallelAllowed) {
              continue;
            }
            const minDate =
              prevEndMs !== null
                ? addDaysYMD(prevRow.courseTimeEnd.trim(), 1)
                : null;
            startDateError =
              minDate !== null
                ? `Ngày bắt đầu trùng với ${sectionLabel(prev, prevRow.courseContent)}. Ngày bắt đầu hợp lệ tối thiểu là ${formatYMDToVN(minDate)}.`
                : `Ngày bắt đầu không được trùng với ${sectionLabel(prev, prevRow.courseContent)}.`;
            break;
          }

          if (!parallelAllowed && prevEndMs !== null && startMs <= prevEndMs) {
            const minDate = addDaysYMD(prevRow.courseTimeEnd.trim(), 1);
            startDateError =
              minDate !== null
                ? `Ngày bắt đầu phải sau ngày kết thúc của ${sectionLabel(prev, prevRow.courseContent)} (${formatYMDToVN(prevRow.courseTimeEnd)}). Ngày hợp lệ tối thiểu là ${formatYMDToVN(minDate)}.`
                : `Ngày bắt đầu phải sau ngày kết thúc của ${sectionLabel(prev, prevRow.courseContent)}.`;
            break;
          }
        }
      }
    }

    // 3. End date validation
    const durationDays =
      startMs !== null && endMs !== null
        ? diffDaysYMD(row.courseTimeStart.trim(), row.courseTimeEnd.trim())
        : null;

    if (!row.courseTimeEnd.trim()) {
      endDateError =
        requiredEndMin !== null
          ? `Vui lòng chọn ngày kết thúc (tối thiểu từ ${formatYMDToVN(requiredEndMin)}).`
          : `Vui lòng chọn ngày kết thúc cho Học phần ${index + 1}.`;
    } else if (endMs === null) {
      endDateError = `Ngày kết thúc của Học phần ${index + 1} không đúng định dạng ngày hợp lệ.`;
    } else if (startMs !== null && endMs < startMs) {
      const minEnd = addDaysYMD(row.courseTimeStart.trim(), MIN_SECTION_DURATION_DAYS);
      endDateError = `Ngày kết thúc không được sớm hơn ngày bắt đầu (${formatYMDToVN(row.courseTimeStart)}). Ngày kết thúc hợp lệ tối thiểu là ${formatYMDToVN(minEnd)}.`;
    } else if (durationDays !== null && durationDays < MIN_SECTION_DURATION_DAYS) {
      const minEnd = addDaysYMD(row.courseTimeStart.trim(), MIN_SECTION_DURATION_DAYS);
      endDateError = `Mỗi học phần phải kéo dài tối thiểu ${MIN_SECTION_DURATION_DAYS} ngày (hiện tại: ${durationDays} ngày). Ngày kết thúc hợp lệ tối thiểu là ${formatYMDToVN(minEnd)}.`;
    } else if (courseEndMs !== null && endMs > courseEndMs) {
      endDateError = `Ngày kết thúc vượt quá ngày bế giảng khoá học (${formatYMDToVN(courseEndYmd)}). Vui lòng chọn ngày từ ${formatYMDToVN(courseEndYmd)} trở về trước.`;
    }

    const errors = [contentError, startDateError, endDateError].filter(
      (msg): msg is string => Boolean(msg)
    );
    const isComplete = Boolean(
      contentName && row.courseTimeStart.trim() && row.courseTimeEnd.trim()
    );

    return {
      index,
      contentName,
      isComplete,
      isValid: errors.length === 0,
      durationDays,
      requiredStartMin,
      requiredStartMax: maxStartFromCourseEnd,
      requiredEndMin,
      requiredEndMax: courseEndYmd,
      specialNote,
      contentError,
      startDateError,
      endDateError,
      errors,
    };
  });

  const summaryErrors: string[] = [];
  if (!hasCourseBounds) {
    summaryErrors.push(
      'Không tìm thấy khung thời gian khai giảng / bế giảng hợp lệ từ Bước 1.'
    );
  }
  for (const s of sections) {
    for (const err of s.errors) {
      summaryErrors.push(`${sectionLabel(s.index, s.contentName)}: ${err}`);
    }
  }

  return {
    isValid: hasCourseBounds && sections.length > 0 && sections.every((s) => s.isValid),
    hasCourseBounds,
    sections,
    summaryErrors,
  };
}
