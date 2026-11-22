import './member-center-information.scss';
import CenterInfImg from '../../../../assets/imgs/information/illustrate-img.jpeg';

function Information() {
  return (
    <section
      className="information-container mh-info-section"
      id="center-consultation"
      aria-labelledby="mh-info-heading"
    >
      <div className="box-container mh-info-card">
        <div className="mh-info-media">
          <img
            src={CenterInfImg}
            alt="Học viên thực hành lái xe tại trung tâm FDriving"
            className="mh-info-img"
          />
        </div>
        <div className="center-information-content mh-info-content">
          <h2 id="mh-info-heading" className="mh-info-title">
            Thông tin trung tâm
          </h2>
          <p className="mh-info-text">
            Trung tâm đào tạo lái xe FDRIVING là một trong những trung tâm đào
            tạo - hỗ trợ thi bằng lái xe hơi B2 uy tín nhất tại Hồ Chí Minh.
            Trung tâm cam kết khi các học viên theo học đều am hiểu luật GTĐB,
            tham giao giao thông an toàn sau khi khóa học kết thúc. Bên cạnh
            đó, từng học viên đều nhận được sự quan tâm, săn sóc tận tâm từ
            trung tâm. Khi hoàn thành khóa học, học viên không những am hiểu rõ
            về luật GTĐB, tham gia giao thông an toàn mà còn cảm thấy hài lòng
            về sự tận tâm của trung tâm. Các học viên đã hoàn thành khóa học
            đều có xu hướng giới thiệu bạn bè, người thân, người quen về trung
            tâm.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Information;
