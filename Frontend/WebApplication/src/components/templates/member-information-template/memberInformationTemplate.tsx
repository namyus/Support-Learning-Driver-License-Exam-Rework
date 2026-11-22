import MemberLayout from '../member-layout/memberLayout';
import MemberInformationSection from '../../organisms/member-information-section/memberInformationSection';

function MemberInformationTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberInformationSection />
      </div>
    </MemberLayout>
  );
}

export default MemberInformationTemplate;
