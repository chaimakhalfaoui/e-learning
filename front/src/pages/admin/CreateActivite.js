import React, { useEffect, useState } from 'react';
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
// Image
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const CreateActivite = () => {
    const [openModal, setOpenModal] = useState(false);
    const [openModalRessource, setOpenModalRessource] = useState(false);
    const [isAddingActive, setIsAddingActiv] = useState(true);
    const [isAddingRessource, setIsAddingRessource] = useState(true);
    const [openModalText, setOpenModalText] = useState(false);
    const [openModalImage, setOpenModalImage] = useState(false);
    const [openModalVideo, setOpenModalVideo] = useState(false);
    const [openModalRessourceFile, setOpenModalRessourceFile] = useState(false);
    const [activite, setActivite] = useState([]);
    const [ressources, setRessources] = useState([]);
    const [activeTab, setActiveTab] = useState('activites');
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { idUser } = useAuth();
    const [inputs, setInputs] = useState({
        id: "",
        titre: "",
        categorie: "",
        contenu: "",
        duration: "",
        image: null,
        video: null,
        fichier: null,
        fichierUrl: null,
        fichierName: "",
        type_fichier: "",
        description: ""
    });
    const navigate = useNavigate();

    const [openIndex, setOpenIndex] = useState(null);
    const [openIndexRessource, setOpenIndexRessource] = useState(null);

    const toggleActivite = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const toggleRessource = (index) => {
        setOpenIndexRessource(openIndexRessource === index ? null : index);
    };

    const handleInputChange = (e) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        const imageUrl = URL.createObjectURL(selectedImage);
        setInputs(prev => ({ ...prev, image: selectedImage, imageUrl: imageUrl }));
    };

    const handleVideoChange = (e) => {
        const selectedVideo = e.target.files[0];
        const videoUrl = URL.createObjectURL(selectedVideo);
        if (selectedVideo) {
            setInputs(prev => ({ ...prev, video: selectedVideo, videoUrl: videoUrl }));
        }
    };

    const handleFichierChange = (e) => {
        const selectedFile = e.target.files[0];
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
        
        if (selectedFile) {
            setInputs(prev => ({ 
                ...prev, 
                fichier: selectedFile, 
                fichierUrl: fileUrl, 
                fichierName: selectedFile.name,
                type_fichier: type_fichier
            }));
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await idUser();
                const response = await axios.get(`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/auth/checkUserRole/${userId}`);
                const userRole = response.data.role;
                if (userRole !== 'enseignant') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur:", error);
            }
        };
        fetchUserData();
    }, [idUser, navigate]);

    const fetchActivite = async () => {
        try {
            const response = await axios.get(`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/activite/getAllActiviteId/${id}`);
            setActivite(response.data);
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRessources = async () => {
        try {
            const response = await axios.get(`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/ressource/getAllRessourceId/${id}`);
            setRessources(response.data);
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    useEffect(() => {
        fetchActivite();
        fetchRessources();
    }, [id]);

    // Activités
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/activite/createActivite", {
                titre: inputs.titre,
                categorie: inputs.categorie,
                contenu: inputs.contenu,
                duration: inputs.duration,
                id_chapitre: id
            });
            toast.success('Activité créée avec succès');
            setInputs({ titre: "", contenu: "", categorie: "", duration: "", image: null, video: null });
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
            await axios.post("http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/activite/createActivitei", formData);
            toast.success('Image ajoutée avec succès');
            setInputs({ titre: "", duration: "", image: null, categorie: "" });
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
            await axios.post("http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/activite/createActivitev", formData);
            toast.success('Vidéo ajoutée avec succès');
            setInputs({ titre: "", duration: "", video: null, categorie: "" });
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
                await axios.delete(`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/activite/deleteActivite/${idActivite}`);
                toast.success('Activité supprimée');
                fetchActivite();
            } catch (err) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    // Ressources
    const handleSubmitFichier = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('description', inputs.description || '');
            formData.append('fichier', inputs.fichier);
            formData.append('type_fichier', inputs.type_fichier);
            formData.append('id_chapitre', id);
            
            await axios.post("http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/ressource/createRessource", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Ressource ajoutée');
            setInputs({ titre: "", description: "", fichier: null, fichierUrl: null, fichierName: "", type_fichier: "" });
            fetchRessources();
            setOpenModalRessourceFile(false);
            setOpenModalRessource(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur');
        }
    };

    const handleDeleteRessource = async (idRessource) => {
        if (window.confirm("Supprimer cette ressource ?")) {
            try {
                await axios.delete(`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/ressource/deleteRessource/${idRessource}`);
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
            
            await axios.put(`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/ressource/updateRessource/${inputs.id}`, formData, {
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

    const handleUpdateRessourceModal = (id, titre, description, fichier, type_fichier) => {
        const fileUrl = `http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/ressource/fichier/${fichier}`;
        setInputs({
            id, titre, description: description || '',
            fichier, fichierUrl: fileUrl, fichierName: fichier, type_fichier
        });
        setOpenModalRessourceFile(true);
        setIsAddingRessource(false);
    };

    // Modales
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

    const openRessourceModal = () => setOpenModalRessource(true);
    const modalFichier = () => {
        setOpenModalRessourceFile(true);
        setOpenModalRessource(false);
    };
    const openCat = () => {
        setOpenModal(true);
        setOpenModalVideo(false);
        setOpenModalImage(false);
        setOpenModalText(false);
    };
    const openCatRessource = () => {
        setOpenModalRessource(true);
        setOpenModalRessourceFile(false);
    };

    const closModalT = () => {
        setIsAddingActiv(true);
        setInputs({ id: "", titre: "", contenu: "", duration: "", categorie: "" });
        setOpenModalText(false);
    };

    const closModalI = () => {
        setIsAddingActiv(true);
        setInputs({ id: "", titre: "", image: null, imageUrl: null, duration: "", categorie: "" });
        setOpenModalImage(false);
    };

    const closModalV = () => {
        setIsAddingActiv(true);
        setInputs({ id: "", titre: "", video: null, videoUrl: null, duration: "", categorie: "" });
        setOpenModalVideo(false);
    };

    const closModalRessourceFile = () => {
        setIsAddingRessource(true);
        setInputs({ id: "", titre: "", description: "", fichier: null, fichierUrl: null, fichierName: "", type_fichier: "" });
        setOpenModalRessourceFile(false);
    };

    const getFileIcon = (type_fichier) => {
        const icons = {
            pdf: '📄',
            word: '📝',
            powerpoint: '📊',
            excel: '📈',
            other: '📁'
        };
        const names = {
            pdf: 'PDF',
            word: 'Word',
            powerpoint: 'PowerPoint',
            excel: 'Excel',
            other: 'Fichier'
        };
        return `${icons[type_fichier]} ${names[type_fichier]}`;
    };

    const styles = {
        container: { padding: '30px 0' },
        tabsHeader: { display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee' },
        tabButton: (isActive) => ({
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: isActive ? '#ff5421' : '#666',
            borderBottom: isActive ? '3px solid #ff5421' : 'none',
            transition: 'all 0.3s ease'
        }),
        card: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
        cardHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        cardTitle: { margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' },
        addButton: { background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' },
        listItem: { padding: '15px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.2s' },
        listItemHover: { background: '#fafafa' },
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
        submitButton: { background: '#ff5421', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 500, width: '100%' }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Helmet><link rel="icon" href={favIcon} /></Helmet>
            <OffWrap />
            <Header parentMenu='cours' secondParentMenu='others' headerNormalLogo={Logo}
                headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable' TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />

            <SiteBreadcrumb pageTitle="Activités & Ressources" pageName="Gestion des contenus" breadcrumbsImg={bannerbg} />

            <div style={styles.container} className="register-section pt-100 pb-100">
                <div className="container">
                    <div style={styles.tabsHeader}>
                        <button onClick={() => setActiveTab('activites')} style={styles.tabButton(activeTab === 'activites')}>
                            <i className="fas fa-tasks me-2"></i>Activités
                        </button>
                        <button onClick={() => setActiveTab('ressources')} style={styles.tabButton(activeTab === 'ressources')}>
                            <i className="fas fa-folder-open me-2"></i>Ressources pédagogiques
                        </button>
                    </div>

                    {/* Activités */}
                    {activeTab === 'activites' && (
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h4 style={styles.cardTitle}><i className="fas fa-tasks me-2" style={{ color: '#ff5421' }}></i>Liste des activités</h4>
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
                                        <div key={index}>
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
                                                    {item.categorie === 'image' && <img src={`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/image/${item.contenu}`} alt="contenu" style={{ maxWidth: '100%', borderRadius: '8px' }} />}
                                                    {item.categorie === 'video' && (
                                                        <video controls style={{ width: '100%', borderRadius: '8px' }}>
                                                            <source src={`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/video/${item.contenu}`} type="video/mp4" />
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

                    {/* Ressources */}
                    {activeTab === 'ressources' && (
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h4 style={styles.cardTitle}><i className="fas fa-folder-open me-2" style={{ color: '#ff5421' }}></i>Documents et ressources</h4>
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
                                        <div key={index}>
                                            <div style={styles.listItem}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ flex: 1 }} onClick={() => toggleRessource(index)}>
                                                        <div style={styles.itemTitle}><i className="fas fa-file-alt me-2" style={{ color: '#ff5421' }}></i>{item.titre}</div>
                                                        <div style={styles.itemMeta}>
                                                            <span>{getFileIcon(item.type_fichier)}</span>
                                                        </div>
                                                    </div>
                                                    <div style={styles.actionButtons}>
                                                        <button style={styles.iconButton} onClick={() => toggleRessource(index)}><i className="fas fa-chevron-down" style={{ color: '#999' }}></i></button>
                                                        <button style={styles.iconButton} onClick={() => handleUpdateRessourceModal(item.id, item.titre, item.description, item.fichier, item.type_fichier)}><i className="fas fa-edit" style={{ color: '#ffc107' }}></i></button>
                                                        <button style={styles.iconButton} onClick={() => handleDeleteRessource(item.id)}><i className="fas fa-trash-alt" style={{ color: '#dc3545' }}></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                            {openIndexRessource === index && (
                                                <div style={styles.detailContent}>
                                                    <p><strong>Description :</strong> {item.description || 'Aucune description'}</p>
                                                    <a href={`http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/ressource/fichier/${item.fichier}`} target="_blank" rel="noopener noreferrer" style={{ background: '#ff5421', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                                                        <i className="fas fa-download me-2"></i>Télécharger
                                                    </a>
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

            {/* Modal choix activité */}
            {openModal && (
                <div style={styles.modalOverlay} onClick={() => setOpenModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Type d'activité</h3>
                            <button onClick={() => setOpenModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.categoryGrid}>
                                <div style={styles.categoryItem} onClick={modalText}><i className="fas fa-paragraph fa-3x mb-2" style={{ color: '#ff5421' }}></i><div>Texte</div></div>
                                <div style={styles.categoryItem} onClick={modalImage}><i className="fas fa-image fa-3x mb-2" style={{ color: '#ff5421' }}></i><div>Image</div></div>
                                <div style={styles.categoryItem} onClick={modalvideo}><i className="fas fa-video fa-3x mb-2" style={{ color: '#ff5421' }}></i><div>Vidéo</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal choix ressource */}
            {openModalRessource && (
                <div style={styles.modalOverlay} onClick={() => setOpenModalRessource(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Type de ressource</h3>
                            <button onClick={() => setOpenModalRessource(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.categoryGrid}>
                                <div style={styles.categoryItem} onClick={modalFichier}><i className="fas fa-file-pdf fa-3x mb-2" style={{ color: '#ff5421' }}></i><div>Fichier</div></div>
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
                            <button onClick={closModalT} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <textarea name="contenu" placeholder="Contenu" value={inputs.contenu} onChange={handleInputChange} style={styles.textarea} required />
                                <input type="number" name="duration" placeholder="Durée (minutes)" value={inputs.duration} onChange={handleInputChange} style={styles.input} />
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalT} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px' }}>Annuler</button>
                                <button type="submit" style={{ background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Ajouter</button>
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
                            <button onClick={closModalI} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmitim}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('imageInput').click()}>
                                    {inputs.imageUrl ? <img src={inputs.imageUrl} style={{ maxWidth: '100%', maxHeight: '150px' }} alt="preview" /> : <><i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i><p>Cliquez pour sélectionner une image</p></>}
                                    <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} hidden />
                                </div>
                                <input type="number" name="duration" placeholder="Durée (minutes)" value={inputs.duration} onChange={handleInputChange} style={styles.input} />
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalI} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px' }}>Annuler</button>
                                <button type="submit" style={{ background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal vidéo */}
            {openModalVideo && (
                <div style={styles.modalOverlay} onClick={closModalV}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Ajouter une vidéo</h3>
                            <button onClick={closModalV} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmitvi}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('videoInput').click()}>
                                    {inputs.videoUrl ? <video src={inputs.videoUrl} style={{ maxWidth: '100%', maxHeight: '150px' }} controls /> : <><i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i><p>Cliquez pour sélectionner une vidéo</p></>}
                                    <input type="file" id="videoInput" accept="video/*" onChange={handleVideoChange} hidden />
                                </div>
                                <input type="number" name="duration" placeholder="Durée (minutes)" value={inputs.duration} onChange={handleInputChange} style={styles.input} />
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalV} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px' }}>Annuler</button>
                                <button type="submit" style={{ background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal fichier ressource */}
            {openModalRessourceFile && (
                <div style={styles.modalOverlay} onClick={closModalRessourceFile}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>{isAddingRessource ? 'Ajouter une ressource' : 'Modifier la ressource'}</h3>
                            <button onClick={closModalRessourceFile} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={isAddingRessource ? handleSubmitFichier : handleUpdateRessource}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <textarea name="description" placeholder="Description (optionnelle)" value={inputs.description} onChange={handleInputChange} style={styles.textarea} />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('fichierInput').click()}>
                                    {inputs.fichierUrl ? <><i className="fas fa-file fa-3x" style={{ color: '#ff5421' }}></i><p>{inputs.fichierName}</p><small>Cliquez pour changer</small></> : <><i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i><p>Cliquez pour sélectionner un fichier</p><small>PDF, Word, PowerPoint, Excel</small></>}
                                    <input type="file" id="fichierInput" onChange={handleFichierChange} hidden />
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalRessourceFile} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px' }}>Annuler</button>
                                <button type="submit" style={{ background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>{isAddingRessource ? 'Ajouter' : 'Modifier'}</button>
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