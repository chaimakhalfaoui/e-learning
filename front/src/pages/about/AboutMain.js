import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ScrollToTop from '../../components/Common/ScrollTop';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import SiteBreadcrumb from '../../components/Common/Breadcumb';

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

// Importation des sections
import Team from './TeamSection';
import Blog from './BlogSection';
import AboutVideo from './VideoSection';
import AboutCounter from './CounterSection';
import Testimonial from './TestimonialSection';

const AboutMain = () => {
    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>À propos | ISETSO E-Learning</title>
                <meta name="description" content="Découvrez ISETSO E-Learning, une plateforme innovante pour la formation en ligne à distance" />
            </Helmet>
            
            <OffWrap />
            <Header
                parentMenu='about'
                secondParentMenu='others'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn'
                Location='Cité Erriadh - B.P 135'
            />

            <SiteBreadcrumb
                pageTitle="À propos de nous"
                pageName="À propos"
                breadcrumbsImg={bannerbg}
            />

            {/* Section Présentation */}
            <div className="about-section pt-100 pb-70 md-pt-80 md-pb-50">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 md-mb-50">
                            <div className="about-img">
                                <img 
                                    src="https://via.placeholder.com/600x400?text=ISETSO+E-Learning" 
                                    alt="À propos ISETSO" 
                                    style={{ width: '100%', borderRadius: '10px' }}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about-content">
                                <div className="sec-title mb-30">
                                    <span className="sub-title" style={{ color: '#ff5421', fontWeight: 'bold' }}>À PROPOS DE NOUS</span>
                                    <h2 className="title" style={{ fontSize: '36px', marginTop: '10px' }}>
                                        Bienvenue sur <span style={{ color: '#ff5421' }}>ISETSO E-Learning</span>
                                    </h2>
                                </div>
                                <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#666' }}>
                                    ISETSO E-Learning est une plateforme innovante dédiée à la formation en ligne. 
                                    Notre mission est de rendre l'éducation accessible à tous, où que vous soyez, 
                                    grâce à des cours de qualité dispensés par des experts.
                                </p>
                                <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#666', marginTop: '15px' }}>
                                    Nous proposons une large gamme de formations dans les domaines de la technologie, 
                                    du développement web, de la data science, du marketing digital et bien plus encore.
                                </p>
                                <div className="about-features mt-40">
                                    <div className="row">
                                        <div className="col-sm-6 mb-30">
                                            <div className="features-item">
                                                <i className="fas fa-chalkboard-user" style={{ fontSize: '30px', color: '#ff5421', marginBottom: '15px' }}></i>
                                                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Cours de qualité</h4>
                                                <p style={{ fontSize: '14px', color: '#666' }}>Formations conçues par des experts</p>
                                            </div>
                                        </div>
                                        <div className="col-sm-6 mb-30">
                                            <div className="features-item">
                                                <i className="fas fa-certificate" style={{ fontSize: '30px', color: '#ff5421', marginBottom: '15px' }}></i>
                                                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Certification</h4>
                                                <p style={{ fontSize: '14px', color: '#666' }}>Attestations reconnues</p>
                                            </div>
                                        </div>
                                        <div className="col-sm-6 mb-30">
                                            <div className="features-item">
                                                <i className="fas fa-clock" style={{ fontSize: '30px', color: '#ff5421', marginBottom: '15px' }}></i>
                                                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Apprentissage flexible</h4>
                                                <p style={{ fontSize: '14px', color: '#666' }}>Étudiez à votre rythme</p>
                                            </div>
                                        </div>
                                        <div className="col-sm-6 mb-30">
                                            <div className="features-item">
                                                <i className="fas fa-headset" style={{ fontSize: '30px', color: '#ff5421', marginBottom: '15px' }}></i>
                                                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Support 24/7</h4>
                                                <p style={{ fontSize: '14px', color: '#666' }}>Assistance permanente</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Link to="/courses" className="readon orange-btn mt-30">
                                    Découvrir nos cours <i className="fas fa-arrow-right ms-2"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Mission et Vision */}
            <div className="mission-section pt-70 pb-70" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 mb-30">
                            <div className="mission-box" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.05)', height: '100%' }}>
                                <i className="fas fa-bullseye" style={{ fontSize: '40px', color: '#ff5421', marginBottom: '20px' }}></i>
                                <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>Notre Mission</h3>
                                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#666' }}>
                                    Démocratiser l'accès à une éducation de qualité en offrant des formations 
                                    en ligne accessibles, flexibles et adaptées aux besoins du marché du travail.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-30">
                            <div className="vision-box" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.05)', height: '100%' }}>
                                <i className="fas fa-eye" style={{ fontSize: '40px', color: '#ff5421', marginBottom: '20px' }}></i>
                                <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>Notre Vision</h3>
                                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#666' }}>
                                    Devenir la plateforme E-learning de référence en Tunisie et en Afrique, 
                                    formant la prochaine génération de leaders et d'innovateurs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Valeurs */}
            <div className="values-section pt-70 pb-70">
                <div className="container">
                    <div className="sec-title text-center mb-50">
                        <span className="sub-title" style={{ color: '#ff5421', fontWeight: 'bold' }}>NOS VALEURS</span>
                        <h2 className="title" style={{ fontSize: '36px', marginTop: '10px' }}>Ce qui nous anime</h2>
                    </div>
                    <div className="row">
                        <div className="col-lg-3 col-md-6 mb-30">
                            <div className="value-item text-center" style={{ padding: '20px' }}>
                                <i className="fas fa-star" style={{ fontSize: '40px', color: '#ff5421', marginBottom: '15px' }}></i>
                                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Excellence</h4>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-30">
                            <div className="value-item text-center" style={{ padding: '20px' }}>
                                <i className="fas fa-hand-holding-heart" style={{ fontSize: '40px', color: '#ff5421', marginBottom: '15px' }}></i>
                                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Intégrité</h4>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-30">
                            <div className="value-item text-center" style={{ padding: '20px' }}>
                                <i className="fas fa-users" style={{ fontSize: '40px', color: '#ff5421', marginBottom: '15px' }}></i>
                                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Collaboration</h4>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-30">
                            <div className="value-item text-center" style={{ padding: '20px' }}>
                                <i className="fas fa-lightbulb" style={{ fontSize: '40px', color: '#ff5421', marginBottom: '15px' }}></i>
                                <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>Innovation</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Compteurs */}
            <AboutCounter />

            {/* Section Vidéo */}
            <AboutVideo />

            {/* Section Équipe */}
            <Team />

            {/* Section Témoignages */}
            <Testimonial />

            {/* Section Blog */}
            <Blog />

            {/* Section Newsletter */}
            <Newsletter
                sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80"
                titleClass="title mb-0 white-color"
            />

            <Footer
                footerClass="rs-footer home9-style main-home"
                footerLogo={footerLogo}
            />

            {/* scrolltop-start */}
            <ScrollToTop scrollClassName="scrollup orange-color" />
            {/* scrolltop-end */}

            <SearchModal />
        </React.Fragment>
    );
};

export default AboutMain;