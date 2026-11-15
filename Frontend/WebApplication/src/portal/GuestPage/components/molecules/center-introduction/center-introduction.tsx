import './center-introduction.scss'
import CenterImg from '../../../../../../assets/imgs/about/trungtam-img.jpg'

function AboutCenter() {
    return (
        <div className='introduction-container' id='center-introduction'>
            <div className='relative img-container'>
                <img
                    src={CenterImg}
                    alt='Trung tâm dạy lái xe B2 FDriving'
                    className='center-img'
                />
                <div className='gh-hero-overlay'>
                    <div className='gh-hero-content'>
                        <h1 className='introduction-title'>Trung tâm dạy lái xe B2 FDriving</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutCenter