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

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const CreateCategorie = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        title: "",
        image: null,
        imageUrl: null
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // Vérification des droits d'accès (admin ou coordinateur)
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'admin' && userRole !== 'coordinateur') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur rôle utilisateur:", error);
                navigate('/404');
            }
        };
        checkAccess();
    }, [role, navigate]);

    // Récupération des catégories existantes
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8801/api/categorie');
                setCategories(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des catégories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            // Vérifier le type de fichier
            if (!selectedImage.type.match('image.*')) {
                toast.error("Veuillez sélectionner une image valide");
                return;
            }
            // Vérifier la taille (max 5MB)
            if (selectedImage.size > 5 * 1024 * 1024) {
                toast.error("L'image ne doit pas dépasser 5MB");
                return;
            }
            const imageUrl = URL.createObjectURL(selectedImage);
            setInputs(prev => ({ ...prev, image: selectedImage, imageUrl: imageUrl }));
        }
    };

    // Nettoyer l'URL de l'image au démontage
    useEffect(() => {
        return () => {
            if (inputs.imageUrl) {
                URL.revokeObjectURL(inputs.imageUrl);
            }
        };
    }, [inputs.imageUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!inputs.title || !inputs.image) {
            toast.error("Veuillez remplir le titre et choisir une image.");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", inputs.title);
            formData.append("image", inputs.image);

            await axios.post("http://localhost:8801/api/categorie", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Catégorie créée avec succès !', {
                position: "top-right",
                autoClose: 3000,
            });

            // Réinitialiser le formulaire
            setInputs({ title: "", image: null, imageUrl: null });
            
            // Recharger la liste des catégories
            const response = await axios.get('http://localhost:8801/api/categorie');
            setCategories(response.data);
            
            // Rediriger après 2 secondes
            setTimeout(() => {
                navigate("/coordinateur/listecategorie");
            }, 2000);
            
        } catch (err) {
            console.error("Erreur:", err);
            const errorMessage = err.response?.data || "Une erreur s'est produite lors de la création de la catégorie.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const imageLabelStyle = {
        cursor: "pointer",
        width: "100%",
        height: "250px",
        background: "#f8f9fa",
        border: "2px dashed #ddd",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginBottom: "20px",
        transition: "all 0.3s ease"
    };

    const imagePreviewStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    };

    const placeholderStyle = {
        textAlign: "center",
        color: "#999"
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "14px",
        transition: "all 0.3s ease",
        marginBottom: "15px"
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
                <title>Créer Catégorie | ISETSO</title>
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='categorie'
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
                pageTitle="Créer Catégorie"
                pageName="Créer Catégorie"
                breadcrumbsImg={bannerbg}
            />

            <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div className="register-box" style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10">
                                <i className="fas fa-tag me-2" style={{ color: '#ff5421' }}></i>
                                Créer une Catégorie
                            </h2>
                            <p className="desc" style={{ color: '#666' }}>
                                Remplissez le formulaire pour créer une nouvelle catégorie
                            </p>
                        </div>
                        
                        <div className="styled-form">
                            <form onSubmit={handleSubmit}>
                                <div className="row clearfix">
                                    {/* Upload d'image */}
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "10px", display: "block" }}>
                                            <i className="fas fa-image me-2" style={{ color: '#ff5421' }}></i>
                                            Image de la catégorie <span style={{ color: '#dc3545' }}>*</span>
                                        </label>
                                        <label htmlFor="image" style={imageLabelStyle}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff5421'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}>
                                            {inputs.imageUrl ? (
                                                <img style={imagePreviewStyle} src={inputs.imageUrl} alt="Aperçu" />
                                            ) : (
                                                <div style={placeholderStyle}>
                                                    <i className="fas fa-cloud-upload-alt fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                                                    <p>Cliquez pour télécharger une image</p>
                                                    <small>PNG, JPG, JPEG (max 5MB)</small>
                                                </div>
                                            )}
                                            <input type="file" id="image" name="image" onChange={handleImageChange} accept="image/*" hidden />
                                        </label>
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-heading me-2" style={{ color: '#ff5421' }}></i>
                                            Nom de la catégorie <span style={{ color: '#dc3545' }}>*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            name="title" 
                                            value={inputs.title} 
                                            placeholder="Ex: Développement Web, Design, Marketing..." 
                                            onChange={handleInputChange} 
                                            style={inputStyle}
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
                                                    Créer la catégorie
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <div className="form-group col-lg-12 text-center mt-3">
                                        <div className="users">
                                            <Link to="/coordinateur/listecategorie" style={{ color: '#ff5421' }}>
                                                <i className="fas fa-list me-2"></i>
                                                Voir toutes les catégories ({categories.length})
                                            </Link>
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
};

export default CreateCategorie;