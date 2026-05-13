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

const ModifierEvent = () => {
    const { id } = useParams();
    const { idUser, role } = useAuth();
    const [inputs, setInputs] = useState({
        titre: "",
        description: "",
        ville: "",
        categorie: "",
        datedebut: "",
        heuredebut: "",
        datefin: "",
        heurefin: "",
        image: null,
        imageUrl: ""
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    // Vérification des droits d'accès
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'coordinateur' && userRole !== 'admin') {
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
                const response = await axios.get("http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/categorie");
                setCategories(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des catégories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Récupération des données de l'événement
    useEffect(() => {
        const fetchEventData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/event/getEventById/${id}`);
                const eventData = response.data;

                setInputs({
                    titre: eventData.titre || "",
                    description: eventData.description || "",
                    ville: eventData.ville || "",
                    categorie: eventData.categorie || "",
                    datedebut: eventData.datedebut ? eventData.datedebut.split('T')[0] : "",
                    heuredebut: eventData.heuredebut || "",
                    datefin: eventData.datefin ? eventData.datefin.split('T')[0] : "",
                    heurefin: eventData.heurefin || "",
                    image: null,
                    imageUrl: `http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/image/${eventData.image}`
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
                toast.error("Impossible de charger les données de l'événement");
            } finally {
                setLoadingData(false);
            }
        };

        if (id) {
            fetchEventData();
        }
    }, [id]);

    const handleInputChange = (e) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErr(null);
    };

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
        if (!inputs.titre || !inputs.description || !inputs.ville || !inputs.categorie) {
            setErr("Veuillez remplir tous les champs obligatoires.");
            setLoading(false);
            toast.error("Veuillez remplir tous les champs obligatoires.");
            return;
        }
        
        if (!inputs.datedebut || !inputs.datefin) {
            setErr("Veuillez sélectionner les dates de début et de fin.");
            setLoading(false);
            toast.error("Veuillez sélectionner les dates.");
            return;
        }
        
        if (new Date(inputs.datedebut) > new Date(inputs.datefin)) {
            setErr("La date de début doit être antérieure à la date de fin.");
            setLoading(false);
            toast.error("La date de début doit être antérieure à la date de fin.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('description', inputs.description);
            formData.append('ville', inputs.ville);
            formData.append('categorie', inputs.categorie);
            formData.append('datedebut', inputs.datedebut);
            formData.append('heuredebut', inputs.heuredebut || "00:00");
            formData.append('datefin', inputs.datefin);
            formData.append('heurefin', inputs.heurefin || "23:59");
            
            if (inputs.image) {
                formData.append('image', inputs.image);
            }

            await axios.put(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/event/updateEvent/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            toast.success('Événement modifié avec succès !', {
                position: "top-right",
                autoClose: 3000,
            });

            setTimeout(() => {
                navigate("/admin/myevent");
            }, 2000);
            
        } catch (err) {
            console.error("Erreur:", err);
            const errorMessage = err.response?.data || "Une erreur s'est produite lors de la modification de l'événement.";
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

    if (loadingData) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header
                    parentMenu='event'
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
                <SiteBreadcrumb pageTitle="Modifier Événement" pageName="Modifier Événement" breadcrumbsImg={bannerbg} />
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
                <title>Modifier Événement | ISETSO</title>
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='event'
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
                pageTitle="Modifier Événement"
                pageName="Modifier Événement"
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
                                <i className="fas fa-calendar-edit me-2" style={{ color: '#ff5421' }}></i>
                                Modifier l'Événement
                            </h2>
                            <p className="desc" style={{ color: '#666' }}>
                                Modifiez les informations de l'événement
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
                                    
                                    <div className="form-group col-lg-12 mb-25">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-heading me-2" style={{ color: '#ff5421' }}></i>
                                            Titre
                                        </label>
                                        <input 
                                            type="text" 
                                            name="titre" 
                                            value={inputs.titre} 
                                            placeholder="Titre de l'événement" 
                                            onChange={handleInputChange} 
                                            style={inputStyle}
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-group col-lg-12 mb-25">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-align-left me-2" style={{ color: '#ff5421' }}></i>
                                            Description
                                        </label>
                                        <textarea 
                                            name="description" 
                                            value={inputs.description} 
                                            placeholder="Description de l'événement" 
                                            onChange={handleInputChange} 
                                            style={{...inputStyle, minHeight: "100px"}}
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-group col-lg-12 mb-25">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-map-marker-alt me-2" style={{ color: '#ff5421' }}></i>
                                            Lieu
                                        </label>
                                        <input 
                                            type="text" 
                                            name="ville" 
                                            value={inputs.ville} 
                                            placeholder="Ville / Lieu" 
                                            onChange={handleInputChange} 
                                            style={inputStyle}
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-group col-lg-12 mb-25">
                                        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                            <i className="fas fa-tag me-2" style={{ color: '#ff5421' }}></i>
                                            Catégorie
                                        </label>
                                        <select 
                                            name="categorie" 
                                            value={inputs.categorie} 
                                            onChange={handleInputChange} 
                                            style={selectStyle}
                                            required
                                        >
                                            <option value="">-- Sélectionner une catégorie --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.title || cat.nom}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="form-group mb-25">
                                                <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                                    <i className="fas fa-calendar-day me-2" style={{ color: '#ff5421' }}></i>
                                                    Date de début
                                                </label>
                                                <input 
                                                    type="date" 
                                                    name="datedebut" 
                                                    value={inputs.datedebut} 
                                                    onChange={handleInputChange} 
                                                    style={inputStyle}
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group mb-25">
                                                <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                                    <i className="fas fa-clock me-2" style={{ color: '#ff5421' }}></i>
                                                    Heure de début
                                                </label>
                                                <input 
                                                    type="time" 
                                                    name="heuredebut" 
                                                    value={inputs.heuredebut} 
                                                    onChange={handleInputChange} 
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="form-group mb-25">
                                                <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                                    <i className="fas fa-calendar-day me-2" style={{ color: '#ff5421' }}></i>
                                                    Date de fin
                                                </label>
                                                <input 
                                                    type="date" 
                                                    name="datefin" 
                                                    value={inputs.datefin} 
                                                    onChange={handleInputChange} 
                                                    style={inputStyle}
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group mb-25">
                                                <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                                                    <i className="fas fa-clock me-2" style={{ color: '#ff5421' }}></i>
                                                    Heure de fin
                                                </label>
                                                <input 
                                                    type="time" 
                                                    name="heurefin" 
                                                    value={inputs.heurefin} 
                                                    onChange={handleInputChange} 
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
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
                                            <Link to="/admin/myevent" style={{ color: '#ff5421' }}>
                                                <i className="fas fa-list me-2"></i>
                                                Voir tous les événements
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

export default ModifierEvent;