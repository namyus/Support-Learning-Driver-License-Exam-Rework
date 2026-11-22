import MemberLayout from '../member-layout/memberLayout';
import MemberPracticeSchedule from '../../organisms/member-practice-schedule/memberPracticeSchedule';

function PracticeScheduleTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberPracticeSchedule />
      </div>
    </MemberLayout>
  );
}

export default PracticeScheduleTemplate;
