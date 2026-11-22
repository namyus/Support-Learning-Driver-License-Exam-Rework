import MemberLayout from '../member-layout/memberLayout';
import MemberRegisteredCourse from '../../organisms/member-registered-course/memberRegisteredCourse';

function MemberRegisteredCourseTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberRegisteredCourse />
      </div>
    </MemberLayout>
  );
}

export default MemberRegisteredCourseTemplate;
