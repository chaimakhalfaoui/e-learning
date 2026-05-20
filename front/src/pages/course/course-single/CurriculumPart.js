import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import ModalVideo from 'react-modal-video';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../assets/scss/modal.scss';
import { useAuth } from '../../../context/authContext'; 

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemPanel,
    AccordionItemButton,
} from 'react-accessible-accordion';

const CurriculumPart = () => {
    const { idUser } = useAuth();
    const { id } = useParams();
    const [course, setCourse] = useState([]);
    const [chapitre, setChapitre] = useState([]);
    const [quiz, setQuiz] = useState([]);
    const [ressources, setRessources] = useState({});
    const [travaux, setTravaux] = useState({});
    const [showTravailModal, setShowTravailModal] = useState(false);
    const [selectedActivite, setSelectedActivite] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [progressionChapitres, setProgressionChapitres] = useState({});
    const [nouveauTravail, setNouveauTravail] = useState({
        titre: "",
        description: "",
        fichier: null,
        lien: ""
    });
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    
    // État pour stocker les réponses du questionnaire
    const [reponsesQuestionnaire, setReponsesQuestionnaire] = useState({});

    const [openIndex, setOpenIndex] = useState({});
    const [openIndexc, setOpenIndexc] = useState(null);
    const [openRessourceIndex, setOpenRessourceIndex] = useState({});
    const [openTravailIndex, setOpenTravailIndex] = useState({});

    const toggleActivite = (chapitreIdx, activiteId) => {
        const key = `${chapitreIdx}_${activiteId}`;
        setOpenIndex(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const toggleRessource = (ressourceId) => {
        setOpenRessourceIndex(prev => ({
            ...prev,
            [ressourceId]: !prev[ressourceId]
        }));
    };

    const toggleTravailSection = (activiteId) => {
        setOpenTravailIndex(prev => ({
            ...prev,
            [activiteId]: !prev[activiteId]
        }));
    };

    useEffect(() => {
        fetchQuiz();
        fetchCourse();
        getChapitreAndActivite();
        fetchUserInfo();
    }, [id]);

    const fetchUserInfo = async () => {
        try {
            const userId = await idUser();
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/auth/getUser/${userId}`);
            setUserInfo(response.data);
        } catch (error) {
            console.error("Erreur récupération user:", error);
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/cours/getCourse/${id}`);
            setCourse(response.data[0]);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const fetchTravauxByActivite = async (activiteId) => {
        try {
            const userId = await idUser();
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/travaux/getByActiviteAndEtudiant/${activiteId}/${userId}`);
            setTravaux(prev => ({ ...prev, [activiteId]: response.data }));
        } catch (error) {
            console.error("Erreur chargement travaux:", error);
            setTravaux(prev => ({ ...prev, [activiteId]: [] }));
        }
    };

    const getChapitreAndActivite = async () => {
        try {
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/chapitre/getChapitreAndActivite/${id}`);
            
            const chapitresAvecRessources = await Promise.all(
                response.data.map(async (chap, chapIndex) => {
                    try {
                        const resResponse = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/ressource/getAllRessourceId/${chap.id_chapitre}`);
                        
                        // Charger les travaux pour chaque activité
                        if (chap.activites) {
                            chap.activites.forEach(act => {
                                fetchTravauxByActivite(act.id);
                            });
                        }
                        
                        // Récupérer la progression du chapitre depuis l'API avc
                        const userId = await idUser();
                        if (userId && userId !== 0) {
                            try {
                                const avcResponse = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/avc/avc/${id}/${userId}`);
                                const chapN = avcResponse.data?.chapN || 0;
                                
                                // Marquer comme complété si le chapitre est <= chapN
                                const isCompleted = chapIndex + 1 <= chapN;
                                setProgressionChapitres(prev => ({
                                    ...prev,
                                    [chap.id_chapitre]: isCompleted
                                }));
                            } catch (err) {
                                console.error("Erreur récupération progression chapitre:", err);
                            }
                        }
                        
                        return { ...chap, ressources: resResponse.data };
                    } catch (error) {
                        return { ...chap, ressources: [] };
                    }
                })
            );
            setChapitre(chapitresAvecRessources);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const fetchQuiz = async () => {
        try {
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/quiz/getQuiz/${id}`);
            setQuiz(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des quiz :", error);
        }
    };

    const toggleChapitre = (index) => {
        setOpenIndexc(openIndexc === index ? null : index);
    };

    const submitavc = async (nChapN) => {
        const userid = await idUser();
        if (!userid || userid === 0) return;
        
        let nch = nChapN;
        if (nChapN === 0) {
            nch = nChapN.toString();
        }
        try {
            await axios.post("http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/avc/createOrUpdateAvc", {
                idCours: id,
                iduser: userid,
                chapN: nch
            });
            
            // Mettre à jour la progression des chapitres localement
            setProgressionChapitres(prev => {
                const newState = { ...prev };
                chapitre.forEach((chap, idx) => {
                    if (idx + 1 <= nch) {
                        newState[chap.id_chapitre] = true;
                    }
                });
                return newState;
            });
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const ac = (index) => {
        toggleChapitre(index);
        submitavc(index + 1);
    };

    // Gestion du dépôt de travail
    const handleTravailChange = (e) => {
        setNouveauTravail(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTravailFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setNouveauTravail(prev => ({ ...prev, fichier: selectedFile }));
        }
    };

    const handleSubmitTravail = async (e) => {
        e.preventDefault();
        try {
            const userId = await idUser();
            const formData = new FormData();
            formData.append('titre', nouveauTravail.titre);
            formData.append('description', nouveauTravail.description);
            formData.append('id_activite', selectedActivite);
            formData.append('id_etudiant', userId);
            formData.append('lien', nouveauTravail.lien);
            
            if (nouveauTravail.fichier) {
                formData.append('fichier', nouveauTravail.fichier);
            }
            
            await axios.post("http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/travaux/create", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Travail soumis avec succès !');
            setShowTravailModal(false);
            setNouveauTravail({ titre: "", description: "", fichier: null, lien: "" });
            fetchTravauxByActivite(selectedActivite);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur lors de la soumission');
        }
    };

    // Gestion des réponses du questionnaire
    const handleReponseChange = (activiteId, questionIndex, value) => {
        setReponsesQuestionnaire(prev => ({
            ...prev,
            [`${activiteId}_${questionIndex}`]: value
        }));
    };

    const handleSubmitReponses = async (activiteId) => {
        // Récupérer toutes les réponses pour cette activité
        const activiteReponses = {};
        Object.keys(reponsesQuestionnaire).forEach(key => {
            if (key.startsWith(`${activiteId}_`)) {
                const questionIndex = key.split('_')[1];
                activiteReponses[questionIndex] = reponsesQuestionnaire[key];
            }
        });
        
        try {
            const userId = await idUser();
            await axios.post("http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/reponses/create", {
                id_activite: activiteId,
                id_etudiant: userId,
                reponses: activiteReponses
            });
            toast.success('Réponses soumises avec succès !');
        } catch (err) {
            toast.error(err.response?.data || 'Erreur lors de la soumission');
        }
    };

    // Fonction pour afficher le contenu de l'activité selon son type
    const renderActivityContent = (activite) => {
        if (activite.categorie === "questionnaire") {
            try {
                const questions = JSON.parse(activite.contenu);
                return (
                    <div>
                        <h6 style={{ marginBottom: '15px', color: '#28a745' }}>
                            <i className="fa fa-question-circle"></i> Questionnaire
                        </h6>
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} style={{ marginBottom: '20px', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                <p><strong>Question {qIndex + 1}:</strong> {q.texte}</p>
                            </div>
                        ))}
                    </div>
                );
            } catch (e) {
                return <div style={styles.textContent}>{activite.contenu}</div>;
            }
        }
        
        if (activite.categorie === "devoir") {
            try {
                const devoirData = JSON.parse(activite.contenu);
                return (
                    <div>
                        <h6 style={{ marginBottom: '15px', color: '#dc3545' }}>
                            <i className="fa fa-file-pdf"></i> Devoir
                        </h6>
                        {devoirData.date_limite && (
                            <p style={{ marginBottom: '10px', fontSize: '13px', color: '#856404', background: '#fff3cd', padding: '8px', borderRadius: '5px' }}>
                                <i className="fa fa-calendar"></i> Date limite: {new Date(devoirData.date_limite).toLocaleDateString()}
                            </p>
                        )}
                        {devoirData.fichier && (
                            <a 
                                href={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/activite/fichier/${devoirData.fichier}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ background: '#dc3545', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}
                            >
                                <i className="fa fa-download"></i> Télécharger le sujet du devoir
                            </a>
                        )}
                    </div>
                );
            } catch (e) {
                return <div style={styles.textContent}>{activite.contenu}</div>;
            }
        }
        
        if (activite.categorie === "video_interactive") {
            try {
                const videoData = JSON.parse(activite.contenu);
                return (
                    <div>
                        <h6 style={{ marginBottom: '15px', color: '#fd7e14' }}>
                            <i className="fa fa-play-circle"></i> Vidéo interactive
                        </h6>
                        <video controls style={styles.modalVideo}>
                            <source src={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/video/${videoData.video}`} type="video/mp4" />
                        </video>
                        {videoData.questions && videoData.questions.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h6 style={{ marginBottom: '10px' }}>Questions interactives:</h6>
                                {videoData.questions.map((q, qIndex) => (
                                    <div key={qIndex} style={{ marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                        <p><strong>À {q.timestamp} secondes:</strong> {q.texte}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            } catch (e) {
                return (
                    <div>
                        <video controls style={styles.modalVideo}>
                            <source src={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/video/${activite.contenu}`} type="video/mp4" />
                        </video>
                    </div>
                );
            }
        }
        
        // Types d'activités existants
        if (activite.categorie === "text") {
            return <div style={styles.textContent}>{activite.contenu}</div>;
        }
        if (activite.categorie === "image") {
            return <img src={activite.contenu} alt="contenu" style={styles.modalImage} />;
        }
        if (activite.categorie === "video") {
            return (
                <video controls style={styles.modalVideo}>
                    <source src={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/video/${activite.contenu}`} type="video/mp4" />
                </video>
            );
        }
        
        return <div style={styles.textContent}>{activite.contenu}</div>;
    };

    // Fonction pour afficher le contenu d'une ressource
    const renderRessourceContent = (ressource) => {
        if (ressource.type_ressource === 'video') {
            return (
                <div style={{ marginTop: '10px' }}>
                    <video 
                        controls 
                        style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }}
                        poster="/video-poster-placeholder.jpg"
                    >
                        <source src={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/ressource/video/${ressource.fichier}`} type="video/mp4" />
                        Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                </div>
            );
        }
        return null;
    };

    // Styles hiérarchiques
    const styles = {
        container: {
            padding: '20px 0'
        },
        chapterHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px 20px',
            background: 'linear-gradient(135deg, #ff5421 0%, #e03a00 100%)',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        chapterHeaderCompleted: {
            background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
        },
        chapterNumber: {
            width: '35px',
            height: '35px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
        },
        chapterTitle: {
            flex: 1,
            fontSize: '16px',
            fontWeight: '600'
        },
        chapterStats: {
            fontSize: '12px',
            opacity: 0.8
        },
        checkIcon: {
            marginLeft: '10px',
            fontSize: '16px'
        },
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            padding: '10px 15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#ff5421',
            marginBottom: '10px',
            borderLeft: '3px solid #ff5421'
        },
        activityItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 15px',
            marginBottom: '8px',
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        activityLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        activityIcon: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
        },
        activityTitle: {
            fontSize: '14px',
            color: '#333'
        },
        activityDuration: {
            fontSize: '12px',
            color: '#999',
            background: '#f5f5f5',
            padding: '4px 10px',
            borderRadius: '20px'
        },
        ressourceItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 15px',
            marginBottom: '8px',
            background: '#f0f7ff',
            border: '1px solid #e0e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        ressourceIcon: {
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
        },
        ressourceTitle: {
            fontSize: '13px',
            color: '#2c3e50',
            fontWeight: '500'
        },
        downloadBtn: {
            background: '#ff5421',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '5px',
            fontSize: '11px',
            textDecoration: 'none',
            transition: 'all 0.2s ease'
        },
        watchBtn: {
            background: '#17a2b8',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '5px',
            fontSize: '11px',
            textDecoration: 'none',
            transition: 'all 0.2s ease'
        },
        contentPanel: {
            padding: '15px',
            background: '#fafafa',
            borderRadius: '8px',
            marginTop: '8px',
            marginBottom: '15px',
            marginLeft: '20px',
            borderLeft: '2px solid #ff5421'
        },
        textContent: {
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#555'
        },
        modalImage: {
            maxWidth: '100%',
            maxHeight: '80vh',
            borderRadius: '8px'
        },
        modalVideo: {
            width: '100%',
            maxHeight: '80vh',
            borderRadius: '8px'
        },
        travauxSection: {
            marginTop: '15px',
            padding: '15px',
            background: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #eee'
        },
        travauxHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            flexWrap: 'wrap',
            gap: '10px'
        },
        travauxTitle: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#ff5421',
            margin: 0
        },
        submitButton: {
            background: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        travailCard: {
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '10px'
        },
        travailStatus: (status) => ({
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 500,
            background: status === 'note' ? '#d4edda' : '#fff3cd',
            color: status === 'note' ? '#155724' : '#856404'
        }),
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        modalContent: {
            background: '#fff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
        },
        modalHeader: {
            padding: '20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        modalBody: {
            padding: '20px'
        },
        modalFooter: {
            padding: '20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '15px'
        },
        textarea: {
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: '100px',
            marginBottom: '15px'
        },
        uploadArea: {
            border: '2px dashed #ddd',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '15px',
            transition: 'all 0.2s'
        },
        fileInfo: {
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
        },
        noteDisplay: {
            background: '#d4edda',
            padding: '8px 12px',
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '10px'
        },
        noteValue: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#155724'
        },
        videoContainer: {
            marginTop: '10px',
            borderRadius: '8px',
            overflow: 'hidden'
        }
    };

    const getActivityIcon = (categorie) => {
        const icons = {
            text: { icon: '📄', bg: '#e3f2fd', color: '#1976d2' },
            image: { icon: '🖼️', bg: '#e8f5e9', color: '#388e3c' },
            video: { icon: '🎥', bg: '#fff3e0', color: '#f57c00' },
            questionnaire: { icon: '📋', bg: '#e8f5e9', color: '#28a745' },
            devoir: { icon: '📚', bg: '#ffebee', color: '#dc3545' },
            video_interactive: { icon: '🎯', bg: '#fff3e0', color: '#fd7e14' }
        };
        return icons[categorie] || { icon: '📁', bg: '#f3e5f5', color: '#7b1fa2' };
    };

    const getRessourceIcon = (type_ressource, type_fichier) => {
        if (type_ressource === 'video') {
            return { icon: '🎬', bg: '#e8f5e9', color: '#2e7d32' };
        }
        const icons = {
            pdf: { icon: '📄', bg: '#ffebee', color: '#c62828' },
            word: { icon: '📝', bg: '#e3f2fd', color: '#1565c0' },
            powerpoint: { icon: '📊', bg: '#fff3e0', color: '#e65100' },
            excel: { icon: '📈', bg: '#e8f5e9', color: '#2e7d32' },
            other: { icon: '📁', bg: '#f5f5f5', color: '#616161' }
        };
        return icons[type_fichier] || icons.other;
    };

    return (
        <div style={styles.container}>
            <ToastContainer position="top-right" autoClose={3000} />
            
            {chapitre && chapitre.map((chapitre, idx) => {
                const isChapterCompleted = progressionChapitres[chapitre.id_chapitre] || false;
                
                return (
                    <div key={chapitre.id_chapitre} style={{ marginBottom: '15px' }}>
                        {/* En-tête du chapitre */}
                        <div 
                            style={{
                                ...styles.chapterHeader,
                                ...(isChapterCompleted ? styles.chapterHeaderCompleted : {})
                            }}
                            onClick={() => ac(idx)}
                        >
                            <div style={styles.chapterNumber}>
                                {isChapterCompleted ? '✓' : idx + 1}
                            </div>
                            <div style={styles.chapterTitle}>{chapitre.nom_chapitre}</div>
                            <div style={styles.chapterStats}>
                                {chapitre.ressources?.length > 0 && `${chapitre.ressources.length} ressources`}
                                {chapitre.ressources?.length > 0 && chapitre.activites?.length > 0 && ' • '}
                                {chapitre.activites?.length || 0} activités
                                {isChapterCompleted && (
                                    <span style={styles.checkIcon}> ✅</span>
                                )}
                            </div>
                        </div>

                        {/* Contenu du chapitre */}
                        {openIndexc === idx && (
                            <div style={{ paddingLeft: '20px', marginTop: '10px' }}>
                                {/* Section Ressources */}
                                {chapitre.ressources && chapitre.ressources.length > 0 && (
                                    <div style={styles.section}>
                                        <div style={styles.sectionTitle}>
                                            <i className="fa fa-download" style={{ marginRight: '8px' }}></i>
                                            Ressources pédagogiques
                                        </div>
                                        {chapitre.ressources.map((ressource, resIdx) => {
                                            const iconInfo = getRessourceIcon(ressource.type_ressource, ressource.type_fichier);
                                            const isVideo = ressource.type_ressource === 'video';
                                            
                                            return (
                                                <div key={ressource.id}>
                                                    <div 
                                                        style={styles.ressourceItem}
                                                        onClick={() => toggleRessource(ressource.id)}
                                                    >
                                                        <div style={styles.activityLeft}>
                                                            <div style={{...styles.activityIcon, background: iconInfo.bg, color: iconInfo.color, width: '28px', height: '28px'}}>
                                                                {iconInfo.icon}
                                                            </div>
                                                            <div style={styles.ressourceTitle}>{ressource.titre}</div>
                                                        </div>
                                                        {isVideo ? (
                                                            <span style={styles.watchBtn}>
                                                                <i className="fa fa-play"></i> Regarder
                                                            </span>
                                                        ) : (
                                                            <a 
                                                                href={ressource.fichier?.startsWith("http") ? ressource.fichier : `http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/ressource/fichier/${ressource.fichier}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={styles.downloadBtn}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <i className="fa fa-download"></i> Télécharger
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Affichage du contenu de la ressource (description et vidéo) */}
                                                    {openRessourceIndex[ressource.id] && (
                                                        <div style={{...styles.contentPanel, marginBottom: '8px'}}>
                                                            {ressource.description && (
                                                                <div style={styles.textContent}>
                                                                    <strong>Description :</strong> {ressource.description}
                                                                </div>
                                                            )}
                                                            {/* Affichage de la vidéo si c'est une ressource vidéo */}
                                                            {isVideo && (
                                                                <div style={styles.videoContainer}>
                                                                    <video 
                                                                        controls 
                                                                        style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', marginTop: '10px' }}
                                                                        controlsList="nodownload"
                                                                    >
                                                                        <source src={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/ressource/video/${ressource.fichier}`} type="video/mp4" />
                                                                        Votre navigateur ne supporte pas la lecture de vidéos.
                                                                    </video>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Section Activités */}
                                {chapitre.activites && chapitre.activites.length > 0 && (
                                    <div style={styles.section}>
                                        <div style={styles.sectionTitle}>
                                            <i className="fa fa-tasks" style={{ marginRight: '8px' }}></i>
                                            Activités pédagogiques
                                        </div>
                                        {chapitre.activites.map((activite, actIdx) => {
                                            const iconInfo = getActivityIcon(activite.categorie);
                                            const travauxEtudiant = travaux[activite.id] || [];
                                            const travailExistant = travauxEtudiant[0];
                                            const activityKey = `${idx}_${activite.id}`;
                                            
                                            return (
                                                <div key={activite.id}>
                                                    <div 
                                                        style={styles.activityItem}
                                                        onClick={() => toggleActivite(idx, activite.id)}
                                                    >
                                                        <div style={styles.activityLeft}>
                                                            <div style={{...styles.activityIcon, background: iconInfo.bg, color: iconInfo.color}}>
                                                                {iconInfo.icon}
                                                            </div>
                                                            <div style={styles.activityTitle}>{activite.titre}</div>
                                                        </div>
                                                        <div style={styles.activityDuration}>
                                                            <i className="fa fa-tag" style={{ marginRight: '4px' }}></i>
                                                            {activite.categorie === 'questionnaire' ? 'Questionnaire' : 
                                                             activite.categorie === 'devoir' ? 'Devoir' : 
                                                             activite.categorie === 'video_interactive' ? 'Vidéo interactive' : 
                                                             activite.categorie}
                                                        </div>
                                                    </div>

                                                    {openIndex[activityKey] && (
                                                        <div style={styles.contentPanel}>
                                                            {/* Contenu de l'activité selon son type */}
                                                            {renderActivityContent(activite)}

                                                            {/* SECTION DÉPÔT DE TRAVAIL - Uniquement pour les devoirs et vidéos interactives */}
                                                            {(activite.categorie === 'devoir' || activite.categorie === 'video_interactive') && (
                                                                <div style={styles.travauxSection}>
                                                                    <div style={styles.travauxHeader}>
                                                                        <h5 style={styles.travauxTitle}>
                                                                            <i className="fa fa-upload" style={{ marginRight: '8px' }}></i>
                                                                            Mon travail
                                                                        </h5>
                                                                        <button 
                                                                            onClick={() => {
                                                                                setSelectedActivite(activite.id);
                                                                                setShowTravailModal(true);
                                                                            }}
                                                                            style={styles.submitButton}
                                                                        >
                                                                            <i className="fa fa-plus"></i>
                                                                            {travailExistant ? 'Modifier mon travail' : 'Déposer mon travail'}
                                                                        </button>
                                                                    </div>

                                                                    {travailExistant ? (
                                                                        <div style={styles.travailCard}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                                                <div style={{ flex: 1 }}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                                                        <strong>{travailExistant.titre}</strong>
                                                                                        <span style={styles.travailStatus(travailExistant.note ? 'note' : 'rendu')}>
                                                                                            {travailExistant.note ? 'Noté' : 'Soumis'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{travailExistant.description}</p>
                                                                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                                                                        <i className="fa fa-calendar"></i> Soumis le: {new Date(travailExistant.date_rendu).toLocaleDateString()}
                                                                                    </div>
                                                                                    {travailExistant.lien && (
                                                                                        <a href={travailExistant.lien} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#ff5421', display: 'inline-block', marginTop: '8px' }}>
                                                                                            <i className="fa fa-link"></i> Voir le lien
                                                                                        </a>
                                                                                    )}
                                                                                    {travailExistant.fichier && (
                                                                                        <a href={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/travaux/fichier/${travailExistant.fichier}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#ff5421', display: 'inline-block', marginLeft: '15px', marginTop: '8px' }}>
                                                                                            <i className="fa fa-download"></i> Télécharger
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {travailExistant.note && (
                                                                                <div style={styles.noteDisplay}>
                                                                                    <div style={styles.noteValue}>Note: {travailExistant.note}/20</div>
                                                                                    {travailExistant.commentaire && (
                                                                                        <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                                                                            <strong>Commentaire:</strong> {travailExistant.commentaire}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ textAlign: 'center', padding: '20px', color: '#999', background: '#fff', borderRadius: '8px' }}>
                                                                            <i className="fa fa-inbox fa-2x mb-2"></i>
                                                                            <p>Vous n'avez pas encore soumis de travail</p>
                                                                            <small>Cliquez sur "Déposer mon travail" pour partager votre réponse</small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Modal pour déposer un travail */}
            {showTravailModal && (
                <div style={styles.modalOverlay} onClick={() => setShowTravailModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Déposer mon travail</h3>
                            <button onClick={() => setShowTravailModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmitTravail}>
                            <div style={styles.modalBody}>
                                <input 
                                    type="text" 
                                    name="titre" 
                                    placeholder="Titre de votre travail" 
                                    value={nouveauTravail.titre} 
                                    onChange={handleTravailChange} 
                                    style={styles.input} 
                                    required 
                                />
                                <textarea 
                                    name="description" 
                                    placeholder="Description / Réponse" 
                                    value={nouveauTravail.description} 
                                    onChange={handleTravailChange} 
                                    style={styles.textarea} 
                                    required 
                                />
                                <input 
                                    type="url" 
                                    name="lien" 
                                    placeholder="Lien vers votre travail (Google Drive, etc.)" 
                                    value={nouveauTravail.lien} 
                                    onChange={handleTravailChange} 
                                    style={styles.input} 
                                />
                                <div style={styles.uploadArea} onClick={() => document.getElementById('travailFileInput').click()}>
                                    {nouveauTravail.fichier ? (
                                        <>
                                            <i className="fa fa-file fa-3x" style={{ color: '#ff5421' }}></i>
                                            <p>{nouveauTravail.fichier.name}</p>
                                            <small>Cliquez pour changer</small>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-cloud-upload-alt fa-3x" style={{ color: '#ff5421' }}></i>
                                            <p>Cliquez pour joindre un fichier (optionnel)</p>
                                            <small>PDF, Word, Image, ZIP (max 50MB)</small>
                                        </>
                                    )}
                                    <input type="file" id="travailFileInput" onChange={handleTravailFileChange} hidden />
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={() => setShowTravailModal(false)} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
                                <button type="submit" style={{ background: '#ff5421', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Soumettre</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CurriculumPart;
