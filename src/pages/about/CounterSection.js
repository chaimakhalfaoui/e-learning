import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';
import SectionTitle from '../../components/Common/SectionTitle';

// About Image
import countIcon1 from '../../assets/img/about/style3/icons/1.png';
import countIcon2 from '../../assets/img/about/style3/icons/2.png';
import countIcon3 from '../../assets/img/about/style3/icons/3.png';

const AboutCounter = () => {
    const [state, setState] = useState(true);

    const [stats, setStats] = useState({ userCount: 0, teacherCount: 0, courseCount: 0 });

  useEffect(() => {
    axios.get('http://localhost:8801/api/auth/getStatistics')
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error('Une erreur s\'est produite lors de la récupération des statistiques :', error);
      });
  }, []);
    const counters = [
        {
            countNum: stats.userCount,
            countTitle: 'Users',
            counterPrefix: '',
            countIcon: countIcon1,
            vr: '/admin/edu'
        },
        {
            countNum: stats.teacherCount,
            countTitle: 'Average CGPA',
            counterPrefix: '',
            countIcon: countIcon2,
            vr: '/admin/ens'
        },
        {
            countNum: stats.courseCount,
            countTitle: 'Graduates',
            counterPrefix: '',
            countIcon: countIcon3
        }
    ];

    return (
        <div id="rs-about" className="rs-about style3 pt-110 md-pt-70">
            <div className="container">
                <div className="row y-middle">
                    <div className="col-lg-4 lg-pr-0 md-mb-30">
                        <div className="about-intro md-pr-16">
                            <SectionTitle
                                sectionClass="sec-title"
                                subtitleClass="sub-title orange"
                                subtitle="About Us"
                                titleClass="title mb-20"
                                title="The End Result of All True Learning"
                                descClass="desc big"
                                description="The key to success is to appreciate how people learn, understand the thought process that goes into instructional design, what works well, and a range of differen"
                            />
                        </div>
                    </div>
                    <div className="col-lg-8 pl-82 md-pl-14">
                        {counters &&
                            <div className="row rs-counter couter-area">
                                {counters.map((counter, num) => (
                                    
                                    <div key={num} className="col-md-4 sm-mb-30">
                                     
                                        <div  className={`counter-item ${['one', 'two', 'three'][num]}`}>
                                            <img className="count-img" src={counter.countIcon} alt="" />
                                            <h2 className="number rs-count">
                                                <CountUp start={state ? 0 : counter.countNum} end={counter.countNum} duration={10} onEnd={() => setState(false)} />
                                                {({ countUpRef, start }) => (
                                                    <VisibilitySensor onChange={start} delayedCall>
                                                        <span ref={countUpRef} />
                                                    </VisibilitySensor>
                                                )}
                                                <span className="counter-prefix">{counter.counterPrefix}</span>
                                            </h2>
                                           <a href={counter.vr}><h4 className="title mb-0">{counter.countTitle}</h4></a> 
                                        </div>
                                    </div>
                                    
                                ))}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutCounter;