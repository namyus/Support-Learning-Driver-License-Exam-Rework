import MemberLayout from '../member-layout/memberLayout';
import MemberCourseTable from '../../organisms/member-course-table/memberCourseTable';
import MemberCourseContent from '../../organisms/member-course-content/memberCourseContent';
import MemberCourseCommitment from '../../organisms/member-course-commitment/memberCourseCommitment';

function MemberCourseTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberCourseTable />
        <MemberCourseContent />
        <MemberCourseCommitment />
      </div>
    </MemberLayout>
  );
}

export default MemberCourseTemplate;
