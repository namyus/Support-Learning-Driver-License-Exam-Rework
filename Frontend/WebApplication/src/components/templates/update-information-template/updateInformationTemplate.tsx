import MemberLayout from '../member-layout/memberLayout';
import MemberUpdateInformationForm from '../../organisms/member-update-information-form/memberUpdateInformationForm';

function UpdateInformationTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberUpdateInformationForm />
      </div>
    </MemberLayout>
  );
}

export default UpdateInformationTemplate;
