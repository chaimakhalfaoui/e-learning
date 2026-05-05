import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
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
import '../../assets/scss/modal.scss';

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

// FIX: URL de base centralisée pour éviter les incohérences localhost vs AWS
const BASE_URL = 'http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801';

const INITIAL_INPUTS = {
    id: "",
    titre: "",
    categorie: "",
    contenu: "",
    duration: "",
    image: null,
    imageUrl: null,
    video: null,
    videoUrl: null,
    fichier: null,
    fichierUrl: null,
    fichierName: "",
    type_fichier: "",
    description: "",
    ressourceVideo: null,
    ressourceVideoUrl: null
};

const CreateActivite = () => {
    const [openModal, setOpenModal] = useState(false);
    const [openModalRessource, setOpenModalRessource] = useState(false);
    // FIX: renommé isAddingActiv → isAddingActive pour cohérence
    const [isAddingActive, setIsAddingActive] = useState(true);
    const [isAddingRessource, setIsAddingRessource] = useState(true);
    const [openModalText, setOpenModalText] = useState(false);
    const [openModalImage, setOpenModalImage] = useState(false);
    const [openModalVideo, setOpenModalVideo] = useState(false);
    const [openModalRessourceFile, setOpenModalRessourceFile] = useState(false);
    const [openModalRessourceVideo, setOpenModalRessourceVideo] = useState(false);
    const [activite, setActivite] = useState([]);
    const [ressources, setRessources] = useState([]);
    const [activeTab, setActiveTab] = useState('ressources');
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { idUser } = useAuth();
    const [inputs, setInputs] = useState(INITIAL_INPUTS);
    const navigate = useNavigate();

    const [openIndex, setOpenIndex] = useState(null);
    const [openIndexRessource, setOpenIndexRessource] = useState(null);

    const toggleActivite = (index) => setOpenIndex(openIndex === index ? null : index);
    const toggleRessource = (index) => setOpenIndexRessource(openIndexRessource === index ? null : index);

    const handleInputChange = (e) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (!selectedImage) return;
        const imageUrl = URL.createObjectURL(selectedImage);
        setInputs(prev => ({ ...prev, image: selectedImage, imageUrl }));
    };

    const handleVideoChange = (e) => {
        const selectedVideo = e.target.files[0];
        if (!selectedVideo) return;
        const videoUrl = URL.createObjectURL(selectedVideo);
        setInputs(prev => ({ ...prev, video: selectedVideo, videoUrl }));
    };

    const handleRessourceVideoChange = (e) => {
        const selectedVideo = e.target.files[0];
        if (!selectedVideo) return;
        const videoUrl = URL.createObjectURL(selectedVideo);
        setInputs(prev => ({ ...prev, ressourceVideo: selectedVideo, ressourceVideoUrl: videoUrl }));
    };

    const handleFichierChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        const fileUrl = URL.createObjectURL(selectedFile);
        const fileType = selectedFile.type;
        let type_fichier = 'other';

        if (fileType === 'application/pdf') {
            type_fichier = 'pdf';
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileType === 'application/msword') {
            type_fichier = 'word';
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
            fileType === 'application/vnd.ms-powerpoint') {
            type_fichier = 'powerpoint';
        } else if (fileType === 'application/vnd.ms-excel' ||
            fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            type_fichier = 'excel';
        }

        setInputs(prev => ({
            ...prev,
            fichier: selectedFile,
            fichierUrl: fileUrl,
            fichierName: selectedFile.name,
            type_fichier
        }));
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await idUser();
                const response = await axios.get(`${BASE_URL}/api/auth/checkUserRole/${userId}`);
                if (response.data.role !== 'enseignant') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur vérification rôle:", error);
            }
        };
        fetchUserData();
    }, [idUser, navigate]);

    // FIX: useCallback pour stabiliser les références et corriger les dépendances useEffect
    const fetchActivite = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/activite/getAllActiviteId/${id}`);
            setActivite(response.data);
        } catch (error) {
            console.error("Erreur fetchActivite:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchRessources = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/ressource/getAllRessourceId/${id}`);
            setRessources(response.data);
        } catch (error) {
            console.error("Erreur fetchRessources:", error);
        }
    }, [id]);

    // FIX: dépendances correctes grâce à useCallback
    useEffect(() => {
        fetchActivite();
        fetchRessources();
    }, [fetchActivite, fetchRessources]);

    // ==================== ACTIVITÉS ====================
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}/api/activite/createActivite`, {
                titre: inputs.titre,
                categorie: inputs.categorie,
                contenu: inputs.contenu,
                duration: inputs.duration,
                id_chapitre: id
            });
            toast.success('Activité créée avec succès');
            // FIX: reset complet via INITIAL_INPUTS
            setInputs(INITIAL_INPUTS);
            fetchActivite();
            setOpenModalText(false);
            setOpenModal(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur lors de la création');
        }
    };

    const handleSubmitim = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('categorie', inputs.categorie);
            formData.append('image', inputs.image);
            formData.append('duration', inputs.duration);
            formData.append('id_chapitre', id);
            await axios.post(`${BASE_URL}/api/activite/createActivitei`, formData);
            toast.success('Image ajoutée avec succès');
            setInputs(INITIAL_INPUTS);
            fetchActivite();
            setOpenModalImage(false);
            setOpenModal(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur');
        }
    };

    const handleSubmitvi = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('categorie', inputs.categorie);
            formData.append('video', inputs.video);
            formData.append('duration', inputs.duration);
            formData.append('id_chapitre', id);
            await axios.post(`${BASE_URL}/api/activite/createActivitev`, formData);
            toast.success('Vidéo ajoutée avec succès');
            setInputs(INITIAL_INPUTS);
            fetchActivite();
            setOpenModalVideo(false);
            setOpenModal(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur');
        }
    };

    const handleDeleteActivite = async (idActivite) => {
        if (window.confirm("Supprimer cette activité ?")) {
            try {
                await axios.delete(`${BASE_URL}/api/activite/deleteActivite/${idActivite}`);
                toast.success('Activité supprimée');
                fetchActivite();
            } catch (err) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    // ==================== RESSOURCES ====================
    const handleSubmitFichier = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('description', inputs.description || '');
            formData.append('fichier', inputs.fichier);
            formData.append('type_fichier', inputs.type_fichier);
            formData.append('type_ressource', 'fichier');
            formData.append('id_chapitre', id);
            await axios.post(`${BASE_URL}/api/ressource/createRessource`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Fichier ajouté');
            setInputs(INITIAL_INPUTS);
            fetchRessources();
            setOpenModalRessourceFile(false);
            setOpenModalRessource(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur');
        }
    };

    const handleSubmitRessourceVideo = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('description', inputs.description || '');
            formData.append('video', inputs.ressourceVideo);
            formData.append('type_ressource', 'video');
            formData.append('id_chapitre', id);
            await axios.post(`${BASE_URL}/api/ressource/createRessourceVideo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Vidéo ajoutée');
            setInputs(INITIAL_INPUTS);
            fetchRessources();
            setOpenModalRessourceVideo(false);
            setOpenModalRessource(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur');
        }
    };

    const handleDeleteRessource = async (idRessource) => {
        if (window.confirm("Supprimer cette ressource ?")) {
            try {
                await axios.delete(`${BASE_URL}/api/ressource/deleteRessource/${idRessource}`);
                toast.success('Ressource supprimée');
                fetchRessources();
            } catch (err) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleUpdateRessource = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('description', inputs.description || '');
            if (inputs.fichier && typeof inputs.fichier !== 'string') {
                formData.append('fichier', inputs.fichier);
            }
            formData.append('type_fichier', inputs.type_fichier);
            formData.append('id_chapitre', id);
            await axios.put(`${BASE_URL}/api/ressource/updateRessource/${inputs.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Ressource mise à jour');
            fetchRessources();
            closModalRessourceFile();
            setOpenModalRessource(true);
        } catch (err) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    // FIX: cette fonction est maintenant utilisée via le bouton Modifier dans la liste
    const handleUpdateRessourceModal = (ressourceId, titre, description, fichier, type_fichier) => {
        const fileUrl = `${BASE_URL}/api/ressource/fichier/${fichier}`;
        setInputs({
            ...INITIAL_INPUTS,
            id: ressourceId,
            titre,
            description: description || '',
            fichier,
            fichierUrl: fileUrl,
            fichierName: fichier,
            type_fichier
        });
        setIsAddingRessource(false);
        setOpenModalRessourceFile(true);
    };

    // ==================== MODALES ====================
    const modalText = () => {
        setInputs(prev => ({ ...prev, categorie: "text" }));
        setOpenModalText(true);
        setOpenModal(false);
    };

    const modalImage = () => {
        setInputs(prev => ({ ...prev, categorie: "image" }));
        setOpenModalImage(true);
        setOpenModal(false);
    };

    const modalvideo = () => {
        setInputs(prev => ({ ...prev, categorie: "video" }));
        setOpenModalVideo(true);
        setOpenModal(false);
    };

    const openRessourceModal = () => {
        setIsAddingRessource(true);
        setOpenModalRessource(true);
    };

    const modalFichier = () => {
        setOpenModalRessourceFile(true);
        setOpenModalRessource(false);
    };

    const modalRessourceVideo = () => {
        setOpenModalRessourceVideo(true);
        setOpenModalRessource(false);
    };

    const closModalT = () => {
        setIsAddingActive(true);
        setInputs(INITIAL_INPUTS);
        setOpenModalText(false);
    };

    const closModalI = () => {
        setIsAddingActive(true);
        setInputs(INITIAL_INPUTS);
        setOpenModalImage(false);
    };

    const closModalV = () => {
        setIsAddingActive(true);
        setInputs(INITIAL_INPUTS);
        setOpenModalVideo(false);
    };

    const closModalRessourceFile = () => {
        setIsAddingRessource(true);
        setInputs(INITIAL_INPUTS);
        setOpenModalRessourceFile(false);
    };

    const closModalRessourceVideo = () => {
        setInputs(INITIAL_INPUTS);
        setOpenModalRessourceVideo(false);
    };

    const getFileIcon = (type_fichier) => {
        const icons = { pdf: '📄', word: '📝', powerpoint: '📊', excel: '📈', other: '📁' };
        const names = { pdf: 'PDF', word: 'Word', powerpoint: 'PowerPoint', excel: 'Excel', other: 'Fichier' };
        return `${icons[type_fichier] || '📁'} ${names[type_fichier] || 'Fichier'}`;
    };

    // ==================== STYLES ====================
    const styles = {
        container: { padding: '30px 0' },
        tabsHeader: { display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee' },
        tabButton: (isActive) => ({
            padding: '12px 30px', fontSize: '16px', fontWeight: 600, border: 'none',
            background: 'none', cursor: 'pointer', color: isActive ? '#ff5421' : '#666',
            borderBottom: isActive ? '3px solid #ff5421' : 'none', transition: 'all 0.3s ease'
        }),
        card: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
        cardHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        cardTitle: { margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' },
        addButton: { background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' },
        listItem: { padding: '15px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.2s' },
        itemTitle: { fontWeight: 500, color: '#333', marginBottom: '5px' },
        itemMeta: { fontSize: '12px', color: '#999', display: 'flex', gap: '15px' },
        actionButtons: { display: 'flex', gap: '10px' },
        iconButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', transition: 'all 0.2s' },
        detailContent: { padding: '20px', background: '#f9f9f9', margin: '10px 20px 20px 20px', borderRadius: '8px' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' },
        modalHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        modalBody: { padding: '20px' },
        modalFooter: { padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
        categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' },
        categoryItem: { textAlign: 'center', padding: '20px', border: '2px solid #eee', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
        input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '15px' },
        textarea: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', minHeight: '100px', marginBottom: '15px' },
        uploadArea: { border: '2px dashed #ddd', borderRadius: '12px', padding: '30px', textAlign: 'center', cursor: 'pointer', marginBottom: '15px', transition: 'all 0.2s' },
        videoPreview: { maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' },
        cancelBtn: { padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
        submitBtn: { background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
        closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Helmet><link rel="icon" href={favIcon} /></Helmet>
            <OffWrap />
            <Header
                parentMenu='cours' secondParentMenu='others'
                headerNormalLogo={Logo} headerStickyLogo={Logo}
                CanvasLogo={Logo} mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable' TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn' Location='Cité Erriadh - B.P 135'
            />
            <SiteBreadcrumb
                pageTitle="Ressources & Activités"
                pageName="Gestion des contenus"
                breadcrumbsImg={bannerbg}
            />

            <div style={styles.container} className="register-section pt-100 pb-100">
                <div className="container">
                    {/* TABS */}
                    <div style={styles.tabsHeader}>
                        <button onClick={() => setActiveTab('ressources')} style={styles.tabButton(activeTab === 'ressources')}>
                            <i className="fas fa-folder-open me-2"></i>Ressources pédagogiques
                        </button>
                        <button onClick={() => setActiveTab('activites')} style={styles.tabButton(activeTab === 'activites')}>
                            <i className="fas fa-tasks me-2"></i>Activités
                        </button>
                    </div>

                    {/* ==================== RESSOURCES ==================== */}
                    {activeTab === 'ressources' && (
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h4 style={styles.cardTitle}>
                                    <i className="fas fa-folder-open me-2" style={{ color: '#ff5421' }}></i>
                                    Documents et ressources
                                </h4>
                                <button style={styles.addButton} onClick={openRessourceModal}>
                                    <i className="fas fa-plus"></i> Ajouter une ressource
                                </button>
                            </div>
                            <div>
                                {ressources.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                                        <i className="fas fa-folder-open fa-3x mb-3"></i>
                                        <p>Aucune ressource pour le moment</p>
                                    </div>
                                ) : (
                                    ressources.map((item, index) => (
                                        <div key={item.id || index}>
                                            <div style={styles.listItem}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ flex: 1 }} onClick={() => toggleRessource(index)}>
                                                        <div style={styles.itemTitle}>
                                                            {item.type_ressource === 'video'
                                                                ? <i className="fas fa-video me-2" style={{ color: '#ff5421' }}></i>
                                                                : <i className="fas fa-file-alt me-2" style={{ color: '#ff5421' }}></i>
                                                            }
                                                            {item.titre}
                                                        </div>
                                                        <div style={styles.itemMeta}>
                                                            {item.type_ressource === 'video'
                                                                ? <span>🎬 Vidéo</span>
                                                                : <span>{getFileIcon(item.type_fichier)}</span>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div style={styles.actionButtons}>
                                                        <button style={styles.iconButton} onClick={() => toggleRessource(index)} title="Voir détails">
                                                            <i className="fas fa-chevron-down" style={{ color: '#999' }}></i>
                                                        </button>
                                                        {/* FIX: bouton Modifier maintenant fonctionnel (fichiers uniquement) */}
                                                        {item.type_ressource !== 'video' && (
                                                            <button
                                                                style={styles.iconButton}
                                                                title="Modifier"
                                                                onClick={() => handleUpdateRessourceModal(
                                                                    item.id, item.titre, item.description, item.fichier, item.type_fichier
                                                                )}
                                                            >
                                                                <i className="fas fa-edit" style={{ color: '#28a745' }}></i>
                                                            </button>
                                                        )}
                                                        <button style={styles.iconButton} onClick={() => handleDeleteRessource(item.id)} title="Supprimer">
                                                            <i className="fas fa-trash-alt" style={{ color: '#dc3545' }}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {openIndexRessource === index && (
                                                <div style={styles.detailContent}>
                                                    <p><strong>Description :</strong> {item.description || 'Aucune description'}</p>
                                                    {item.type_ressource === 'video' ? (
                                                        <video controls style={{ width: '100%', borderRadius: '8px' }}>
                                                            {/* FIX: URL corrigée avec BASE_URL */}
                                                            <source src={`${BASE_URL}/api/ressource/video/${item.fichier}`} type="video/mp4" />
                                                        </video>
                                                    ) : (
                                                        <a
                                                            href={`${BASE_URL}/api/ressource/fichier/${item.fichier}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ background: '#ff5421', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}
                                                        >
                                                            <i className="fas fa-download me-2"></i>Télécharger
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ==================== ACTIVITÉS ==================== */}
                    {activeTab === 'activites' && (
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h4 style={styles.cardTitle}>
                                    <i className="fas fa-tasks me-2" style={{ color: '#ff5421' }}></i>
                                    Liste des activités
                                </h4>
                                <button style={styles.addButton} onClick={() => setOpenModal(true)}>
                                    <i className="fas fa-plus"></i> Ajouter une activité
                                </button>
                            </div>
                            <div>
                                {activite.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                                        <i className="fas fa-inbox fa-3x mb-3"></i>
                                        <p>Aucune activité pour le moment</p>
                                    </div>
                                ) : (
                                    activite.map((item, index) => (
                                        <div key={item.id || index}>
                                            <div style={styles.listItem}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ flex: 1 }} onClick={() => toggleActivite(index)}>
                                                        <div style={styles.itemTitle}>{item.titre}</div>
                                                        <div style={styles.itemMeta}>
                                                            <span><i className="far fa-clock me-1"></i>{item.duration || 'N/A'} min</span>
                                                            <span><i className="fas fa-tag me-1"></i>{item.categorie}</span>
                                                        </div>
                                                    </div>
                                                    <div style={styles.actionButtons}>
                                                        <button style={styles.iconButton} onClick={() => toggleActivite(index)} title="Voir détails">
                                                            <i className="fas fa-chevron-down" style={{ color: '#999' }}></i>
                                                        </button>
                                                        <button style={styles.iconButton} onClick={() => handleDeleteActivite(item.id)} title="Supprimer">
                                                            <i className="fas fa-trash-alt" style={{ color: '#dc3545' }}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {openIndex === index && (
                                                <div style={styles.detailContent}>
                                                    {item.categorie === 'text' && <p>{item.contenu}</p>}
                                                    {item.categorie === 'image' && (
                                                        // FIX: URL corrigée avec BASE_URL
                                                        <img src={`${BASE_URL}/api/image/${item.contenu}`} alt="contenu" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                                    )}
                                                    {item.categorie === 'video' && (
                                                        <video controls style={{ width: '100%', borderRadius: '8px' }}>
                                                            {/* FIX: URL corrigée avec BASE_URL */}
                                                            <source src={`${BASE_URL}/api/video/${item.contenu}`} type="video/mp4" />
                                                        </video>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ==================== MODALE CHOIX RESSOURCE ==================== */}
            {openModalRessource && (
                <div style={styles.modalOverlay} onClick={() => setOpenModalRessource(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Type de ressource</h3>
                            <button onClick={() => setOpenModalRessource(false)} style={styles.closeBtn}>×</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.categoryGrid}>
                                <div style={styles.categoryItem} onClick={modalFichier}>
                                    <i className="fas fa-file-pdf fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                                    <div>Fichier</div>
                                    <small style={{ fontSize: '10px', color: '#999' }}>PDF, Word, Excel, PPT</small>
                                </div>
                                <div style={styles.categoryItem} onClick={modalRessourceVideo}>
                                    <i className="fas fa-video fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                                    <div>Vidéo</div>
                                    <small style={{ fontSize: '10px', color: '#999' }}>MP4, AVI, MOV</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE FICHIER RESSOURCE */}
            {openModalRessourceFile && (
                <div style={styles.modalOverlay} onClick={closModalRessourceFile}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>{isAddingRessource ? 'Ajouter un fichier' : 'Modifier le fichier'}</h3>
                            <button onClick={closModalRessourceFile} style={styles.closeBtn}>×</button>
                        </div>
                        <form onSubmit={isAddingRessource ? handleSubmitFichier : handleUpdateRessource}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <textarea name="description" placeholder="Description (optionnelle)" value={inputs.description} onChange={handleInputChange} style={styles.textarea} />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('fichierInput').click()}>
                                    {inputs.fichierUrl ? (
                                        <>
                                            <i className="fas fa-file fa-3x" style={{ color: '#ff5421' }}></i>
                                            <p>{inputs.fichierName}</p>
                                            <small>Cliquez pour changer</small>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i>
                                            <p>Cliquez pour sélectionner un fichier</p>
                                            <small>PDF, Word, PowerPoint, Excel</small>
                                        </>
                                    )}
                                    {/* FIX: fichier requis seulement lors de l'ajout */}
                                    <input type="file" id="fichierInput" onChange={handleFichierChange} hidden required={isAddingRessource} />
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalRessourceFile} style={styles.cancelBtn}>Annuler</button>
                                <button type="submit" style={styles.submitBtn}>{isAddingRessource ? 'Ajouter' : 'Modifier'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALE VIDÉO RESSOURCE */}
            {openModalRessourceVideo && (
                <div style={styles.modalOverlay} onClick={closModalRessourceVideo}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Ajouter une vidéo</h3>
                            <button onClick={closModalRessourceVideo} style={styles.closeBtn}>×</button>
                        </div>
                        <form onSubmit={handleSubmitRessourceVideo}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <textarea name="description" placeholder="Description (optionnelle)" value={inputs.description} onChange={handleInputChange} style={styles.textarea} />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('ressourceVideoInput').click()}>
                                    {inputs.ressourceVideoUrl ? (
                                        <>
                                            <video src={inputs.ressourceVideoUrl} style={styles.videoPreview} controls />
                                            {/* FIX: accès sécurisé avec ?. pour éviter crash si null */}
                                            <p style={{ marginTop: '10px' }}>{inputs.ressourceVideo?.name}</p>
                                            <small>Cliquez pour changer</small>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i>
                                            <p>Cliquez pour sélectionner une vidéo</p>
                                            <small>MP4, AVI, MOV (max 500MB)</small>
                                        </>
                                    )}
                                    <input type="file" id="ressourceVideoInput" accept="video/*" onChange={handleRessourceVideoChange} hidden required />
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalRessourceVideo} style={styles.cancelBtn}>Annuler</button>
                                <button type="submit" style={styles.submitBtn}>Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== MODALES ACTIVITÉS ==================== */}
            {openModal && (
                <div style={styles.modalOverlay} onClick={() => setOpenModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Type d'activité</h3>
                            <button onClick={() => setOpenModal(false)} style={styles.closeBtn}>×</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.categoryGrid}>
                                <div style={styles.categoryItem} onClick={modalText}>
                                    <i className="fas fa-paragraph fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                                    <div>Texte</div>
                                </div>
                                <div style={styles.categoryItem} onClick={modalImage}>
                                    <i className="fas fa-image fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                                    <div>Image</div>
                                </div>
                                <div style={styles.categoryItem} onClick={modalvideo}>
                                    <i className="fas fa-video fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                                    <div>Vidéo</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal texte */}
            {openModalText && (
                <div style={styles.modalOverlay} onClick={closModalT}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Ajouter un texte</h3>
                            <button onClick={closModalT} style={styles.closeBtn}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <textarea name="contenu" placeholder="Contenu" value={inputs.contenu} onChange={handleInputChange} style={styles.textarea} required />
                                <input type="number" name="duration" placeholder="Durée (minutes)" value={inputs.duration} onChange={handleInputChange} style={styles.input} />
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalT} style={styles.cancelBtn}>Annuler</button>
                                <button type="submit" style={styles.submitBtn}>Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal image */}
            {openModalImage && (
                <div style={styles.modalOverlay} onClick={closModalI}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Ajouter une image</h3>
                            <button onClick={closModalI} style={styles.closeBtn}>×</button>
                        </div>
                        <form onSubmit={handleSubmitim}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('imageInput').click()}>
                                    {inputs.imageUrl
                                        ? <img src={inputs.imageUrl} style={{ maxWidth: '100%', maxHeight: '150px' }} alt="preview" />
                                        : <><i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i><p>Cliquez pour sélectionner une image</p></>
                                    }
                                    <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} hidden required />
                                </div>
                                <input type="number" name="duration" placeholder="Durée (minutes)" value={inputs.duration} onChange={handleInputChange} style={styles.input} />
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalI} style={styles.cancelBtn}>Annuler</button>
                                <button type="submit" style={styles.submitBtn}>Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal vidéo activité */}
            {openModalVideo && (
                <div style={styles.modalOverlay} onClick={closModalV}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Ajouter une vidéo</h3>
                            <button onClick={closModalV} style={styles.closeBtn}>×</button>
                        </div>
                        <form onSubmit={handleSubmitvi}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('videoInput').click()}>
                                    {inputs.videoUrl
                                        ? <video src={inputs.videoUrl} style={{ maxWidth: '100%', maxHeight: '150px' }} controls />
                                        : <><i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i><p>Cliquez pour sélectionner une vidéo</p></>
                                    }
                                    <input type="file" id="videoInput" accept="video/*" onChange={handleVideoChange} hidden required />
                                </div>
                                <input type="number" name="duration" placeholder="Durée (minutes)" value={inputs.duration} onChange={handleInputChange} style={styles.input} />
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalV} style={styles.cancelBtn}>Annuler</button>
                                <button type="submit" style={styles.submitBtn}>Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
            <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
            <ToastContainer position="top-right" autoClose={3000} />
        </React.Fragment>
    );
};

export default CreateActivite;
