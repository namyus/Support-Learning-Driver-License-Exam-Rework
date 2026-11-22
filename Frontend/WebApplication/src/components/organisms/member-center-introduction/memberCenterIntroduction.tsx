import './member-center-introduction.scss';
import CenterImg from '../../../../assets/imgs/about/trungtam-img.jpg';

function AboutCenter() {
  return (
    <div className="introduction-container mh-hero-section" id="center-introduction">
      <div className="relative img-container">
        <img
          src={CenterImg}
          alt="Trung tâm dạy lái xe FDriving"
          className="center-img"
        />
        <div className="mh-hero-overlay">
          <div className="mh-hero-content">
            <h1 className="introduction-title">Trung tâm dạy lái xe FDriving</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutCenter;
