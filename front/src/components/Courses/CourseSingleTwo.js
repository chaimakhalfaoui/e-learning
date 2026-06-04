import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://isetso-alb-1947778921.us-east-1.elb.amazonaws.com/api';

const CourseSingleTwo = (props) => {
    const { 
        courseid, 
        courseClass, 
        courseImg, 
        courseTitle, 
        courseDescription,
        courseCategory, 
        courseDuration,
        catLink,
        studentCount: initialStudentCount,
        onStudentCountChange
    } = props;
    
    const { idUser } = useAuth();
    const [studentCount, setStudentCount] = useState(initialStudentCount || 0);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();

    // Ajout des styles d'animation une seule fois
    useEffect(() => {
        if (!document.querySelector('#modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    const fetchStudentCount = async () => {
        if (!courseid) return;
        
        try {
            const response = await axios.get(`${API_URL}/lecture/count/${courseid}`);
            
            let count = 0;
            if (typeof response.data === 'number') {
                count = response.data;
            } else if (response.data && typeof response.data === 'object') {
                count = response.data.lectureCount || response.data.count || 0;
            }
            
            setStudentCount(count);
            
            if (onStudentCountChange) {
                onStudentCountChange(courseid, count);
            }
        } catch (error) {
            console.error(`Erreur pour le cours ${courseid}:`, error);
            setStudentCount(0);
        }
    };

    const enrollStudent = async (userId) => {
        try {
            const response = await axios.post(`${API_URL}/lecture/create`, {
                id_cours: courseid,
                id_user: userId,
                avancement: 0
            });
            
            return response.data;
        } catch (error) {
            console.error("Erreur d'inscription:", error);
            throw error;
        }
    };

    const formatStudentCount = (count) => {
        if (!count && count !== 0) return '0';
        const numCount = parseInt(count) || 0;
        if (numCount >= 1000) {
            return (numCount / 1000).toFixed(1) + 'k';
        }
        return numCount.toString();
    };

    const formatDuration = (duration) => {
        if (!duration) return null;
        
        if (typeof duration === 'string') return duration;
        
        const hours = parseFloat(duration);
        if (isNaN(hours)) return null;
        
        if (hours < 1) {
            const minutes = Math.round(hours * 60);
            return `${minutes} min`;
        }
        
        if (hours % 1 === 0) {
            return `${hours} h`;
        }
        
        const heures = Math.floor(hours);
        const minutes = Math.round((hours - heures) * 60);
        
        if (minutes === 0) return `${heures} h`;
        return `${heures} h ${minutes} min`;
    };

    const handleOpenConfirmModal = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleCloseModal = () => {
        setShowConfirmModal(false);
    };

    const handleConfirmEnrollment = async () => {
        setShowConfirmModal(false);
        
        const userId = await idUser();
        
        if (!userId || userId === 0) {
            toast.info("Veuillez vous connecter pour vous inscrire");
            navigate('/login');
            return;
        }
        
        try {
            setIsEnrolling(true);
            await enrollStudent(userId);
            toast.success(`Inscription réussie au cours "${courseTitle}" !`);
            await fetchStudentCount();
            
            setTimeout(() => {
                navigate(`/course/course/${courseid}`);
            }, 1500);
            
        } catch (error) {
            console.error("Erreur:", error);
            
            if (error.response?.status === 400 || error.response?.status === 409) {
                toast.info("Vous êtes déjà inscrit à ce cours");
                setTimeout(() => {
                    navigate(`/course/course/${courseid}`);
                }, 1000);
            } else {
                toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    useEffect(() => {
        if (initialStudentCount !== undefined && initialStudentCount !== null) {
            setStudentCount(initialStudentCount);
        } else {
            fetchStudentCount();
        }
    }, [courseid, initialStudentCount]);

    const truncateDescription = (text, maxLength = 80) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const formattedDuration = formatDuration(courseDuration);
    const formattedStudentCount = formatStudentCount(studentCount);
    const truncatedDesc = truncateDescription(courseDescription);

    const studentLabel = () => {
        const count = parseInt(studentCount) || 0;
        if (count === 0) return '0 Étudiant';
        if (count === 1) return '1 Étudiant';
        return `${count} Étudiants`;
    };

    const modalStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        },
        modal: {
            backgroundColor: '#fff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '450px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        },
        header: {
            padding: '20px',
            backgroundColor: '#ff5421',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title: {
            margin: 0,
            fontSize: '20px',
            fontWeight: '600'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '0',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
        },
        body: {
            padding: '25px'
        },
        courseInfo: {
            textAlign: 'center',
            marginBottom: '20px'
        },
        courseTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
        },
        courseDetails: {
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            fontSize: '13px',
            color: '#666',
            marginBottom: '15px'
        },
        warning: {
            backgroundColor: '#fff3cd',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#856404',
            marginTop: '15px',
            textAlign: 'center'
        },
        footer: {
            padding: '20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
        },
        cancelBtn: {
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
        },
        confirmBtn: {
            padding: '10px 25px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        }
    };

    return (
        <>
            <div className={courseClass ? courseClass : 'courses-item'}>
                <div className="img-part" style={{ position: 'relative' }}>
                    <Link to={`/course/course/${courseid}`}>
                        <img
                            src={courseImg || "/placeholder.svg"}
                            alt={courseTitle || "Cours"}
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = "/placeholder.svg";
                            }}
                        />
                        {courseCategory && (
                            <span className="course-category" style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                backgroundColor: '#ff5421',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                zIndex: 1
                            }}>
                                {courseCategory}
                            </span>
                        )}
                        {formattedDuration && (
                            <span style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                zIndex: 1
                            }}>
                                <i className="fa fa-clock-o me-1"></i> {formattedDuration}
                            </span>
                        )}
                    </Link>
                </div>
                <div className="content-part">
                    <ul className="meta-part">
                        <li>
                            <Link className="categorie" to={catLink ? catLink : `/courses/category/${courseid}`}>
                                {courseCategory ? courseCategory : 'Catégorie'}
                            </Link>
                        </li>
                    </ul>
                    
                    <h3 className="title">
                        <Link to={`/course/course/${courseid}`}>
                            {courseTitle ? courseTitle : 'Titre du cours'}
                        </Link>
                    </h3>
                    
                    {courseDescription && (
                        <p className="course-description" style={{
                            fontSize: '13px',
                            color: '#666',
                            marginBottom: '10px',
                            lineHeight: '1.4',
                            minHeight: '40px'
                        }}>
                            {truncatedDesc}
                        </p>
                    )}
                    
                    <div className="bottom-part">
                        <div className="info-meta">
                            <ul>
                                <li className="user" title="Nombre d'étudiants inscrits">
                                    <i className="fa fa-user"></i> 
                                    <span style={{ marginLeft: '4px' }}>{studentLabel()}</span>
                                </li>
                                {formattedDuration && (
                                    <li className="duration" style={{ marginLeft: '15px' }}>
                                        <i className="fa fa-clock-o"></i> 
                                        <span style={{ marginLeft: '4px' }}>{formattedDuration}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="btn-part">
                            <button 
                                onClick={handleOpenConfirmModal}
                                disabled={isEnrolling}
                                style={{
                                    backgroundColor: '#ff5421',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 15px',
                                    borderRadius: '5px',
                                    cursor: isEnrolling ? 'wait' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: isEnrolling ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isEnrolling) e.target.style.backgroundColor = '#e03a00';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isEnrolling) e.target.style.backgroundColor = '#ff5421';
                                }}
                                aria-label="S'inscrire au cours"
                            >
                                {isEnrolling ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    "S'inscrire"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale de confirmation */}
            {showConfirmModal && (
                <div style={modalStyles.overlay} onClick={handleCloseModal}>
                    <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={modalStyles.header}>
                            <h3 style={modalStyles.title}>
                                <i className="fas fa-graduation-cap me-2"></i>
                                Confirmation d'inscription
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                style={modalStyles.closeBtn}
                            >
                                ×
                            </button>
                        </div>
                        <div style={modalStyles.body}>
                            <div style={modalStyles.courseInfo}>
                                <div style={modalStyles.courseTitle}>
                                    {courseTitle}
                                </div>
                                <div style={modalStyles.courseDetails}>
                                    {courseCategory && (
                                        <span>
                                            <i className="fas fa-tag me-1" style={{ color: '#ff5421' }}></i>
                                            {courseCategory}
                                        </span>
                                    )}
                                    {formattedDuration && (
                                        <span>
                                            <i className="fas fa-clock me-1" style={{ color: '#ff5421' }}></i>
                                            {formattedDuration}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p style={{ textAlign: 'center', marginBottom: '10px' }}>
                                Voulez-vous vraiment vous inscrire à ce cours ?
                            </p>
                            <div style={modalStyles.warning}>
                                <i className="fas fa-info-circle me-2"></i>
                                Une fois inscrit, vous aurez accès à toutes les ressources du cours.
                            </div>
                        </div>
                        <div style={modalStyles.footer}>
                            <button 
                                onClick={handleCloseModal}
                                style={modalStyles.cancelBtn}
                            >
                                <i className="fas fa-times me-1"></i>
                                Annuler
                            </button>
                            <button 
                                onClick={handleConfirmEnrollment}
                                style={modalStyles.confirmBtn}
                            >
                                <i className="fas fa-check me-1"></i>
                                Confirmer l'inscription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

CourseSingleTwo.defaultProps = {
    courseClass: 'courses-item',
    courseTitle: 'Titre du cours',
    courseImg: null,
    courseCategory: null,
    courseDescription: null,
    courseDuration: null,
    catLink: null,
    courseid: null,
    studentCount: null,
    onStudentCountChange: null
};

export default CourseSingleTwo;