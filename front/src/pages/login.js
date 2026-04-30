import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import bannerbg from '../assets/img/breadcrumbs/inner7.jpg';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        verificationCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const { email, password, verificationCode } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const login = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const body = JSON.stringify({ email, password });

            const res = await axios.post('process.env.REACT_APP_API_URL/auth/login', body, config);

            // Vérifier si l'utilisateur doit vérifier son email
            if (res.data.needsVerification) {
                setNeedsVerification(true);
                setUserEmail(email);
                toast.info("Un code de vérification a été envoyé à votre email. Veuillez le saisir pour continuer.");
                setLoading(false);
                return;
            }

            // Si déjà vérifié, connexion directe
            localStorage.setItem('access_token', res.data.token);
            localStorage.setItem('user_role', res.data.role);
            
            toast.success("Connexion réussie !");
            
            
                navigate("/");

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Email ou mot de passe incorrect.';
            setError(errorMessage);
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const verifyCode = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const body = JSON.stringify({ 
                email: userEmail, 
                code: verificationCode 
            });

            const res = await axios.post('process.env.REACT_APP_API_URL/auth/verify-code', body, config);

            if (res.data.success) {
                localStorage.setItem('access_token', res.data.token);
                localStorage.setItem('user_role', res.data.role);
                
                toast.success("Email vérifié avec succès ! Connexion en cours...");
                
             
                    navigate("/");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Code de vérification invalide.';
            setError(errorMessage);
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const resendCode = async () => {
        setLoading(true);
        try {
            await axios.post('process.env.REACT_APP_API_URL/auth/resend-code', { email: userEmail });
            toast.success("Un nouveau code a été envoyé à votre email.");
        } catch (err) {
            toast.error("Erreur lors de l'envoi du code. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const inputStyle = {
        width: "100%",
        padding: "12px 15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "14px",
        marginBottom: "15px",
        transition: "all 0.3s ease"
    };

    const buttonStyle = {
        backgroundColor: "#ff5421",
        color: "white",
        border: "none",
        padding: "12px 30px",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        width: "100%"
    };

    // Affichage du formulaire de vérification
    if (needsVerification) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
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
                    emailAddress='admin@isetso.rnu.tn'
                    Location='Cité Erriadh - B.P 135'
                />

                <div className="container pt-100 pb-100">
                    <div className="register-box" style={{ maxWidth: "500px", margin: "0 auto" }}>
                        <div className="sec-title text-center mb-30">
                            <i className="fas fa-shield-alt" style={{ fontSize: "50px", color: "#ff5421", marginBottom: "15px" }}></i>
                            <h2 className="title mb-10">Vérification de l'email</h2>
                            <p style={{ color: '#666' }}>
                                Un code de vérification a été envoyé à <strong>{userEmail}</strong><br />
                                Veuillez saisir le code ci-dessous pour activer votre compte.
                            </p>
                        </div>
                        
                        <form onSubmit={verifyCode}>
                            <input
                                type="text"
                                name="verificationCode"
                                placeholder="Code de vérification à 6 chiffres"
                                value={verificationCode}
                                onChange={onChange}
                                style={inputStyle}
                                required
                            />
                            
                            {error && (
                                <p style={{ color: "red", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </p>
                            )}
                            
                            <button type="submit" style={buttonStyle} disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin me-2"></i>
                                        Vérification...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check-circle me-2"></i>
                                        Vérifier mon compte
                                    </>
                                )}
                            </button>
                            
                            <div className="text-center mt-3">
                                <button 
                                    type="button" 
                                    onClick={resendCode} 
                                    style={{ background: "none", border: "none", color: "#ff5421", cursor: "pointer" }}
                                    disabled={loading}
                                >
                                    <i className="fas fa-redo-alt me-1"></i>
                                    Renvoyer le code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
                <ToastContainer position="top-right" />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>Connexion | ISETSO E-Learning</title>
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
                emailAddress='admin@isetso.rnu.tn'
                Location='Cité Erriadh - B.P 135'
            />

            <SiteBreadcrumb
                pageTitle="Connexion"
                pageName="Connexion"
                breadcrumbsImg={bannerbg}
            />

            <div className="rs-login pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div className="register-box" style={{ maxWidth: "500px", margin: "0 auto" }}>
                        <div className="sec-title text-center mb-30">
                            <i className="fas fa-sign-in-alt" style={{ fontSize: "50px", color: "#ff5421", marginBottom: "15px" }}></i>
                            <h2 className="title mb-10">Connexion</h2>
                            <p style={{ color: '#666' }}>Connectez-vous pour accéder à votre espace</p>
                        </div>
                        
                        <form onSubmit={login}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Adresse email"
                                value={email}
                                onChange={onChange}
                                style={inputStyle}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={onChange}
                                style={inputStyle}
                                required
                            />
                            
                            {error && (
                                <p style={{ color: "red", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </p>
                            )}
                            
                            <button type="submit" style={buttonStyle} disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin me-2"></i>
                                        Connexion en cours...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        Se connecter
                                    </>
                                )}
                            </button>
                            
                            <div className="text-center mt-4">
                                <p>
                                    Pas encore inscrit ? <Link to="/register" style={{ color: '#ff5421' }}>Créer un compte</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Newsletter
                sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80"
                titleClass="title mb-0 white-color"
            />

            <Footer
                footerClass="rs-footer home9-style main-home"
                footerLogo={footerLogo}
            />

            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
            <ToastContainer position="top-right" />
        </React.Fragment>
    );
}

export default Login;