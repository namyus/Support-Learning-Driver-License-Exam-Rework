import { useEffect, useState } from 'react';
import {
  getNextCourseExpirationDelayMs,
  type CoursePeriodLike,
} from './courseHomeFilter';

/**
 * Tracks the current time for course catalog expiration filtering.
 * Automatically re-evaluates right at the next course cutoff boundary (12:00 PM Asia/Ho_Chi_Minh
 * on the day after startDate) and whenever the user returns to an already-open tab.
 */
export function useCourseCatalogNow(courses: CoursePeriodLike[]): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const refreshNow = () => {
      setNow(new Date());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshNow();
      }
    };

    window.addEventListener('focus', refreshNow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const delayMs = getNextCourseExpirationDelayMs(courses, now);
    const timerId =
      delayMs !== null ? window.setTimeout(refreshNow, delayMs + 50) : null;

    return () => {
      window.removeEventListener('focus', refreshNow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [courses, now]);

  return now;
}
