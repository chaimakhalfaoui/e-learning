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

import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const API_URL = 'http://isetso-alb-1947778921.us-east-1.elb.amazonaws.com/api';

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
        status: "hidden"
    });
    
    const [categories, setCategories] = useState([]);
    const [level, setLevel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingLevels, setLoadingLevels] = useState(true);
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'enseignant' && userRole !== 'admin') navigate('/404');
            } catch (error) {
                navigate('/404');
            }
        };
        checkAccess();
    }, [role, navigate]);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await axios.get(`${API_URL}/categorie`);
                setCategories(response.data);
            } catch (error) {
                toast.error("Impossible de charger les catégories");
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchLevel = async () => {
            setLoadingLevels(true);
            try {
                const response = await axios.get(`${API_URL}/level`);
                setLevel(response.data);
            } catch (error) {
                toast.error("Impossible de charger les niveaux");
            } finally {
                setLoadingLevels(false);
            }
        };
        fetchLevel();
    }, []);

    useEffect(() => {
        const fetchId = async () => {
            try {
                const userid = await idUser();
                setInputs(prev => ({ ...prev, idUse: userid }));
            } catch (error) {}
        };
        fetchId();
    }, [idUser]);

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

    useEffect(() => {
        return () => {
            if (inputs.imageUrl) URL.revokeObjectURL(inputs.imageUrl);
        };
    }, [inputs.imageUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr(null);
        
        if (!inputs.titre || !inputs.description || !inputs.type || !inputs.level || !inputs.duration || !inputs.image) {
            setErr("Veuillez remplir tous les champs obligatoires.");
            setLoading(false);
            toast.error("Veuillez remplir tous les champs obligatoires.");
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
            formData.append('status', inputs.status);
            
            const response = await axios.post(`${API_URL}/cours/createCours`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const newCourseId = response.data.coursId;
            
            toast.success('Cours créé avec succès ! En attente de validation par le coordinateur.');
            
            setTimeout(() => {
                navigate(`/admin/createchapitre/${newCourseId}`);
            }, 1500);
            
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Une erreur s'est produite.";
            setErr(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
        cursor: "pointer"
    };

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
            <Helmet><link rel="icon" href={favIcon} /><title>Créer Cours | ISETSO</title></Helmet>
            <OffWrap />
            <Header parentMenu='course' secondParentMenu='others' headerNormalLogo={Logo}
                headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable' TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />

            <SiteBreadcrumb pageTitle="Créer Cours" pageName="Create Course" breadcrumbsImg={bannerbg} />

            <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div className="register-box" style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10"><i className="fas fa-book-open me-2" style={{ color: '#ff5421' }}></i>Créer un Cours</h2>
                            <p className="desc" style={{ color: '#666' }}>Remplissez le formulaire pour créer un nouveau cours</p>
                        </div>
                        
                        <div style={statusAlertStyle}>
                            <i className="fas fa-info-circle" style={{ color: '#856404', fontSize: '20px' }}></i>
                            <div style={{ color: '#856404', fontSize: '14px' }}><strong>Information :</strong> Le cours sera créé en mode <strong>"Caché"</strong> en attendant la validation par un coordinateur.</div>
                        </div>
                        
                        <div className="styled-form">
                            <form onSubmit={handleSubmit}>
                                <div className="row clearfix">
                                    <div className="form-group col-lg-12">
                                        <label htmlFor="image" style={imageLabelStyle}>
                                            {inputs.imageUrl ? <img style={imagePreviewStyle} src={inputs.imageUrl} alt="Aperçu" /> :
                                                <div style={placeholderStyle}>
                                                    <i className="fas fa-cloud-upload-alt fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                                                    <p>Cliquez pour télécharger une image</p>
                                                    <small>PNG, JPG, JPEG (max 5MB)</small>
                                                </div>
                                            }
                                            <input type="file" id="image" name="image" onChange={handleImageChange} accept="image/*" hidden />
                                        </label>
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <input type="text" name="titre" value={inputs.titre} placeholder="Titre du cours" onChange={handleInputChange} style={inputStyle} required />
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <textarea name="description" value={inputs.description} placeholder="Description / Pré-requis" onChange={handleInputChange} style={{...inputStyle, minHeight: "100px"}} required />
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <select name="type" value={inputs.type} onChange={handleInputChange} style={selectStyle} required disabled={loadingCategories}>
                                            <option value="">-- Sélectionner une catégorie --</option>
                                            {categories.map(category => (<option key={category.id} value={category.id}>{category.title || category.nom}</option>))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <select name="level" value={inputs.level} onChange={handleInputChange} style={selectStyle} required disabled={loadingLevels}>
                                            <option value="">-- Sélectionner un niveau --</option>
                                            {level.map(lev => (<option key={lev.id} value={lev.id}>{lev.title || lev.nom}</option>))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <input type="number" name="duration" value={inputs.duration} placeholder="Durée (en heures)" onChange={handleInputChange} style={inputStyle} min="1" required />
                                    </div>
                                    
                                    <div className="form-group col-lg-12">
                                        <div style={{ backgroundColor: '#f8f9fa', padding: '12px 15px', borderRadius: '5px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <i className="fas fa-lock" style={{ color: '#ff5421' }}></i>
                                            <span style={{ color: '#666' }}><strong>Mode caché</strong> - En attente de validation par un coordinateur</span>
                                        </div>
                                        <input type="hidden" name="status" value="hidden" />
                                    </div>
                                    
                                    <div className="form-group col-lg-12 text-center">
                                        <button type="submit" style={buttonStyle} disabled={loading}>
                                            {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Création en cours...</> : <><i className="fas fa-save me-2"></i>Créer le cours (en attente validation)</>}
                                        </button>
                                    </div>
                                    
                                    {err && <div className="col-lg-12 text-center mt-3"><p style={{ color: "red", fontSize: "14px" }}><i className="fas fa-exclamation-triangle me-2"></i>{err}</p></div>}
                                    
                                    <div className="form-group col-lg-12 text-center mt-3">
                                        <div className="users"><Link to="/admin/mycours" style={{ color: '#ff5421' }}><i className="fas fa-list me-2"></i>Voir tous mes cours</Link></div>
                                    </div>
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
};

export default CreateCours;