import ScrollToTop from '../../../config/scrollToTop';
import MemberLayout from '../member-layout/memberLayout';
import MemberTheorySchedule from '../../organisms/member-theory-schedule/memberTheorySchedule';

function TheoryScheduleTemplate() {
  return (
    <MemberLayout>
      <ScrollToTop />
      <div className="template">
        <MemberTheorySchedule />
      </div>
    </MemberLayout>
  );
}

export default TheoryScheduleTemplate;
