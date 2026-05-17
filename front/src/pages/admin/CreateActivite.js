import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    const [isAddingRessource, setIsAddingRessource] = useState(true);
    
    // Modales pour les activités
    const [openModalQuestionnaire, setOpenModalQuestionnaire] = useState(false);
    const [openModalDevoir, setOpenModalDevoir] = useState(false);
    const [openModalVideoInteractive, setOpenModalVideoInteractive] = useState(false);
    
    // Modales pour les ressources
    const [openModalRessourceFile, setOpenModalRessourceFile] = useState(false);
    const [openModalRessourceVideo, setOpenModalRessourceVideo] = useState(false);
    
    const [activite, setActivite] = useState([]);
    const [ressources, setRessources] = useState([]);
    const [activeTab, setActiveTab] = useState('ressources');
    const [loading, setLoading] = useState(true);
    const [travauxCount, setTravauxCount] = useState({});
    const { id } = useParams();
    const { idUser } = useAuth();
    
    // État pour les questions du questionnaire (texte simple sans options)
    const [questions, setQuestions] = useState([
        { texte: "" }
    ]);
    
    // État pour les questions de la vidéo interactive (texte simple sans options)
    const [videoQuestions, setVideoQuestions] = useState([
        { texte: "", timestamp: 0 }
    ]);
    
    const [inputs, setInputs] = useState({
        id: "",
        titre: "",
        categorie: "",
        contenu: "",
        video: null,
        fichier: null,
        fichierUrl: null,
        fichierName: "",
        type_fichier: "",
        description: "",
        date_limite: "",
        fichierDevoir: null,
        fichierDevoirUrl: null,
        fichierDevoirName: "",
        type_fichier_devoir: "",
        ressourceVideo: null,
        ressourceVideoUrl: null
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

    const handleVideoChange = (e) => {
        const selectedVideo = e.target.files[0];
        const videoUrl = URL.createObjectURL(selectedVideo);
        if (selectedVideo) {
            setInputs(prev => ({ ...prev, video: selectedVideo, videoUrl: videoUrl }));
        }
    };

    const handleRessourceVideoChange = (e) => {
        const selectedVideo = e.target.files[0];
        const videoUrl = URL.createObjectURL(selectedVideo);
        if (selectedVideo) {
            setInputs(prev => ({ ...prev, ressourceVideo: selectedVideo, ressourceVideoUrl: videoUrl }));
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

    // Gestion du fichier pour le devoir
    const handleDevoirFichierChange = (e) => {
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
        }
        
        if (selectedFile) {
            setInputs(prev => ({ 
                ...prev, 
                fichierDevoir: selectedFile, 
                fichierDevoirUrl: fileUrl, 
                fichierDevoirName: selectedFile.name,
                type_fichier_devoir: type_fichier
            }));
        }
    };

    // Gestion des questions du questionnaire (texte simple)
    const handleAddQuestion = () => {
        setQuestions([...questions, { texte: "" }]);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].texte = value;
        setQuestions(newQuestions);
    };

    // Gestion des questions pour vidéo interactive (texte simple)
    const handleAddVideoQuestion = () => {
        setVideoQuestions([...videoQuestions, { texte: "", timestamp: 0 }]);
    };

    const handleRemoveVideoQuestion = (index) => {
        const newQuestions = [...videoQuestions];
        newQuestions.splice(index, 1);
        setVideoQuestions(newQuestions);
    };

    const handleVideoQuestionChange = (index, field, value) => {
        const newQuestions = [...videoQuestions];
        newQuestions[index][field] = value;
        setVideoQuestions(newQuestions);
    };

    // Récupérer le nombre de travaux pour une activité
    const fetchTravauxCount = async (activiteId) => {
        try {
            const response = await axios.get(`http://localhost:8801/api/travaux/getByActivite/${activiteId}`);
            setTravauxCount(prev => ({ ...prev, [activiteId]: response.data.length }));
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await idUser();
                const response = await axios.get(`http://localhost:8801/api/auth/checkUserRole/${userId}`);
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
            const response = await axios.get(`http://localhost:8801/api/activite/getAllActiviteId/${id}`);
            setActivite(response.data);
            response.data.forEach(act => {
                fetchTravauxCount(act.id);
            });
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRessources = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/ressource/getAllRessourceId/${id}`);
            setRessources(response.data);
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    useEffect(() => {
        fetchActivite();
        fetchRessources();
    }, [id]);

    // ==================== ACTIVITÉS ====================
    
    // Questionnaire (questions texte simple)
    const handleSubmitQuestionnaire = async (e) => {
        e.preventDefault();
        
        if (!inputs.titre) {
            toast.error('Le titre est requis.');
            return;
        }
        
        // Vérifier que toutes les questions ont du texte
        const hasEmptyQuestion = questions.some(q => !q.texte.trim());
        if (hasEmptyQuestion) {
            toast.error('Veuillez remplir toutes les questions.');
            return;
        }
        
        try {
            await axios.post("http://localhost:8801/api/activite/createQuestionnaire", {
                titre: inputs.titre,
                questions: questions,
                id_chapitre: id
            });
            toast.success('Questionnaire créé avec succès');
            setQuestions([{ texte: "" }]);
            setInputs(prev => ({ ...prev, titre: "" }));
            fetchActivite();
            setOpenModalQuestionnaire(false);
            setOpenModal(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur lors de la création');
        }
    };

    // Devoir avec fichier (PDF/Word/PowerPoint) - UNIQUEMENT titre, fichier et date de rendu
    const handleSubmitDevoir = async (e) => {
        e.preventDefault();
        
        if (!inputs.titre || !inputs.fichierDevoir) {
            toast.error('Le titre et le fichier sont requis.');
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('date_limite', inputs.date_limite || null);
            formData.append('fichier', inputs.fichierDevoir);
            formData.append('type_fichier', inputs.type_fichier_devoir);
            formData.append('id_chapitre', id);
            
            await axios.post("http://localhost:8801/api/activite/createDevoir", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Devoir créé avec succès');
            setInputs(prev => ({ 
                ...prev, 
                titre: "", 
                date_limite: "", 
                fichierDevoir: null,
                fichierDevoirUrl: null,
                fichierDevoirName: "",
                type_fichier_devoir: ""
            }));
            fetchActivite();
            setOpenModalDevoir(false);
            setOpenModal(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur lors de la création');
        }
    };

    // Vidéo interactive (questions texte simple)
    const handleSubmitVideoInteractive = async (e) => {
        e.preventDefault();
        
        if (!inputs.titre || !inputs.video) {
            toast.error('Le titre et la vidéo sont requis.');
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('video', inputs.video);
            formData.append('questions_interactives', JSON.stringify(videoQuestions));
            formData.append('id_chapitre', id);
            
            await axios.post("http://localhost:8801/api/activite/createVideoInteractive", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Vidéo interactive créée avec succès');
            setInputs(prev => ({ ...prev, titre: "", video: null, videoUrl: null }));
            setVideoQuestions([{ texte: "", timestamp: 0 }]);
            fetchActivite();
            setOpenModalVideoInteractive(false);
            setOpenModal(true);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur lors de la création');
        }
    };

    const handleDeleteActivite = async (idActivite) => {
        if (window.confirm("Supprimer cette activité ?")) {
            try {
                await axios.delete(`http://localhost:8801/api/activite/deleteActivite/${idActivite}`);
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
            
            await axios.post("http://localhost:8801/api/ressource/createRessource", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Fichier ajouté');
            setInputs({ titre: "", description: "", fichier: null, fichierUrl: null, fichierName: "", type_fichier: "" });
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
            
            await axios.post("http://localhost:8801/api/ressource/createRessourceVideo", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Vidéo ajoutée');
            setInputs({ titre: "", description: "", ressourceVideo: null, ressourceVideoUrl: null });
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
                await axios.delete(`http://localhost:8801/api/ressource/deleteRessource/${idRessource}`);
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
            
            await axios.put(`http://localhost:8801/api/ressource/updateRessource/${inputs.id}`, formData, {
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
        const fileUrl = `http://localhost:8801/api/ressource/fichier/${fichier}`;
        setInputs({
            id, titre, description: description || '',
            fichier, fichierUrl: fileUrl, fichierName: fichier, type_fichier
        });
        setOpenModalRessourceFile(true);
        setIsAddingRessource(false);
    };

    // ==================== MODALES ====================
    const modalQuestionnaire = () => {
        setInputs(prev => ({ ...prev, categorie: "questionnaire" }));
        setOpenModalQuestionnaire(true);
        setOpenModal(false);
    };

    const modalDevoir = () => {
        setInputs(prev => ({ ...prev, categorie: "devoir" }));
        setOpenModalDevoir(true);
        setOpenModal(false);
    };

    const modalVideoInteractive = () => {
        setInputs(prev => ({ ...prev, categorie: "video_interactive" }));
        setOpenModalVideoInteractive(true);
        setOpenModal(false);
    };

    const openRessourceModal = () => setOpenModalRessource(true);
    
    const modalFichier = () => {
        setOpenModalRessourceFile(true);
        setOpenModalRessource(false);
    };

    const modalRessourceVideo = () => {
        setOpenModalRessourceVideo(true);
        setOpenModalRessource(false);
    };

    const closModalQuestionnaire = () => {
        setQuestions([{ texte: "" }]);
        setInputs(prev => ({ ...prev, titre: "" }));
        setOpenModalQuestionnaire(false);
    };

    const closModalDevoir = () => {
        setInputs(prev => ({ 
            ...prev, 
            titre: "", 
            date_limite: "", 
            fichierDevoir: null,
            fichierDevoirUrl: null,
            fichierDevoirName: "",
            type_fichier_devoir: ""
        }));
        setOpenModalDevoir(false);
    };

    const closModalVideoInteractive = () => {
        setVideoQuestions([{ texte: "", timestamp: 0 }]);
        setInputs(prev => ({ ...prev, titre: "", video: null, videoUrl: null }));
        setOpenModalVideoInteractive(false);
    };

    const closModalRessourceFile = () => {
        setIsAddingRessource(true);
        setInputs(prev => ({ ...prev, id: "", titre: "", description: "", fichier: null, fichierUrl: null, fichierName: "", type_fichier: "" }));
        setOpenModalRessourceFile(false);
    };

    const closModalRessourceVideo = () => {
        setInputs(prev => ({ ...prev, id: "", titre: "", description: "", ressourceVideo: null, ressourceVideoUrl: null }));
        setOpenModalRessourceVideo(false);
    };

    const getFileIcon = (type_fichier) => {
        const icons = {
            pdf: '📄',
            word: '📝',
            powerpoint: '📊',
            excel: '📈',
            video: '🎬',
            other: '📁'
        };
        const names = {
            pdf: 'PDF',
            word: 'Word',
            powerpoint: 'PowerPoint',
            excel: 'Excel',
            video: 'Vidéo',
            other: 'Fichier'
        };
        return `${icons[type_fichier]} ${names[type_fichier]}`;
    };

    const getDevoirFileIcon = (type_fichier) => {
        const icons = {
            pdf: '📄 PDF',
            word: '📝 Word',
            powerpoint: '📊 PowerPoint'
        };
        return icons[type_fichier] || '📁 Fichier';
    };

    const getActiviteIcon = (categorie) => {
        const icons = {
            questionnaire: '📋',
            devoir: '📚',
            video_interactive: '🎯'
        };
        return icons[categorie] || '📄';
    };

    const getActiviteTypeName = (categorie) => {
        const names = {
            questionnaire: 'Questionnaire',
            devoir: 'Devoir',
            video_interactive: 'Vidéo interactive'
        };
        return names[categorie] || 'Activité';
    };

    // ==================== STYLES ====================
    const styles = {
        container: { padding: '30px 0' },
        tabsHeader: { display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', flexWrap: 'wrap' },
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
        cardHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
        cardTitle: { margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' },
        addButton: { background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' },
        listItem: { padding: '15px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.2s' },
        listItemHover: { background: '#fafafa' },
        itemTitle: { fontWeight: 500, color: '#333', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
        itemMeta: { fontSize: '12px', color: '#999', display: 'flex', gap: '15px', flexWrap: 'wrap' },
        actionButtons: { display: 'flex', gap: '10px', alignItems: 'center' },
        iconButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', transition: 'all 0.2s' },
        detailContent: { padding: '20px', background: '#f9f9f9', margin: '10px 20px 20px 20px', borderRadius: '8px' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' },
        modalHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        modalBody: { padding: '20px' },
        modalFooter: { padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
        categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' },
        categoryItem: { textAlign: 'center', padding: '20px', border: '2px solid #eee', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
        input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '15px' },
        textarea: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', minHeight: '100px', marginBottom: '15px' },
        uploadArea: { border: '2px dashed #ddd', borderRadius: '12px', padding: '30px', textAlign: 'center', cursor: 'pointer', marginBottom: '15px', transition: 'all 0.2s' },
        submitButton: { background: '#ff5421', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 500, width: '100%' },
        videoPreview: { maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' },
        questionCard: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px' },
        questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
        viewTravauxButton: {
            background: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            textDecoration: 'none'
        },
        travauxBadge: {
            background: '#ff5421',
            color: '#fff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            marginLeft: '8px'
        },
        addButtonSecondary: { background: '#28a745', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginTop: '10px' },
        removeButton: { background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
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

            <SiteBreadcrumb pageTitle="Ressources & Activités" pageName="Gestion des contenus" breadcrumbsImg={bannerbg} />

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
                                                        <div style={styles.itemTitle}>
                                                            {item.type_ressource === 'video' ? (
                                                                <i className="fas fa-video me-2" style={{ color: '#ff5421' }}></i>
                                                            ) : (
                                                                <i className="fas fa-file-alt me-2" style={{ color: '#ff5421' }}></i>
                                                            )}
                                                            {item.titre}
                                                        </div>
                                                        <div style={styles.itemMeta}>
                                                            {item.type_ressource === 'video' ? (
                                                                <span>🎬 Vidéo</span>
                                                            ) : (
                                                                <span>{getFileIcon(item.type_fichier)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={styles.actionButtons}>
                                                        <button style={styles.iconButton} onClick={() => toggleRessource(index)}>
                                                            <i className="fas fa-chevron-down" style={{ color: '#999' }}></i>
                                                        </button>
                                                        <button style={styles.iconButton} onClick={() => handleDeleteRessource(item.id)}>
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
                                                            <source src={`http://localhost:8801/api/ressource/video/${item.fichier}`} type="video/mp4" />
                                                        </video>
                                                    ) : (
                                                        <a href={`http://localhost:8801/api/ressource/fichier/${item.fichier}`} target="_blank" rel="noopener noreferrer" style={{ background: '#ff5421', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
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
                                        <div key={item.id}>
                                            <div style={styles.listItem}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                                                    <div style={{ flex: 1 }} onClick={() => toggleActivite(index)}>
                                                        <div style={styles.itemTitle}>
                                                            <span>{getActiviteIcon(item.categorie)}</span>
                                                            {item.titre}
                                                            {travauxCount[item.id] > 0 && (
                                                                <span style={styles.travauxBadge}>
                                                                    {travauxCount[item.id]}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={styles.itemMeta}>
                                                            <span><i className="fas fa-tag me-1"></i>{getActiviteTypeName(item.categorie)}</span>
                                                        </div>
                                                    </div>
                                                    <div style={styles.actionButtons}>
                                                        <Link 
                                                            to={`/enseignant/travaux/${item.id}`}
                                                            style={styles.viewTravauxButton}
                                                            title="Voir les travaux des étudiants"
                                                        >
                                                            <i className="fas fa-users"></i>
                                                            Travaux ({travauxCount[item.id] || 0})
                                                        </Link>
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
                                                    {item.categorie === 'questionnaire' && (
                                                        <div>
                                                            <h5>📋 Questionnaire</h5>
                                                            {(() => {
                                                                try {
                                                                    const questionsData = JSON.parse(item.contenu);
                                                                    return (
                                                                        <div>
                                                                            {questionsData.map((q, qIndex) => (
                                                                                <div key={qIndex} style={{ marginBottom: '20px', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                                                                                    <p><strong>Question {qIndex + 1}:</strong> {q.texte}</p>
                                                                                    <textarea 
                                                                                        placeholder="Votre réponse..." 
                                                                                        style={{ width: '100%', padding: '10px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                                                                                        rows="3"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    );
                                                                } catch (e) {
                                                                    return <p>{item.contenu}</p>;
                                                                }
                                                            })()}
                                                        </div>
                                                    )}
                                                    {item.categorie === 'devoir' && (
                                                        <div>
                                                            <h5>📚 Devoir</h5>
                                                            {(() => {
                                                                try {
                                                                    const devoirData = JSON.parse(item.contenu);
                                                                    return (
                                                                        <div>
                                                                            {devoirData.date_limite && <p><strong>Date limite:</strong> {new Date(devoirData.date_limite).toLocaleDateString()}</p>}
                                                                            {devoirData.fichier && (
                                                                                <div>
                                                                                    <p><strong>Document joint:</strong> {getDevoirFileIcon(devoirData.type_fichier)}</p>
                                                                                    <a href={`http://localhost:8801/api/activite/fichier/${devoirData.fichier}`} target="_blank" rel="noopener noreferrer" style={{ background: '#17a2b8', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}>
                                                                                        <i className="fas fa-download me-2"></i>Télécharger le sujet
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                } catch (e) {
                                                                    return <p>{item.contenu}</p>;
                                                                }
                                                            })()}
                                                        </div>
                                                    )}
                                                    {item.categorie === 'video_interactive' && (
                                                        <div>
                                                            <h5>🎯 Vidéo interactive</h5>
                                                            {(() => {
                                                                try {
                                                                    const videoData = JSON.parse(item.contenu);
                                                                    return (
                                                                        <div>
                                                                            <video controls style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }}>
                                                                                <source src={`http://localhost:8801/api/video/${videoData.video}`} type="video/mp4" />
                                                                            </video>
                                                                            <h6>Questions:</h6>
                                                                            {videoData.questions && videoData.questions.map((q, qIndex) => (
                                                                                <div key={qIndex} style={{ marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                                                                                    <p><strong>À {q.timestamp} secondes:</strong> {q.texte}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    );
                                                                } catch (e) {
                                                                    return <p>{item.contenu}</p>;
                                                                }
                                                            })()}
                                                        </div>
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

            {/* ==================== MODALES RESSOURCES ==================== */}
            
            {/* MODALE CHOIX RESSOURCE */}
            {openModalRessource && (
                <div style={styles.modalOverlay} onClick={() => setOpenModalRessource(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Type de ressource</h3>
                            <button onClick={() => setOpenModalRessource(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
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
                            <button onClick={closModalRessourceFile} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
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

            {/* MODALE VIDÉO RESSOURCE */}
            {openModalRessourceVideo && (
                <div style={styles.modalOverlay} onClick={closModalRessourceVideo}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Ajouter une vidéo</h3>
                            <button onClick={closModalRessourceVideo} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmitRessourceVideo}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <textarea name="description" placeholder="Description (optionnelle)" value={inputs.description} onChange={handleInputChange} style={styles.textarea} />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('ressourceVideoInput').click()}>
                                    {inputs.ressourceVideoUrl ? (
                                        <>
                                            <video src={inputs.ressourceVideoUrl} style={styles.videoPreview} controls />
                                            <p style={{ marginTop: '10px' }}>{inputs.ressourceVideo.name}</p>
                                            <small>Cliquez pour changer</small>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i>
                                            <p>Cliquez pour sélectionner une vidéo</p>
                                            <small>MP4, AVI, MOV (max 500MB)</small>
                                        </>
                                    )}
                                    <input type="file" id="ressourceVideoInput" accept="video/*" onChange={handleRessourceVideoChange} hidden />
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalRessourceVideo} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px' }}>Annuler</button>
                                <button type="submit" style={{ background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== MODALES ACTIVITÉS ==================== */}
            
            {/* MODALE CHOIX ACTIVITÉ */}
            {openModal && (
                <div style={styles.modalOverlay} onClick={() => setOpenModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Type d'activité</h3>
                            <button onClick={() => setOpenModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.categoryGrid}>
                                <div style={styles.categoryItem} onClick={modalQuestionnaire}>
                                    <i className="fas fa-question-circle fa-3x mb-2" style={{ color: '#28a745' }}></i>
                                    <div>Questionnaire</div>
                                    <small style={{ fontSize: '10px', color: '#999' }}>Questions à réponse libre</small>
                                </div>
                                <div style={styles.categoryItem} onClick={modalDevoir}>
                                    <i className="fas fa-file-pdf fa-3x mb-2" style={{ color: '#dc3545' }}></i>
                                    <div>Devoir</div>
                                    <small style={{ fontSize: '10px', color: '#999' }}>Titre, fichier et date de rendu</small>
                                </div>
                                <div style={styles.categoryItem} onClick={modalVideoInteractive}>
                                    <i className="fas fa-play-circle fa-3x mb-2" style={{ color: '#fd7e14' }}></i>
                                    <div>Vidéo interactive</div>
                                    <small style={{ fontSize: '10px', color: '#999' }}>Avec questions textuelles</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE QUESTIONNAIRE - Questions à réponse texte */}
            {openModalQuestionnaire && (
                <div style={styles.modalOverlay} onClick={closModalQuestionnaire}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Créer un questionnaire</h3>
                            <button onClick={closModalQuestionnaire} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmitQuestionnaire}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre du questionnaire" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                
                                <h4 style={{ marginTop: '20px' }}>Questions</h4>
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} style={styles.questionCard}>
                                        <div style={styles.questionHeader}>
                                            <strong>Question {qIndex + 1}</strong>
                                            {questions.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={styles.removeButton}>
                                                    <i className="fas fa-trash"></i> Supprimer
                                                </button>
                                            )}
                                        </div>
                                        <textarea 
                                            placeholder="Texte de la question" 
                                            value={q.texte} 
                                            onChange={(e) => handleQuestionChange(qIndex, e.target.value)} 
                                            style={styles.textarea} 
                                            required 
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddQuestion} style={styles.addButtonSecondary}>
                                    <i className="fas fa-plus"></i> Ajouter une question
                                </button>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalQuestionnaire} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px' }}>Annuler</button>
                                <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Créer le questionnaire</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALE DEVOIR - UNIQUEMENT Titre, Fichier et Date de rendu */}
            {openModalDevoir && (
                <div style={styles.modalOverlay} onClick={closModalDevoir}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Créer un devoir</h3>
                            <button onClick={closModalDevoir} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmitDevoir}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre du devoir" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <input type="datetime-local" name="date_limite" value={inputs.date_limite} onChange={handleInputChange} style={styles.input} placeholder="Date de rendu" />
                                
                                <h4 style={{ marginTop: '15px' }}>Fichier du devoir</h4>
                                <div style={styles.uploadArea} onClick={() => document.getElementById('devoirFichierInput').click()}>
                                    {inputs.fichierDevoirUrl ? (
                                        <>
                                            <i className={`fas fa-${inputs.type_fichier_devoir === 'pdf' ? 'file-pdf' : inputs.type_fichier_devoir === 'word' ? 'file-word' : 'file-powerpoint'} fa-3x`} style={{ color: '#dc3545' }}></i>
                                            <p>{inputs.fichierDevoirName}</p>
                                            <small>Cliquez pour changer</small>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#dc3545' }}></i>
                                            <p>Cliquez pour sélectionner le sujet du devoir</p>
                                            <small>PDF, Word, PowerPoint (max 50MB)</small>
                                        </>
                                    )}
                                    <input type="file" id="devoirFichierInput" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleDevoirFichierChange} hidden required={!inputs.fichierDevoirUrl} />
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalDevoir} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px' }}>Annuler</button>
                                <button type="submit" style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Créer le devoir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALE VIDÉO INTERACTIVE */}
            {openModalVideoInteractive && (
                <div style={styles.modalOverlay} onClick={closModalVideoInteractive}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Créer une vidéo interactive</h3>
                            <button onClick={closModalVideoInteractive} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmitVideoInteractive}>
                            <div style={styles.modalBody}>
                                <input type="text" name="titre" placeholder="Titre de la vidéo" value={inputs.titre} onChange={handleInputChange} style={styles.input} required />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('videoInteractiveInput').click()}>
                                    {inputs.videoUrl ? (
                                        <>
                                            <video src={inputs.videoUrl} style={styles.videoPreview} controls />
                                            <p style={{ marginTop: '10px' }}>{inputs.video?.name}</p>
                                            <small>Cliquez pour changer</small>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#fd7e14' }}></i>
                                            <p>Cliquez pour sélectionner une vidéo</p>
                                            <small>MP4, AVI, MOV (max 500MB)</small>
                                        </>
                                    )}
                                    <input type="file" id="videoInteractiveInput" accept="video/*" onChange={handleVideoChange} hidden required={!inputs.videoUrl} />
                                </div>
                                
                                <h4 style={{ marginTop: '20px' }}>Questions interactives (texte)</h4>
                                {videoQuestions.map((q, qIndex) => (
                                    <div key={qIndex} style={styles.questionCard}>
                                        <div style={styles.questionHeader}>
                                            <strong>Question {qIndex + 1}</strong>
                                            {videoQuestions.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveVideoQuestion(qIndex)} style={styles.removeButton}>
                                                    <i className="fas fa-trash"></i> Supprimer
                                                </button>
                                            )}
                                        </div>
                                        <input 
                                            type="number" 
                                            placeholder="Timestamp (secondes)" 
                                            value={q.timestamp} 
                                            onChange={(e) => handleVideoQuestionChange(qIndex, 'timestamp', parseInt(e.target.value))} 
                                            style={styles.input} 
                                            required 
                                        />
                                        <textarea 
                                            placeholder="Texte de la question" 
                                            value={q.texte} 
                                            onChange={(e) => handleVideoQuestionChange(qIndex, 'texte', e.target.value)} 
                                            style={styles.textarea} 
                                            required 
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddVideoQuestion} style={styles.addButtonSecondary}>
                                    <i className="fas fa-plus"></i> Ajouter une question
                                </button>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={closModalVideoInteractive} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px' }}>Annuler</button>
                                <button type="submit" style={{ background: '#fd7e14', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Créer la vidéo interactive</button>
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