import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from '../components/Layout/Header/Header';
import Footer from '../components/Layout/Footer/Footer';
import Newsletter from '../components/Common/Newsletter';
import ScrollToTop from '../components/Common/ScrollTop';
import OffWrap from '../components/Layout/Header/OffWrap';
import SiteBreadcrumb from '../components/Common/Breadcumb';
import SearchModal from '../components/Layout/Header/SearchModal';

// Image
import favIcon from '../assets/img/fav-orange.png';
import Logo from '../assets/img/logo/dark-logo.png';
import footerLogo from '../assets/img/logo/lite-logo.png';

import bannerbg from '../assets/img/breadcrumbs/2.jpg';

const Register = () => {
    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "", 
    });
    const [err, setErr] = useState(null); // Utilisation de setErr pour définir les erreurs

    const navigate = useNavigate();

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Vérifier si les mots de passe correspondent
            if (inputs.password !== inputs.confirmPassword) {
                setErr("Passwords do not match.");
                return;
            }

            const { confirmPassword, ...registerData } = inputs;
        // Effectuer la soumission du formulaire
        await axios.post("http://localhost:8801/api/auth/register", registerData);
            navigate("/login");
        } catch (err) {
            setErr(err.response.data);
        }
    };

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='pages'
                secondParentMenu='others'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='support@website.com'
                Location='374 William S Canning Blvd, MA 2721, USA '
            />

            {/* breadcrumb-area-start */}
            <SiteBreadcrumb
                pageTitle="Register"
                pageName="Register"
                breadcrumbsImg={bannerbg}
            />
            {/* breadcrumb-area-End */}

            {/* Register Start */}
            <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div className="register-box">
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10">Create New Account</h2>
                        </div>
                        <div className="styled-form">
                            <div id="form-messages"></div>
                            <form id="contact-form" onSubmit={handleSubmit}>
                                <div className="row clearfix">
                                    <div className="form-group col-lg-12 mb-25">
                                        <input type="text" id="Name" name="username" value={inputs.username} placeholder="username" onChange={handleChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="email" id="email" name="email" value={inputs.email} placeholder="Email address " onChange={handleChange} required />
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <input type="password" id="puser" name="password" value={inputs.password} placeholder="Password" onChange={handleChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="password" id="Confirm" name="confirmPassword" value={inputs.confirmPassword} placeholder="Confirm Password" onChange={handleChange} required />
                                    </div>
                                    <div className="form-group col-lg-12 col-md-12 col-sm-12">
                                        <div className="row clearfix">
                                            <div className="column col-lg-3 col-md-4 col-sm-12">
                                                <div className="radio-box">
                                                    <input type="radio" name="remember-password" id="type-1" />
                                                </div>
                                            </div>
                                            <div className="column col-lg-3 col-md-4 col-sm-12">
                                                <div className="radio-box">
                                                    <input type="radio" name="remember-password" id="type-2" />
                                                </div>
                                            </div>
                                            <div className="column col-lg-3 col-md-4 col-sm-12">
                                                <div className="radio-box">
                                                    <input type="radio" name="remember-password" id="type-3" />
                                                </div>
                                            </div>
                                            <div className="column col-lg-12 col-md-12 col-sm-12">
                                                <div className="check-box">
                                                    <input type="checkbox" name="remember-password" id="type-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group col-lg-12 col-md-12 col-sm-12 text-center">
                                        <button type="submit"  className="readon register-btn"><span className="txt">Sign Up</span></button>
                                    </div>
                                    {err && <p>{err}</p>}
                                    <div className="form-group col-lg-12 col-md-12 col-sm-12">
                                        <div className="users">Already have an account? <Link to="/login">Sign In</Link></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* Register End */}

            <Newsletter
                sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80"
                titleClass="title mb-0 white-color"
            />

            <Footer
                footerClass="rs-footer home9-style main-home"
                footerLogo={footerLogo}
            />

            {/* scrolltop-start */}
            <ScrollToTop
                scrollClassName="scrollup orange-color"
            />
            {/* scrolltop-end */}

            <SearchModal />
        </React.Fragment>

    );
}


export default Register;