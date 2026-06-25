import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from "react-router-dom";
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

// URL de l'API centralisée ici (au lieu d'être répétée dans chaque fonction)
const API_BASE = 'http://isetso-alb-1947778921.us-east-1.elb.amazonaws.com/api/auth';

// Petit utilitaire pour toujours afficher une string dans le toast,
// même si le backend renvoie un objet d'erreur au lieu d'un message simple.
const extractErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    if (typeof data?.message === 'string') return data.message;
    return fallback;
};

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

    // Étape 2 : vérification du code, directement sur cette page
    // (plus besoin de retourner sur /login pour retaper email + mot de passe)
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErr(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(null);

        // Validation des mots de passe
        if (inputs.password !== inputs.confirmPassword) {
            const msg = "Les mots de passe ne correspondent pas.";
            setErr(msg);
            toast.error(msg);
            return;
        }

        // Validation de la longueur du mot de passe
        if (inputs.password.length < 6) {
            const msg = "Le mot de passe doit contenir au moins 6 caractères.";
            setErr(msg);
            toast.error(msg);
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputs.email.trim())) {
            const msg = "Veuillez entrer une adresse email valide.";
            setErr(msg);
            toast.error(msg);
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = inputs;
            registerData.email = registerData.email.trim();
            registerData.role = 'etudiant'; // Rôle par défaut

            const response = await axios.post(`${API_BASE}/register`, registerData);

            if (response.status === 200 || response.status === 201) {
                setUserEmail(registerData.email);
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
            const errorMessage = extractErrorMessage(err, "Une erreur s'est produite lors de l'inscription.");
            setErr(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Vérification du code juste après l'inscription : connexion
    // automatique sans repasser par /login.
    const handleVerify = async (e) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE}/verify-code`, {
                email: userEmail,
                code: verificationCode.trim()
            });

            if (res.data.success) {
                localStorage.setItem('access_token', res.data.token);
                localStorage.setItem('user_role', res.data.role);

                toast.success("Compte vérifié et connecté avec succès !");
                // IMPORTANT : rechargement complet (pas navigate()) pour que
                // le Header relise le token tout de suite.
                window.location.href = "/";
            } else {
                const msg = "Code de vérification invalide.";
                setErr(msg);
                toast.error(msg);
                setLoading(false);
            }
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Code de vérification invalide.');
            setErr(errorMessage);
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const resendCode = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_BASE}/resend-code`, { email: userEmail });
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
        transition: "all 0.3s ease"
    };

    // Étape 2 : saisie du code, directement après l'inscription
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
                    <div className="register-box" style={{ maxWidth: "500px", margin: "0 auto" }}>
                        <div className="sec-title text-center mb-30">
                            <i className="fas fa-shield-alt" style={{ fontSize: "50px", color: "#ff5421", marginBottom: "15px" }}></i>
                            <h2 className="title mb-10">Vérification de l'email</h2>
                            <p style={{ color: '#666' }}>
                                Un code de vérification a été envoyé à <strong>{userEmail}</strong><br />
                                Saisissez-le ci-dessous pour activer et accéder directement à votre compte.
                            </p>
                        </div>

                        <form onSubmit={handleVerify}>
                            <input
                                type="text"
                                name="verificationCode"
                                placeholder="Code de vérification à 6 chiffres"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                style={inputStyle}
                                required
                            />

                            {err && (
                                <p style={{ color: "red", fontSize: "14px", marginTop: "10px", textAlign: "center" }}>
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {err}
                                </p>
                            )}

                            <div className="text-center mt-3">
                                <button type="submit" style={{ ...buttonStyle, width: "100%" }} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin me-2"></i>
                                            Vérification...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check-circle me-2"></i>
                                            Vérifier et accéder à mon compte
                                        </>
                                    )}
                                </button>
                            </div>

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
