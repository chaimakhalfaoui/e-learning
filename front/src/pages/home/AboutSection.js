import React, { useState } from 'react';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor'; 
import SectionTitle from '../../components/Common/SectionTitle';

// About Image
import countIcon1 from '../../assets/img/about/style3/icons/1.png';
import countIcon2 from '../../assets/img/about/style3/icons/2.png';
import countIcon3 from '../../assets/img/about/style3/icons/3.png';

const About = () => {

    const [state, setState] = useState(true);

    const counters = [
        {
            countNum: 500,
            countTitle: 'Étudiants Actifs',
            counterPrefix: '+',
            countIcon: countIcon1,
            description: 'Apprenants engagés dans leur formation'
        },
        {
            countNum: 50,
            countTitle: 'Enseignants',
            counterPrefix: '+',
            countIcon: countIcon2,
            description: 'Professeurs et formateurs experts'
        },
        {
            countNum: 150,
            countTitle: 'Cours en Ligne',
            counterPrefix: '+',
            countIcon: countIcon3,
            description: 'Modules et ressources pédagogiques'
        },
        {
            countNum: 95,
            countTitle: 'Taux de Réussite',
            counterPrefix: '%',
            countIcon: countIcon1,
            description: 'Satisfaction et réussite des apprenants'
        }
    ];

    return (
        <div id="rs-about" className="rs-about style3 pt-100 md-pt-70">
            <div className="container">
                <div className="row y-middle">
                    <div className="col-lg-5 md-mb-30">
                        <div className="about-intro">
                            <SectionTitle 
                                sectionClass="sec-title"
                                subtitleClass="sub-title primary"
                                subtitle={<span style={{ color: '#ff5421' }}>À Propos</span>}
                                titleClass="title mb-20"
                                title="ISET Sousse E-Learning"
                                descClass="desc big"
                                description="Notre plateforme e-learning offre une expérience d'apprentissage innovante et interactive. Nous combinons technologie moderne et pédagogie efficace pour permettre aux étudiants, et enseignants de collaborer dans un environnement numérique riche et stimulant."
                            />
                        </div>
                    </div>
                    <div className="col-lg-7 pl-82 md-pl-14">
                        {counters && (
                            <div className="row rs-counter couter-area">
                                {counters.map((counter, num) => (
                                    <div key={num} className="col-md-6 col-lg-6 mb-30">
                                        <div className={`counter-item ${num === 0 ? 'one' : num === 1 ? 'two' : num === 2 ? 'three' : 'four'}`}>
                                            <img className="count-img" src={counter.countIcon} alt={counter.countTitle} />
                                            <h2 className="number rs-count">
                                                <CountUp 
                                                    start={state ? 0 : counter.countNum} 
                                                    end={counter.countNum} 
                                                    duration={10} 
                                                    onEnd={() => setState(false)} 
                                                />
                                                {({ countUpRef, start }) => (
                                                    <VisibilitySensor onChange={start} delayedCall>
                                                        <span ref={countUpRef} />
                                                    </VisibilitySensor>
                                                )}
                                                <span className="counter-prefix">{counter.counterPrefix}</span>
                                            </h2>
                                            <h4 className="title mb-0">{counter.countTitle}</h4>
                                            <p className="counter-desc">{counter.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;