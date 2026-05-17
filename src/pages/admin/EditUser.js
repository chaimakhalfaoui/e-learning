import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
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

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const EditUser = () => {
    const { idUser, role } = useAuth();
    const { id } = useParams();
    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        age: "",
        telephone: "",
        genre: "",
        role: ""
    });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null); 
    const navigate = useNavigate();

    // Vérification du rôle (seul l'admin peut modifier)
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'admin') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur rôle utilisateur :", error);
                navigate('/404');
            }
        };
        checkAccess();
    }, [role, navigate]);

    // Charger les données existantes de l'utilisateur
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8801/api/users/${id}`);
                setInputs(response.data);
                setErr(null);
            } catch (error) {
                console.error("Erreur récupération utilisateur :", error);
                if (error.response?.status === 404) {
                    setErr("Utilisateur non trouvé");
                } else {
                    setErr("Erreur lors du chargement des données");
                }
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(null);
        
        try {
            await axios.put(`http://localhost:8801/api/users/${id}`, inputs);
            toast.success('Utilisateur modifié avec succès !', { 
                autoClose: 3000,
                position: "top-right"
            });
            setTimeout(() => {
                navigate("/admin/listeusers");
            }, 2000);
        } catch (err) {
            console.error("Erreur lors de la modification:", err);
            const errorMessage = err.response?.data?.message || err.response?.data || "Erreur serveur";
            setErr(errorMessage);
            toast.error(errorMessage, { autoClose: 3000 });
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

    if (loading) {
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
                <SiteBreadcrumb
                    pageTitle="Modifier Utilisateur"
                    pageName="Modifier Utilisateur"
                    breadcrumbsImg={bannerbg}
                />
                <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                    <div className="container text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-3">Chargement des données...</p>
                    </div>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
                <ToastContainer />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>Modifier Utilisateur | ISETSO</title>
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
                pageTitle="Modifier Utilisateur"
                pageName="Modifier Utilisateur"
                breadcrumbsImg={bannerbg}
            />

            <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <button 
                            type="button" 
                            style={backButtonStyle}
                            onClick={() => navigate(-1)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#5a6268"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#6c757d"}
                        >
                            <i className="fas fa-arrow-left"></i> Retour
                        </button>
                    </div>
                    
                    <div style={formContainerStyle}>
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10">
                                <i className="fas fa-users me-2" style={{ color: '#ff5421' }}></i>
                                Modifier Utilisateur
                            </h2>
                            <p className="desc" style={{ color: '#666' }}>
                                Modifiez les informations de l'utilisateur
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
                                            value={inputs.username || ""} 
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
                                            value={inputs.email || ""} 
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
                                            <i className="fas fa-user-tag me-2" style={{ color: '#ff5421' }}></i>
                                            Rôle
                                        </label>
                                        <select 
                                            name="role" 
                                            value={inputs.role || ""} 
                                            onChange={handleChange} 
                                            style={selectStyle}
                                            onFocus={(e) => e.target.style.borderColor = "#ff5421"}
                                            onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                            required
                                        >
                                            <option value="">-- Sélectionner un rôle --</option>
                                            <option value="etudiant">📚 Étudiant</option>
                                            <option value="enseignant">👨‍🏫 Enseignant</option>
                                            <option value="coordinateur">📋 Coordinateur</option>
                                            <option value="admin">👑 Administrateur</option>
                                        </select>
                                    </div>

                                    <div className="form-group col-lg-12 text-center">
                                        <button 
                                            type="submit" 
                                            style={buttonStyle}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = "#e04e1a"}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = "#ff5421"}
                                        >
                                            <i className="fas fa-save me-2"></i>
                                            Enregistrer les modifications
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

            <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" titleClass="title mb-0 white-color" />
            <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
            <ToastContainer position="top-right" />
        </React.Fragment>
    );
}

export default EditUser;