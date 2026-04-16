import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SectionTitle from '../../components/Common/SectionTitle';

// About Image
import countIcon1 from '../../assets/img/about/style3/icons/1.png';
import countIcon2 from '../../assets/img/about/style3/icons/2.png';
import countIcon3 from '../../assets/img/about/style3/icons/3.png';

const AboutCounter = () => {
    const [stats, setStats] = useState({ 
        userCount: 0, teacherCount: 0, courseCount: 0 
    });
    const [loading, setLoading] = useState(true);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get('http://localhost:8801/api/auth/getStatistics');
                setStats({
                    userCount: response.data.userCount || 0,
                    teacherCount: response.data.teacherCount || 0,
                    courseCount: response.data.courseCount || 0
                });
            } catch (error) {
                console.error('Erreur:', error);
                setStats({ userCount: 1250, teacherCount: 48, courseCount: 156 });
            } finally {
                setLoading(false);
            }
        };
        fetchStatistics();
    }, []);

    // Animation simple au scroll
    useEffect(() => {
        const handleScroll = () => {
            const counters = document.querySelectorAll('.counter-number');
            counters.forEach(counter => {
                const rect = counter.getBoundingClientRect();
                if (rect.top < window.innerHeight && !animated) {
                    setAnimated(true);
                }
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [animated]);

    const counters = [
        {
            countNum: stats.userCount,
            countTitle: 'Étudiants Inscrits',
            icon: countIcon1,
            color: '#ff5421',
            link: '/etudiants'
        },
        {
            countNum: stats.teacherCount,
            countTitle: 'Enseignants Experts',
            icon: countIcon2,
            color: '#4facfe',
            link: '/enseignants'
        },
        {
            countNum: stats.courseCount,
            countTitle: 'Cours Disponibles',
            icon: countIcon3,
            color: '#43e97b',
            link: '/courses'
        }
    ];

    if (loading) {
        return (
            <div className="rs-about style3 pt-110 md-pt-70 pb-50">
                <div className="container text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="rs-about" className="rs-about style3 pt-110 md-pt-70 pb-50">
            <div className="container">
                <div className="row y-middle">
                    <div className="col-lg-4 lg-pr-0 md-mb-30">
                        <div className="about-intro md-pr-16">
                            <SectionTitle
                                sectionClass="sec-title"
                                subtitleClass="sub-title orange"
                                subtitle="Notre Plateforme"
                                titleClass="title mb-20"
                                title="ISETSO E-Learning en Chiffres"
                                descClass="desc big"
                                description="Découvrez l'impact de notre plateforme de formation en ligne à travers des chiffres clés qui témoignent de notre engagement pour une éducation de qualité accessible à tous."
                            />
                        </div>
                    </div>
                    <div className="col-lg-8 pl-82 md-pl-14">
                        <div className="row rs-counter couter-area">
                            {counters.map((counter, index) => (
                                <div key={index} className="col-md-4 sm-mb-30">
                                    <div className={`counter-item ${index === 0 ? 'one' : index === 1 ? 'two' : 'three'}`}>
                                        <img className="count-img" src={counter.icon} alt={counter.countTitle} />
                                        <h2 className="number rs-count">
                                            <span className="counter-number">
                                                {animated ? counter.countNum : 0}
                                            </span>
                                            {index !== 1 && <span className="counter-prefix">+</span>}
                                        </h2>
                                        <a href={counter.link} style={{ textDecoration: 'none' }}>
                                            <h4 className="title mb-0" style={{ color: counter.color }}>
                                                {counter.countTitle}
                                            </h4>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutCounter;