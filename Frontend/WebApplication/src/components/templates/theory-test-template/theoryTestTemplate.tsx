import MemberLayout from '../member-layout/memberLayout';
import MemberTheoryTestContent from '../../organisms/member-theory-test-content/memberTheoryTestContent';

function TheoryTestTemplate() {
  return (
    <MemberLayout>
      <div className="template">
        <MemberTheoryTestContent />
      </div>
    </MemberLayout>
  );
}

export default TheoryTestTemplate;
