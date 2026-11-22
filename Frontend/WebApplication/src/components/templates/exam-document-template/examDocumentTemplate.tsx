import MemberLayout from '../member-layout/memberLayout';
import MemberExamDocument from '../../organisms/member-exam-document/memberExamDocument';

function ExamDocumentTemplate() {
  return (
    <MemberLayout footerClassName="exam-document-footer">
      <div className="template">
        <MemberExamDocument />
      </div>
    </MemberLayout>
  );
}

export default ExamDocumentTemplate;
