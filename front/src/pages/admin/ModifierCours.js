import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

const ModifierCours = () => {
    const { id } = useParams();
    const { idUser, role } = useAuth();
    const [inputs, setInputs] = useState({
        titre: "",
        description: "",
        dateCre: "",
        type: "",
        level: "",
        idUse: "",
        image: null,
        duration: "",
        imageUrl: null
    });
    const [categories, setCategories] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    // Vérification des droits d'accès
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'enseignant' && userRole !== 'admin') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur rôle utilisateur:", error);
                navigate('/404');
            }
        };
        checkAccess();
    }, [role, navigate]);

    // Récupération des catégories
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

    // Récupération des niveaux
    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const response = await axios.get('http://localhost:8801/api/level');
                setLevels(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des niveaux:", error);
            }
        };
        fetchLevels();
    }, []);

    // Récupération de l'ID utilisateur
    const fetchId = async () => {
        try {
            const userid = await idUser();
            setInputs(prev => ({ ...prev, idUse: userid }));
        } catch (error) {
            console.error("Erreur lors de la récupération du id:", error);
        }
    };

    // Récupération des données du cours
    const fetchCourseData = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get(`http://localhost:8801/api/cours/getCourse/${id}`);
            const course = response.data[0];
            
            if (course) {
                setInputs(prev => ({
                    ...prev,
                    titre: course.titre || "",
                    description: course.description || "",
                    dateCre: course.dateCre ? new Date(course.dateCre).toISOString().split('T')[0] : "",
                    type: course.type || "",
                    level: course.level || "",
                    duration: course.duration || "",
                    imageUrl: course.image ? `http://localhost:8801/api/image/${course.image}` : null
                }));
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données du cours :", error);
            toast.error("Impossible de charger les données du cours");
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchId();
        fetchCourseData();
    }, [id]);

    // Gestionnaire d'événements pour les champs de texte
    const handleInputChange = (e) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErr(null);
    };

    // Gestionnaire pour l'image
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            if (!selectedImage.type.match('image.*')) {
                toast.error("Veuillez sélectionner une image valide");
                return;
            }
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
            if (inputs.imageUrl && inputs.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(inputs.imageUrl);
            }
        };
    }, [inputs.imageUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr(null);
        
        // Validation des champs
        if (!inputs.titre || !inputs.description || !inputs.type || !inputs.level) {
            setErr("Veuillez remplir tous les champs obligatoires.");
            setLoading(false);
            toast.error("Veuillez remplir tous les champs obligatoires.");
            return;
        }
        
        if (!inputs.duration || inputs.duration <= 0) {
            setErr("Veuillez entrer une durée valide.");
            setLoading(false);
            toast.error("Veuillez entrer une durée valide.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('description', inputs.description);
            formData.append('dateCre', inputs.dateCre);
            formData.append('type', inputs.type);
            formData.append('level', inputs.level);
            formData.append('id_user', inputs.idUse);
            formData.append('duration', inputs.duration);
            
            if (inputs.image) {
                formData.append('image', inputs.image);
            }

            await axios.put(`http://localhost:8801/api/cours/updateCours/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            toast.success('Cours modifié avec succès !', {
                position: "top-right",
                autoClose: 3000,
            });

            setTimeout(() => {
                navigate("/admin/mycours");
            }, 2000);
            
        } catch (err) {
            console.error("Erreur:", err);
            const errorMessage = err.response?.data || "Une erreur s'est produite lors de la modification du cours.";
            setErr(errorMessage);
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
        marginBottom: "20px"
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

    const selectStyle = {
        width: "100%",
        padding: "12px 15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "14px",
        backgroundColor: "#fff",
        cursor: "pointer",
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

    if (loadingData) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header
                    parentMenu='course'
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
                <SiteBreadcrumb pageTitle="Modifier Cours" pageName="Modifier Cours" breadcrumbsImg={bannerbg} />
                <div className="container pt-100 pb-100 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des données...</p>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>Modifier Cours | ISETSO</title>
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='course'
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
                pageTitle="Modifier Cours"
                pageName="Modifier Cours"
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
                    
                    <div className="register-box" style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10">
                                <i className="fas fa-edit me-2" style={{ color: '#ff5421' }}></i>
                                Modifier le Cours
                            </h2>
                            <p className="desc" style={{ color: '#666' }}>
                                Modifiez les informations du cours
                            </p>
                        </div>
                        
                        <div className="styled-form">
                            <form onSubmit={handleSubmit}>
                                <div className="row clearfix">
                                    {/* Upload d'image */}
                                    <div className="form-group col-lg-12">
                                        <label htmlFor="image" style={imageLabelStyle}>
                                            {inputs.imageUrl ? (
                                                <img style={imagePreviewStyle} src={inputs.imageUrl} alt="Aperçu" />
                                            ) : (
                                                <div style={placeholderStyle}>
                                                    <i className="fas fa-cloud-upload-alt fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                                                    <p>Cliquez pour changer l'image</p>
                                                    <small>PNG, JPG, JPEG (max 5MB)</small>
                                                </div>
                                            )}
                                            <input type="file" id="image" name="image" onChange={handleImageChange} accept="image/*" hidden />
                                        </label>
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-heading me-2" style={{ color: '#ff5421' }}></i>
                                            Titre du cours
                                        </label>
                                        <input 
                                            type="text" 
                                            name="titre" 
                                            value={inputs.titre} 
                                            placeholder="Titre du cours" 
                                            onChange={handleInputChange} 
                                            style={inputStyle}
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-align-left me-2" style={{ color: '#ff5421' }}></i>
                                            Description
                                        </label>
                                        <textarea 
                                            name="description" 
                                            value={inputs.description} 
                                            placeholder="Description du cours" 
                                            onChange={handleInputChange} 
                                            style={{...inputStyle, minHeight: "100px"}}
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-tag me-2" style={{ color: '#ff5421' }}></i>
                                            Catégorie
                                        </label>
                                        <select 
                                            name="type" 
                                            value={inputs.type} 
                                            onChange={handleInputChange} 
                                            style={selectStyle}
                                            required
                                        >
                                            <option value="">-- Sélectionner une catégorie --</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.title || category.nom}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-graduation-cap me-2" style={{ color: '#ff5421' }}></i>
                                            Niveau / Filière
                                        </label>
                                        <select 
                                            name="level" 
                                            value={inputs.level} 
                                            onChange={handleInputChange} 
                                            style={selectStyle}
                                            required
                                        >
                                            <option value="">-- Sélectionner un niveau --</option>
                                            {levels.map(level => (
                                                <option key={level.id} value={level.id}>
                                                    {level.title || level.nom}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-clock me-2" style={{ color: '#ff5421' }}></i>
                                            Durée (en heures)
                                        </label>
                                        <input 
                                            type="number" 
                                            id="duration" 
                                            name="duration" 
                                            value={inputs.duration} 
                                            placeholder="Durée en heures" 
                                            onChange={handleInputChange} 
                                            style={inputStyle}
                                            min="1"
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
                                                    Modification en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Enregistrer les modifications
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
                                            <Link to="/admin/mycours" style={{ color: '#ff5421' }}>
                                                <i className="fas fa-list me-2"></i>
                                                Voir tous les cours
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
}

export default ModifierCours;