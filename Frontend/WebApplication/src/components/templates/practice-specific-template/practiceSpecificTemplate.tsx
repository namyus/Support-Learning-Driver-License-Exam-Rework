import MemberLayout from '../member-layout/memberLayout';
import MemberPracticeSpecificRegister from '../../organisms/member-practice-specific-register/memberPracticeSpecificRegister';

function PracticeSpecificTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberPracticeSpecificRegister />
      </div>
    </MemberLayout>
  );
}

export default PracticeSpecificTemplate;
