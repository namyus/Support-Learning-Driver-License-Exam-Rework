import MemberLayout from '../member-layout/memberLayout';
import MemberTheoryTestPaper from '../../organisms/member-theory-test-paper/memberTheoryTestPaper';

function DoTheoryTestTemplate() {
  return (
    <MemberLayout footerClassName="exam-document-footer">
      <MemberTheoryTestPaper />
    </MemberLayout>
  );
}

export default DoTheoryTestTemplate;
