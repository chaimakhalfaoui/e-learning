import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import ModalVideo from 'react-modal-video';
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

    const [openIndex, setOpenIndex] = useState(null);
    const [openIndexc, setOpenIndexc] = useState(null);
    const [openRessourceIndex, setOpenRessourceIndex] = useState(null);

    const toggleActivite = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const toggleRessource = (index) => {
        setOpenRessourceIndex(openRessourceIndex === index ? null : index);
    };

    useEffect(() => {
        fetchQuiz();
        fetchCourse();
        getChapitreAndActivite();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`process.env.REACT_APP_API_URL/cours/getCourse/${id}`);
            setCourse(response.data[0]);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const getChapitreAndActivite = async () => {
        try {
            const response = await axios.get(`process.env.REACT_APP_API_URL/chapitre/getChapitreAndActivite/${id}`);
            
            // Récupérer les ressources pour chaque chapitre
            const chapitresAvecRessources = await Promise.all(
                response.data.map(async (chap) => {
                    try {
                        const resResponse = await axios.get(`process.env.REACT_APP_API_URL/ressource/getAllRessourceId/${chap.id_chapitre}`);
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
            const response = await axios.get(`process.env.REACT_APP_API_URL/quiz/getQuiz/${id}`);
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
        let nch = nChapN;
        if (nChapN === 0) {
            nch = nChapN.toString();
        }
        try {
            await axios.post("process.env.REACT_APP_API_URL/avc/createOrUpdateAvc", {
                idCours: id,
                iduser: userid,
                chapN: nch
            });
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const ac = (index) => {
        toggleChapitre(index);
        submitavc(index);
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
            maxWidth: '100%',
            maxHeight: '80vh',
            borderRadius: '8px'
        }
    };

    const getActivityIcon = (categorie) => {
        switch(categorie) {
            case 'text': return { icon: '📄', bg: '#e3f2fd', color: '#1976d2' };
            case 'image': return { icon: '🖼️', bg: '#e8f5e9', color: '#388e3c' };
            case 'video': return { icon: '🎥', bg: '#fff3e0', color: '#f57c00' };
            default: return { icon: '📁', bg: '#f3e5f5', color: '#7b1fa2' };
        }
    };

    const getRessourceIcon = (type) => {
        const icons = {
            pdf: { icon: '📄', bg: '#ffebee', color: '#c62828' },
            word: { icon: '📝', bg: '#e3f2fd', color: '#1565c0' },
            powerpoint: { icon: '📊', bg: '#fff3e0', color: '#e65100' },
            excel: { icon: '📈', bg: '#e8f5e9', color: '#2e7d32' },
            other: { icon: '📁', bg: '#f5f5f5', color: '#616161' }
        };
        return icons[type] || icons.other;
    };

    return (
        <div style={styles.container}>
            {chapitre && chapitre.map((chapitre, idx) => (
                <div key={chapitre.id_chapitre} style={{ marginBottom: '15px' }}>
                    {/* En-tête du chapitre */}
                    <div 
                        style={styles.chapterHeader}
                        onClick={() => ac(idx)}
                    >
                        <div style={styles.chapterNumber}>{idx + 1}</div>
                        <div style={styles.chapterTitle}>{chapitre.nom_chapitre}</div>
                        <div style={styles.chapterStats}>
                            {chapitre.ressources?.length > 0 && `${chapitre.ressources.length} ressources`}
                            {chapitre.ressources?.length > 0 && chapitre.activites?.length > 0 && ' • '}
                            {chapitre.activites?.length || 0} activités
                        </div>
                    </div>

                    {/* Contenu du chapitre (affiché si ouvert) */}
                    {openIndexc === idx && (
                        <div style={{ paddingLeft: '20px', marginTop: '10px' }}>
                            {/* Section Ressources - MIS EN PREMIER */}
                            {chapitre.ressources && chapitre.ressources.length > 0 && (
                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>
                                        <i className="fa fa-download" style={{ marginRight: '8px' }}></i>
                                        Ressources à télécharger
                                    </div>
                                    {chapitre.ressources.map((ressource, resIdx) => {
                                        const iconInfo = getRessourceIcon(ressource.type_fichier);
                                        return (
                                            <div key={resIdx}>
                                                <div 
                                                    style={styles.ressourceItem}
                                                    onClick={() => toggleRessource(resIdx)}
                                                >
                                                    <div style={styles.activityLeft}>
                                                        <div style={{...styles.activityIcon, background: iconInfo.bg, color: iconInfo.color, width: '28px', height: '28px'}}>
                                                            {iconInfo.icon}
                                                        </div>
                                                        <div style={styles.ressourceTitle}>{ressource.titre}</div>
                                                    </div>
                                                    <a 
                                                        href={`process.env.REACT_APP_API_URL/ressource/fichier/${ressource.fichier}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={styles.downloadBtn}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <i className="fa fa-download"></i> Télécharger
                                                    </a>
                                                </div>

                                                {openRessourceIndex === resIdx && ressource.description && (
                                                    <div style={{...styles.contentPanel, marginBottom: '8px'}}>
                                                        <div style={styles.textContent}>
                                                            <strong>Description :</strong> {ressource.description}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Section Activités - MIS EN SECOND */}
                            {chapitre.activites && chapitre.activites.length > 0 && (
                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>
                                        <i className="fa fa-tasks" style={{ marginRight: '8px' }}></i>
                                        Activités pédagogiques
                                    </div>
                                    {chapitre.activites.map((activite, actIdx) => {
                                        const iconInfo = getActivityIcon(activite.categorie);
                                        return (
                                            <div key={actIdx}>
                                                <div 
                                                    style={styles.activityItem}
                                                    onClick={() => toggleActivite(actIdx)}
                                                >
                                                    <div style={styles.activityLeft}>
                                                        <div style={{...styles.activityIcon, background: iconInfo.bg, color: iconInfo.color}}>
                                                            {iconInfo.icon}
                                                        </div>
                                                        <div style={styles.activityTitle}>{activite.titre}</div>
                                                    </div>
                                                    <div style={styles.activityDuration}>
                                                        <i className="fa fa-clock-o" style={{ marginRight: '4px' }}></i>
                                                        {activite.duration} min
                                                    </div>
                                                </div>

                                                {openIndex === actIdx && (
                                                    <div style={styles.contentPanel}>
                                                        {activite.categorie === "text" && (
                                                            <div style={styles.textContent}>
                                                                {activite.contenu}
                                                            </div>
                                                        )}
                                                        {activite.categorie === "image" && (
                                                            <div className='ext-modal'>
                                                                <button className='btn-fermer-modal' onClick={() => toggleActivite(null)}>
                                                                    <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/>
                                                                </button>
                                                                <div className='img-modal-ext'>
                                                                    <img src={`process.env.REACT_APP_API_URL/image/${activite.contenu}`} alt="image" style={styles.modalImage} />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {activite.categorie === "video" && (
                                                            <div className='ext-modal'>
                                                                <button className='btn-fermer-modal' onClick={() => toggleActivite(null)}>
                                                                    <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/>
                                                                </button>
                                                                <div className='img-modal-ext'>
                                                                    <video controls style={styles.modalVideo}>
                                                                        <source src={`process.env.REACT_APP_API_URL/video/${activite.contenu}`} type="video/mp4" />
                                                                    </video>
                                                                </div>
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
            ))}
        </div>
    );
}

export default CurriculumPart;