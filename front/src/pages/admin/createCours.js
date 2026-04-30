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

const CreateCours = () => {
    const { idUser, role } = useAuth();
    const currentDate = new Date().toISOString().split('T')[0];
    
    const [inputs, setInputs] = useState({
        titre: "",
        description: "",
        dateCre: currentDate,
        type: "",
        level: "",
        idUse: "",
        image: null,
        imageUrl: null,
        duration: "",
        status: "hidden" // ✅ Par défaut, le cours est caché en attendant validation
    });
    
    const [categories, setCategories] = useState([]);
    const [level, setLevel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingLevels, setLoadingLevels] = useState(true);
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    // Vérification des droits d'accès (enseignant uniquement)
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
            setLoadingCategories(true);
            try {
                const response = await axios.get('process.env.REACT_APP_API_URL/categorie');
                setCategories(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des catégories:", error);
                toast.error("Impossible de charger les catégories");
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Récupération des niveaux
    useEffect(() => {
        const fetchLevel = async () => {
            setLoadingLevels(true);
            try {
                const response = await axios.get('process.env.REACT_APP_API_URL/level');
                setLevel(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des niveaux:", error);
                toast.error("Impossible de charger les niveaux");
            } finally {
                setLoadingLevels(false);
            }
        };
        fetchLevel();
    }, []);

    // Récupération de l'ID utilisateur
    useEffect(() => {
        const fetchId = async () => {
            try {
                const userid = await idUser();
                setInputs(prev => ({ ...prev, idUse: userid }));
            } catch (error) {
                console.error("Erreur lors de la récupération de l'ID:", error);
            }
        };
        fetchId();
    }, [idUser]);

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
            if (inputs.imageUrl) {
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
        
        if (!inputs.image) {
            setErr("Veuillez sélectionner une image pour le cours.");
            setLoading(false);
            toast.error("Veuillez sélectionner une image.");
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
            formData.append('image', inputs.image);
            formData.append('duration', inputs.duration);
            formData.append('status', inputs.status); // ✅ Ajout du statut
            
            const response = await axios.post("process.env.REACT_APP_API_URL/cours/createCours", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const newCourseId = response.data.coursId;
            
            toast.success('Cours créé avec succès ! Il sera visible après validation du coordinateur.', {
                position: "top-right",
                autoClose: 4000,
            });
            
            // Rediriger vers la création des chapitres
            setTimeout(() => {
                navigate(`/admin/createchapitre/${newCourseId}`);
            }, 1500);
            
        } catch (err) {
            console.error("Erreur:", err);
            const errorMessage = err.response?.data || "Une erreur s'est produite lors de la création du cours.";
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

    // Style pour l'alerte de statut
    const statusAlertStyle = {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeeba',
        borderRadius: '8px',
        padding: '12px 15px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>Créer Cours | ISETSO</title>
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
                pageTitle="Créer Cours"
                pageName="Create Course"
                breadcrumbsImg={bannerbg}
            />

            <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    
                    <div className="register-box" style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10">
                                <i className="fas fa-book-open me-2" style={{ color: '#ff5421' }}></i>
                                Créer un Cours
                            </h2>
                            <p className="desc" style={{ color: '#666' }}>
                                Remplissez le formulaire pour créer un nouveau cours
                            </p>
                        </div>
                        
                        {/* ✅ Alerte statut */}
                        <div style={statusAlertStyle}>
                            <i className="fas fa-info-circle" style={{ color: '#856404', fontSize: '20px' }}></i>
                            <div style={{ color: '#856404', fontSize: '14px' }}>
                                <strong>Information :</strong> Le cours sera créé en mode <strong>"Caché"</strong> en attendant la validation par un coordinateur.
                            </div>
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
                                           Pré_requis
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
                                            disabled={loadingCategories}
                                        >
                                            <option value="">-- Sélectionner une catégorie --</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.title || category.nom}
                                                </option>
                                            ))}
                                        </select>
                                        {loadingCategories && <small>Chargement des catégories...</small>}
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-graduation-cap me-2" style={{ color: '#ff5421' }}></i>
                                            Public Cible
                                        </label>
                                        <select 
                                            name="level" 
                                            value={inputs.level} 
                                            onChange={handleInputChange} 
                                            style={selectStyle}
                                            required
                                            disabled={loadingLevels}
                                        >
                                            <option value="">-- Sélectionner un niveau --</option>
                                            {level.map(lev => (
                                                <option key={lev.id} value={lev.id}>
                                                    {lev.title || lev.nom}
                                                </option>
                                            ))}
                                        </select>
                                        {loadingLevels && <small>Chargement des niveaux...</small>}
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-clock me-2" style={{ color: '#ff5421' }}></i>
                                            Charge horaire (en heures)
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
                                    
                                    {/* ✅ Champ statut (lecture seule, modifiable uniquement par admin/coordinateur) */}
                                    <div className="form-group col-lg-12">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-eye-slash me-2" style={{ color: '#ff5421' }}></i>
                                            Statut du cours
                                        </label>
                                        <div style={{ 
                                            backgroundColor: '#f8f9fa', 
                                            padding: '12px 15px', 
                                            borderRadius: '5px',
                                            border: '1px solid #ddd',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <i className="fas fa-lock" style={{ color: '#ff5421' }}></i>
                                            <span style={{ color: '#666' }}>
                                                <strong>Mode caché</strong> - En attente de validation par un coordinateur
                                            </span>
                                        </div>
                                        <input type="hidden" name="status" value="hidden" />
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
                                                    Créer le cours (en attente validation)
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

export default CreateCours;