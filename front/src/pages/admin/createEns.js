import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import SearchModal from '../../components/Layout/Header/SearchModal';
import { useAuth } from '../../context/authContext'; 

// Image
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const CreateEns = () => {
    const { idUser, role } = useAuth();
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
    const navigate = useNavigate();

    // Vérification du rôle (seul l'admin peut créer)
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'admin' && userRole !== 'coordinateur') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur rôle utilisateur :", error);
                navigate('/404');
            }
        };
        checkAccess();
    }, [role, navigate]);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErr(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr(null);

        // Validation des mots de passe
        if (inputs.password !== inputs.confirmPassword) {
            setErr("Les mots de passe ne correspondent pas.");
            setLoading(false);
            toast.error("Les mots de passe ne correspondent pas", { autoClose: 3000 });
            return;
        }

        // Validation de la longueur du mot de passe
        if (inputs.password.length < 6) {
            setErr("Le mot de passe doit contenir au moins 6 caractères.");
            setLoading(false);
            toast.error("Le mot de passe doit contenir au moins 6 caractères", { autoClose: 3000 });
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputs.email)) {
            setErr("Veuillez entrer une adresse email valide.");
            setLoading(false);
            toast.error("Email invalide", { autoClose: 3000 });
            return;
        }

        try {
            const { confirmPassword, ...registerData } = inputs;
            registerData.role = 'enseignant';
            
            await axios.post("process.env.REACT_APP_API_URL/auth/register", registerData);
            
            toast.success('Enseignant créé avec succès !', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
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
            
            // Rediriger après 2 secondes
            setTimeout(() => {
                navigate("/admin/enseignant");
            }, 2000);
            
        } catch (err) {
            console.error("Erreur lors de la création:", err);
            const errorMessage = err.response?.data || "Erreur lors de la création de l'enseignant";
            setErr(errorMessage);
            toast.error(errorMessage, { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // Styles personnalisés
    const formContainerStyle = {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "30px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 0 20px rgba(0,0,0,0.1)"
    };

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

    const backButtonStyle = {
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: "5px",
        cursor: "pointer",
        marginBottom: "20px",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px"
    };

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>Créer Enseignant | ISETSO</title>
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
                pageTitle="Créer Enseignant"
                pageName="Créer Enseignant"
                breadcrumbsImg={bannerbg}
            />

            <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">                    
                    <div style={formContainerStyle}>
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10">
                                <i className="fas fa-chalkboard-user me-2" style={{ color: '#ff5421' }}></i>
                                Créer un Enseignant
                            </h2>
                            <p className="desc" style={{ color: '#666' }}>
                                Remplissez le formulaire pour ajouter un nouvel enseignant
                            </p>
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
                                            onFocus={(e) => e.target.style.borderColor = "#ff5421"}
                                            onBlur={(e) => e.target.style.borderColor = "#ddd"}
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
                                            placeholder="Email" 
                                            onChange={handleChange} 
                                            style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = "#ff5421"}
                                            onBlur={(e) => e.target.style.borderColor = "#ddd"}
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
                                            onFocus={(e) => e.target.style.borderColor = "#ff5421"}
                                            onBlur={(e) => e.target.style.borderColor = "#ddd"}
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
                                            onFocus={(e) => e.target.style.borderColor = "#ff5421"}
                                            onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                            required 
                                        />
                                    </div>

                                    <div className="form-group col-lg-12 text-center">
                                        <button 
                                            type="submit" 
                                            style={buttonStyle}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = "#e04e1a"}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = "#ff5421"}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                                    Création en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Créer l'enseignant
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

export default CreateEns;