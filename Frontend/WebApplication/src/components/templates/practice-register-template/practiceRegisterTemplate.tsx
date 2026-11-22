import MemberLayout from '../member-layout/memberLayout';
import MemberPracticeListTable from '../../organisms/member-practice-list-table/memberPracticeListTable';

function PracticeRegisterTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberPracticeListTable />
      </div>
    </MemberLayout>
  );
}

export default PracticeRegisterTemplate;
