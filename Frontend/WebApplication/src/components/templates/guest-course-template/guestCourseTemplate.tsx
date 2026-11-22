import { useEffect } from 'react';
import GuestCourseTable from '../../organisms/guest-course-table/guestCourseTable';
import GuestCourseContent from '../../organisms/guest-course-content/guestCourseContent';
import GuestCourseCommitment from '../../organisms/guest-course-commitment/guestCourseCommitment';

function GuestCourseTemplate() {
  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  return (
    <div className="template">
      <GuestCourseTable />
      <GuestCourseContent />
      <GuestCourseCommitment />
    </div>
  );
}

export default GuestCourseTemplate;
