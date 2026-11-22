import MemberLayout from '../member-layout/memberLayout';
import MemberExamDocumentUpdate from '../../organisms/member-exam-document-update/memberExamDocumentUpdate';

function ExamDocumentUpdateTemplate() {
  return (
    <MemberLayout footerClassName="exam-document-update-footer">
      <div className="template">
        <MemberExamDocumentUpdate />
      </div>
    </MemberLayout>
  );
}

export default ExamDocumentUpdateTemplate;
