import React from 'react';
import { Link } from 'react-router-dom';
import FooterBottom from './FooterBottom';

import footerLogo1 from '../../../assets/img/logo/logo.png';
import postImg1 from '../../../assets/img/blog/post1.jpg';
import postImg2 from '../../../assets/img/blog/post2.jpg';

const Footer = (props) => {
    const { footerLogo, footerClass, footerTopClass } = props;
    return (
        <footer className={footerClass ? footerClass : 'rs-footer'}>
            <div className={`footer-top ${footerTopClass}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-md-12 col-sm-12 footer-widget md-mb-50">
                                  <div className="col-lg-3 col-md-12 col-sm-12 footer-widget md-mb-50">
                            <ul className="footer_social" style={{ display: 'flex', gap: '12px', padding: '0', marginTop: '20px' }}>
                                <li>
                                    <a href="#" style={{ display: 'inline-block', width: '36px', height: '36px', lineHeight: '36px', textAlign: 'center', background: '#3b5998', borderRadius: '50%', color: 'white' }}>
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" style={{ display: 'inline-block', width: '36px', height: '36px', lineHeight: '36px', textAlign: 'center', background: '#1da1f2', borderRadius: '50%', color: 'white' }}>
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" style={{ display: 'inline-block', width: '36px', height: '36px', lineHeight: '36px', textAlign: 'center', background: '#0077b5', borderRadius: '50%', color: 'white' }}>
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" style={{ display: 'inline-block', width: '36px', height: '36px', lineHeight: '36px', textAlign: 'center', background: '#e4405f', borderRadius: '50%', color: 'white' }}>
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        </div>
                        <div className="col-lg-3 col-md-12 col-sm-12 footer-widget md-mb-50">
                            <h3 className="widget-title">Address</h3>
                            <ul className="address-widget">
                                <li>
                                    <i className="flaticon-location"></i>
                                    <div className="desc">Cité Erriadh - B.P 135</div>
                                </li>
                                <li>
                                    <i className="flaticon-call"></i>
                                    <div className="desc"><a href="tel:(+880)155-69569"> +216 73 307 960/73 307 961</a></div>
                                     <div className="desc"><a href="tel:(+880)155-69569"> </a></div>

                                </li>
                                <li>
                                    <i className="flaticon-email"></i>
                                    <div className="desc"><a href="mailto:support@rstheme.com"> admin@isetso.rnu.tn</a></div>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-3 col-md-12 col-sm-12 pl-50 md-pl-14 footer-widget md-mb-50">
                            <h3 className="widget-title">Cours</h3>
                            <ul className="site-map">
                                <li><Link to="/course">Cours</Link></li>
                                <li><Link to="/shop/my-account">Profile</Link></li>
                                <li><Link to="/login">Login</Link>/<Link to="/register">Register</Link></li>
                            </ul>
                        </div>
                        <div className="col-lg-3 col-md-12 col-sm-12 footer-widget">
                            <h3 className="widget-title">Articles récents</h3>
                            <div className="recent-post mb-20">
                                <div className="post-img">
                                    <img src={postImg1} alt="blog image" />
                                </div>
                                <div className="post-item">
                                    <div className="post-desc">
                                        <Link to="/blog/single-post-right-sidebar"></Link>
                                    </div> 

                                    <span className="post-date">
                                        <i className="fa fa-calendar-check-o"></i>
                                        
                                    </span>
                                </div>
                            </div>
                            <div className="recent-post mb-20">
                                <div className="post-img">
                                    <img src={postImg2} alt="blog image" />
                                </div>
                                <div className="post-item">
                                    <div className="post-desc">
                                        <Link to="/blog/single-post-right-sidebar"></Link>
                                    </div>
                                    <span className="post-date">
                                        <i className="fa fa-calendar-check-o"></i>
                                      
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterBottom />
        </footer>
    );
}

export default Footer;