import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from "react-router-dom";
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
import bannerbg from '../assets/img/breadcrumbs/2.jpg';

const Register = () => {
    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        telephone: "",
        genre: ""
    });
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErr(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation des mots de passe
        if (inputs.password !== inputs.confirmPassword) {
            setErr("Les mots de passe ne correspondent pas.");
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        // Validation de la longueur du mot de passe
        if (inputs.password.length < 6) {
            setErr("Le mot de passe doit contenir au moins 6 caractères.");
            toast.error("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputs.email)) {
            setErr("Veuillez entrer une adresse email valide.");
            toast.error("Email invalide");
            return;
        }

        setLoading(true);
        
        try {
            const { confirmPassword, ...registerData } = inputs;
            registerData.role = 'etudiant'; // Rôle par défaut
            
            const response = await axios.post("http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/api/auth/register", registerData);
            
            if (response.status === 200 || response.status === 201) {
                setUserEmail(inputs.email);
                setVerificationSent(true);
                toast.success("Un code de vérification a été envoyé à votre adresse email !");
                
                // Réinitialiser le formulaire
                setInputs({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    age: "",
                    telephone: "",
                    genre: ""
                });
            }
        } catch (err) {
            console.error("Erreur:", err);
            const errorMessage = err.response?.data || "Une erreur s'est produite lors de l'inscription.";
            setErr(errorMessage);
            toast.error(errorMessage);
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
        transition: "all 0.3s ease"
    };

    const selectStyle = {
        width: "100%",
        padding: "12px 15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "14px",
        backgroundColor: "#fff",
        cursor: "pointer"
    };

    const buttonStyle = {
        backgroundColor: "#ff5421",
        color: "white",
        border: "none",
        padding: "12px 30px",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "all 0.3s ease"
    };

    if (verificationSent) {
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
                    <div className="register-box" style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
                        <i className="fas fa-envelope-open-text" style={{ fontSize: "60px", color: "#ff5421", marginBottom: "20px" }}></i>
                        <h2 style={{ marginBottom: "15px" }}>Vérification de l'email</h2>
                        <p style={{ marginBottom: "20px", color: "#666" }}>
                            Un code de vérification a été envoyé à <strong>{userEmail}</strong>.<br />
                            Veuillez vérifier votre boîte de réception et saisir le code sur la page de connexion.
                        </p>
                        <Link to="/login" style={buttonStyle}>
                            <i className="fas fa-arrow-right me-2"></i>
                            Aller à la page de connexion
                        </Link>
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
                <title>Inscription | ISETSO E-Learning</title>
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
                pageTitle="Inscription"
                pageName="Inscription"
                breadcrumbsImg={bannerbg}
            />

            <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div className="register-box" style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10">
                                <i className="fas fa-user-plus me-2" style={{ color: '#ff5421' }}></i>
                                Créer un nouveau compte
                            </h2>
                            <p className="desc" style={{ color: '#666' }}>Inscrivez-vous pour accéder à tous nos cours</p>
                        </div>
                        <div className="styled-form">
                            <form onSubmit={handleSubmit}>
                                <div className="row clearfix">
                                    <div className="form-group col-lg-12 mb-25">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-user me-2" style={{ color: '#ff5421' }}></i>
                                            Nom d'utilisateur
                                        </label>
                                        <input 
                                            type="text" 
                                            name="username" 
                                            value={inputs.username} 
                                            placeholder="Nom d'utilisateur" 
                                            onChange={handleChange} 
                                            style={inputStyle}
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-group col-lg-12 mb-25">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-envelope me-2" style={{ color: '#ff5421' }}></i>
                                            Email
                                        </label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={inputs.email} 
                                            placeholder="Adresse email" 
                                            onChange={handleChange} 
                                            style={inputStyle}
                                            required 
                                        />
                                    </div>

                                    
                                    <div className="form-group col-lg-12 mb-25">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-lock me-2" style={{ color: '#ff5421' }}></i>
                                            Mot de passe
                                        </label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            value={inputs.password} 
                                            placeholder="Mot de passe (min. 6 caractères)" 
                                            onChange={handleChange} 
                                            style={inputStyle}
                                            required 
                                        />
                                    </div>

                                    <div className="form-group col-lg-12 mb-25">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-lock me-2" style={{ color: '#ff5421' }}></i>
                                            Confirmer le mot de passe
                                        </label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword" 
                                            value={inputs.confirmPassword} 
                                            placeholder="Confirmer le mot de passe" 
                                            onChange={handleChange} 
                                            style={inputStyle}
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-group col-lg-12 text-center">
                                        <button 
                                            type="submit" 
                                            style={buttonStyle}
                                            disabled={loading}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = "#e04e1a"}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = "#ff5421"}
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                                    Inscription en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-user-plus me-2"></i>
                                                    S'inscrire
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    {err && (
                                        <div className="col-lg-12 text-center mt-3">
                                            <p style={{ color: "red", fontSize: "14px" }}>
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                {err}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="form-group col-lg-12 text-center mt-3">
                                        <div className="users">
                                            Vous avez déjà un compte ? <Link to="/login" style={{ color: '#ff5421' }}>Se connecter</Link>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
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

export default Register;