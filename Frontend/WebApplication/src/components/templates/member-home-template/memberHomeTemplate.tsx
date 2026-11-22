import MemberLayout from '../member-layout/memberLayout';
import MemberCenterIntroduction from '../../organisms/member-center-introduction/memberCenterIntroduction';
import MemberCourseSection from '../../organisms/member-course-section/memberCourseSection';
import MemberCenterInformation from '../../organisms/member-center-information/memberCenterInformation';
import MemberNewsSection from '../../organisms/member-news-section/memberNewsSection';

function MemberHomeTemplate() {
  return (
    <MemberLayout headerId="header-nav" footerClassName="home-footer">
      <div className="template">
        <MemberCenterIntroduction />
        <MemberCourseSection />
        <MemberCenterInformation />
        <MemberNewsSection />
      </div>
    </MemberLayout>
  );
}

export default MemberHomeTemplate;
