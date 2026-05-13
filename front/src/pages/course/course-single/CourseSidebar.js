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
    const [course, setCourse] = useState(null); // Changé de [] à null
    const [edu, setEdu] = useState(0);
    const [complete, setComplete] = useState(0);
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
                fetchDataC(userid)
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
            console.log("Cours récupéré:", response.data);
            // La réponse est directement l'objet cours, pas un tableau
            setCourse(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération du cours:", error);
            setCourse(null);
        }
    };

    const fetchEdu = async () => {
        try {
            const response = await axios.get(`${API_URL}/lecture/count/${id}`);
            console.log("Nombre d'étudiants:", response.data);
            setEdu(response.data || 0);
        } catch (error) {
            console.error("Erreur lors de la récupération des étudiants:", error);
            setEdu(0);
        }
    };

    const fetchDataC = async (userid) => {
        if (!userid || userid === 0) {
            setComplete(0);
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/avc/avc/${id}/${userid}`);
            console.log("Progression récupérée:", response.data);
            const progress = response.data?.avc || response.data?.progress || 0;
            setComplete(progress);
        } catch (error) {
            console.error('Error fetching AVC data:', error);
            setComplete(0);
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

    // Couleur de la progression
    const getProgressColor = (value) => {
        if (value >= 100) return '#28a745';
        if (value >= 70) return '#17a2b8';
        if (value >= 30) return '#ffc107';
        return '#dc3545';
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

    const progressValue = complete || 0;
    const progressColor = getProgressColor(progressValue);
    const formattedDuration = formatDuration(course.duration);

    return (
        <div className="inner-column">
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
            
<br>
</br>     
<QR/>   
<br/> 
            
            {/* Barre de progression corrigée */}
            <div className="max-w-sm mx-auto bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
                <div className="px-5 py-3 flex justify-between items-center">
                    <h3 className="text-zinc-900 dark:text-white text-lg">Progression</h3>
                    <svg
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-6 w-6 text-zinc-900 dark:text-white"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <div className="px-5 pb-5">
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${progressValue}%`, backgroundColor: progressColor }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {Math.round(progressValue)}% Completé
                        </span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {progressValue === 100 ? '✅ Terminé' : '📚 En cours'}
                        </span>
                    </div>
                    
                    {/* Message de progression */}
                    {progressValue > 0 && progressValue < 100 && (
                        <div className="mt-3 text-center">
                            <Link 
                                to={`/course/course/${id}`}
                                className="inline-block w-full text-center py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                style={{ backgroundColor: '#ff5421' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                            >
                                <i className="fas fa-play-circle me-2"></i>
                                Reprendre le cours
                            </Link>
                        </div>
                    )}
                    
                    {progressValue === 0 && (
                        <div className="mt-3 text-center">
                            <Link 
                                to={`/course/course/${id}`}
                                className="inline-block w-full text-center py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                style={{ backgroundColor: '#ff5421' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                            >
                                <i className="fas fa-play me-2"></i>
                                Commencer
                            </Link>
                        </div>
                    )}
                    
                    {progressValue === 100 && (
                        <div className="mt-3 text-center">
                            <div className="text-green-600 font-semibold">
                                <i className="fas fa-trophy me-2"></i>
                                Félicitations ! Cours terminé
                            </div>
                            <Link 
                                to={`/course/course/${id}`}
                                className="inline-block w-full text-center py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mt-2"
                            >
                                <i className="fas fa-redo me-2"></i>
                                Revoir le cours
                            </Link>
                        </div>
                    )}
                </div>
            </div>      
        </div>
    );
};

export default CourseSidebar;
