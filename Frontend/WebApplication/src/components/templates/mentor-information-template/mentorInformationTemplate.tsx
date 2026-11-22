import MemberLayout from '../member-layout/memberLayout';
import MemberMentorInformation from '../../organisms/member-mentor-information/memberMentorInformation';

function MentorInformationTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberMentorInformation />
      </div>
    </MemberLayout>
  );
}

export default MentorInformationTemplate;
