import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalVideo from 'react-modal-video';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/authContext'; 
import QR from './QR'; 

// Image
import videoImg from '../../../assets/img/about/about-video-bg2.png';

const API_URL = 'http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api';

const CourseSidebar = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [edu, setEdu] = useState(0);
    const [progression, setProgression] = useState(0);  // avc = pourcentage
    const [chapN, setChapN] = useState(0);              // numéro du chapitre en cours
    const [totalChapitres, setTotalChapitres] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { idUser } = useAuth();

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const userid = await idUser();
            await Promise.all([
                fetchCourse(),
                fetchEdu(),
                fetchProgression(userid),
                fetchTotalChapitres()
            ]);
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`${API_URL}/cours/getCourse/${id}`);
            setCourse(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération du cours:", error);
            setCourse(null);
        }
    };

    const fetchEdu = async () => {
        try {
            const response = await axios.get(`${API_URL}/lecture/count/${id}`);
<<<<<<< HEAD
=======
            console.log("Nombre d'étudiants:", response.data);
>>>>>>> 08659bf02d98d91ae50074d86f666aa0ce63aeb7
            setEdu(response.data || 0);
        } catch (error) {
            console.error("Erreur lors de la récupération des étudiants:", error);
            setEdu(0);
        }
    };

    // Récupérer le nombre total de chapitres du cours
    const fetchTotalChapitres = async () => {
        try {
            const response = await axios.get(`${API_URL}/chapitre/getChapitre/${id}`);
            const chapitres = response.data;
            // Si response.data est un tableau
            const count = Array.isArray(chapitres) ? chapitres.length : 1;
            setTotalChapitres(count);
        } catch (error) {
            console.error("Erreur récupération chapitres:", error);
            setTotalChapitres(0);
        }
    };

    // Récupérer la progression depuis l'API avc
    const fetchProgression = async (userid) => {
        if (!userid || userid === 0) {
            setProgression(0);
            setChapN(0);
            return;
        }
        
        try {
            // Appel à votre API getAvcByIds
            const response = await axios.get(`${API_URL}/avc/avc/${id}/${userid}`);
            
            // Votre API retourne { avc, chapN, idCours, iduser }
            const avcValue = response.data?.avc || 0;
            const chapNValue = response.data?.chapN || 0;
            
            setProgression(Math.round(avcValue));
            setChapN(chapNValue);
            
            console.log(`Progression du cours ${id}: ${avcValue}% (chapitre ${chapNValue}/${totalChapitres})`);
            
        } catch (error) {
            console.error("Erreur chargement progression:", error);
            setProgression(0);
            setChapN(0);
        }
    };

    // Mettre à jour la progression quand l'étudiant avance
    const updateProgression = async (nouveauChapitre) => {
        const userid = await idUser();
        if (!userid || userid === 0) return;
        
        try {
            await axios.post(`${API_URL}/avc/createOrUpdateAvc`, {
                idCours: id,
                iduser: userid,
                chapN: nouveauChapitre
            });
            
            // Recharger la progression
            await fetchProgression(userid);
        } catch (error) {
            console.error("Erreur mise à jour progression:", error);
        }
    };

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const formatDuration = (duration) => {
        if (!duration) return 'Non définie';
        const hours = parseFloat(duration);
        if (isNaN(hours)) return 'Non définie';
        if (hours === 1) return '1 heure';
        if (hours % 1 === 0) return `${hours} heures`;
        return `${hours} heures`;
    };

    // Couleur de la barre de progression selon le pourcentage
    const getProgressColor = (value) => {
        if (value >= 100) return '#28a745';  // Vert - terminé
        if (value >= 70) return '#17a2b8';   // Bleu - presque fini
        if (value >= 30) return '#ffc107';   // Jaune - en cours
        if (value > 0) return '#fd7e14';     // Orange - débuté
        return '#dc3545';                     // Rouge - non commencé
    };

    // Message selon la progression
    const getProgressMessage = (value) => {
        if (value === 0) return '📚 Commencez votre apprentissage';
        if (value < 30) return '📖 Continuez, vous êtes au début !';
        if (value < 70) return '📈 Bonne progression, continuez !';
        if (value < 100) return '🏁 Presque terminé, encore un effort !';
        return '🎉 Félicitations ! Cours terminé avec succès !';
    };

    if (loading) {
        return (
            <div className="inner-column">
                <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2">Chargement des informations...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="inner-column">
                <div className="alert alert-warning text-center">
                    <i className="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
                    <h5>Cours non trouvé</h5>
                    <p>Le cours que vous recherchez n'existe pas ou a été supprimé.</p>
                    <Link to="/course" className="btn btn-primary">
                        <i className="fa fa-arrow-left me-2"></i>Retour aux cours
                    </Link>
                </div>
            </div>
        );
    }

    const progressionValue = Math.min(100, Math.max(0, progression));
    const progressColor = getProgressColor(progressionValue);
    const formattedDuration = formatDuration(course.duration);
    const chapitreActuel = chapN;
    const progressionText = progressionValue === 100 ? 'Terminé' : `${Math.round(progressionValue)}%`;

    return (
        <div className="inner-column">
            {/* Vidéo d'aperçu */}
            <ModalVideo 
                channel='youtube' 
                isOpen={isOpen} 
                videoId='YLN1Argi7ik' 
                onClose={closeModal} 
            />
            
            <div className="intro-video media-icon orange-color2">
                {course.image ? (
                    <img 
                        className="video-img" 
                        src={course.image && course.image.startsWith("http") ? course.image : `${API_URL}/image/${course.image}`} 
                        alt="Video Image" 
                        style={{ width: '100%', borderRadius: '10px' }}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x250?text=Image+non+disponible";
                        }}
                    />
                ) : (
                    <img 
                        className="video-img" 
                        src={videoImg} 
                        alt="Default Video" 
                        style={{ width: '100%', borderRadius: '10px' }}
                    />
                )}
                <Link className="popup-videos" onClick={openModal}>
                    <i className="fa fa-play"></i>
                </Link>
                <h4>Aperçu de ce cours</h4>
            </div>
            
            <br />
            
            {/* Forum de discussion */}
            <QR />   
            <br /> 
            
            {/* Barre de progression - Version fonctionnelle */}
            <div className="card shadow-sm border-0 rounded-lg">
                <div className="card-body p-4">
                    <h5 className="card-title text-center mb-4">
                        <i className="fas fa-chart-line me-2" style={{ color: '#ff5421' }}></i>
                        Ma progression
                    </h5>
                    
                    {/* Pourcentage central */}
                    <div className="text-center mb-3">
                        <div className="display-4 fw-bold" style={{ color: progressColor }}>
                            {Math.round(progressionValue)}%
                        </div>
                        <small className="text-muted">de progression</small>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="progress mb-3" style={{ height: '12px', borderRadius: '10px', backgroundColor: '#e9ecef' }}>
                        <div 
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            style={{ 
                                width: `${progressionValue}%`, 
                                backgroundColor: progressColor,
                                borderRadius: '10px',
                                transition: 'width 0.5s ease-in-out'
                            }}
                        />
                    </div>
                    
                    {/* Informations supplémentaires */}
                    <div className="row text-center mt-3">
                        <div className="col-6">
                            <div className="border-end">
                                <small className="text-muted">Chapitre</small>
                                <div className="fw-bold">{chapitreActuel}/{totalChapitres || '?'}</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <small className="text-muted">Statut</small>
                            <div className="fw-bold" style={{ color: progressColor }}>
                                {progressionValue === 100 ? 'Terminé' : 'En cours'}
                            </div>
                        </div>
                    </div>
                    
                    {/* Message de motivation */}
                    <div className="text-center mt-3 p-2 bg-light rounded">
                        <small className="text-muted">
                            <i className="fas fa-lightbulb me-1" style={{ color: '#ffc107' }}></i>
                            {getProgressMessage(progressionValue)}
                        </small>
                    </div>
                    
                    {/* Bouton d'action */}
                    <div className="mt-4">
                        {progressionValue === 0 && (
                            <Link 
                                to={`/course/course/${id}`}
                                className="btn w-100 text-white py-2"
                                style={{ backgroundColor: '#ff5421' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                            >
                                <i className="fas fa-play me-2"></i>
                                Commencer le cours
                            </Link>
                        )}
                        
                        {progressionValue > 0 && progressionValue < 100 && (
                            <Link 
                                to={`/course/course/${id}`}
                                className="btn w-100 text-white py-2"
                                style={{ backgroundColor: '#ff5421' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                            >
                                <i className="fas fa-play-circle me-2"></i>
                                Continuer ({Math.round(progressionValue)}%)
                            </Link>
                        )}
                        
                        {progressionValue === 100 && (
                            <div>
                                <div className="text-center mb-2 p-2 bg-success bg-opacity-10 rounded">
                                    <i className="fas fa-trophy text-warning me-2"></i>
                                    <span className="text-success fw-semibold">Cours terminé !</span>
                                </div>
                                <Link 
                                    to={`/course/course/${id}`}
                                    className="btn w-100 text-white py-2"
                                    style={{ backgroundColor: '#6c757d' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                                >
                                    <i className="fas fa-redo me-2"></i>
                                    Revoir le cours
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseSidebar;
