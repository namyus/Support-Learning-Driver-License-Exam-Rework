import MemberLayout from '../member-layout/memberLayout';
import MemberVerificationForm from '../../organisms/member-verification-form/memberVerificationForm';

function CourseVerificationTemplate() {
  return (
    <MemberLayout footerClassName="course-verification-footer">
      <div className="template">
        <MemberVerificationForm />
      </div>
    </MemberLayout>
  );
}

export default CourseVerificationTemplate;
