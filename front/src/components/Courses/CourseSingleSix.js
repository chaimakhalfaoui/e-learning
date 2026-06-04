// components/Courses/CourseSingleSix.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';

const API_URL = 'http://isetso-alb-1947778921.us-east-1.elb.amazonaws.com/api';

const CourseSingleSix = (props) => {
    const { 
        courseid, 
        courseClass, 
        courseImg, 
        courseTitle, 
        courseDescription,
        courseCategory, 
        courseDuration,
        catLink,
        initialProgression = 0,
        showProgress = false
    } = props;
    
    const { idUser } = useAuth();
    const [progression, setProgression] = useState(initialProgression);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Récupérer la progression réelle depuis l'API
    useEffect(() => {
        const fetchProgression = async () => {
            try {
                const userId = await idUser();
                if (!userId || userId === 0) {
                    setProgression(initialProgression);
                    setLoading(false);
                    return;
                }
                
                // Récupérer la progression via l'API avc
                const response = await axios.get(`${API_URL}/avc/avc/${courseid}/${userId}`);
                const prog = response.data?.avc || 0;
                setProgression(prog);
            } catch (error) {
                console.error("Erreur récupération progression:", error);
                setProgression(initialProgression);
            } finally {
                setLoading(false);
            }
        };
        
        if (showProgress && courseid) {
            fetchProgression();
        } else {
            setLoading(false);
        }
    }, [courseid, showProgress, idUser, initialProgression]);

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

    const truncateDescription = (text, maxLength = 80) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const formattedDuration = formatDuration(courseDuration);
    const truncatedDesc = truncateDescription(courseDescription);

    const getProgressColor = (value) => {
        if (value === 0) return '#e74c3c';
        if (value < 30) return '#D4A05A';
        if (value < 70) return '#6B8CAE';
        if (value < 100) return '#5A9E6E';
        return '#27ae60';
    };

    const getProgressMessage = (value) => {
        if (value === 0) return 'Non commencé';
        if (value < 30) return 'Débutant';
        if (value < 70) return 'En progression';
        if (value < 100) return 'Presque fini';
        return 'Terminé ✓';
    };

    const handleContinueCourse = (e) => {
        e.preventDefault();
        navigate(`/course/course/${courseid}`);
    };

    if (loading) {
        return (
            <div className={courseClass ? courseClass : 'courses-item'} style={{ 
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#fff',
                height: '100%'
            }}>
                <div className="img-part" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={courseImg || "/placeholder.svg"}
                        alt="Chargement"
                        style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                    />
                </div>
                <div className="content-part" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="spinner-border spinner-border-sm text-muted" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={courseClass ? courseClass : 'courses-item'} style={{ 
            boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
        }}>
            <div className="img-part" style={{ position: 'relative', overflow: 'hidden' }}>
                <Link to={`/course/course/${courseid}`}>
                    <img
                        src={courseImg || "/placeholder.svg"}
                        alt={courseTitle || "Cours"}
                        style={{ width: '100%', height: '220px', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onError={(e) => {
                            e.target.src = "/placeholder.svg";
                        }}
                    />
                    {courseCategory && (
                        <span className="course-category" style={{
                            position: 'absolute',
                            top: '15px',
                            left: '15px',
                            backgroundColor: '#ff5421',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            zIndex: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                            {courseCategory}
                        </span>
                    )}
                    {formattedDuration && (
                        <span style={{
                            position: 'absolute',
                            bottom: '15px',
                            right: '15px',
                            backgroundColor: 'rgba(0,0,0,0.75)',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            zIndex: 1,
                            backdropFilter: 'blur(5px)'
                        }}>
                            <i className="fa fa-clock-o me-1"></i> {formattedDuration}
                        </span>
                    )}
                    
                    {/* Badge de progression sur l'image */}
                    {showProgress && progression === 100 && (
                        <span style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            zIndex: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                            <i className="fas fa-check-circle me-1"></i> Terminé
                        </span>
                    )}
                </Link>
            </div>
            
            <div className="content-part" style={{ padding: '20px', background: '#fff', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <ul className="meta-part" style={{ marginBottom: '10px', paddingLeft: 0, listStyle: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <li>
                        <Link 
                            className="categorie" 
                            to={catLink ? catLink : `/courses/category/${courseid}`}
                            style={{ 
                                color: '#ff5421', 
                                fontSize: '12px', 
                                fontWeight: '600', 
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px'
                            }}
                        >
                            {courseCategory ? courseCategory : 'CATÉGORIE'}
                        </Link>
                    </li>
                </ul>
                
                <h3 className="title" style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '700', lineHeight: '1.3' }}>
                    <Link 
                        to={`/course/course/${courseid}`} 
                        style={{ 
                            color: '#2c3e50', 
                            textDecoration: 'none',
                            transition: 'color 0.3s ease',
                            display: 'block'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#ff5421'}
                        onMouseLeave={(e) => e.target.style.color = '#2c3e50'}
                    >
                        {courseTitle ? courseTitle : 'Titre du cours'}
                    </Link>
                </h3>
                
                {courseDescription && (
                    <p className="course-description" style={{
                        fontSize: '13px',
                        color: '#7f8c8d',
                        marginBottom: '15px',
                        lineHeight: '1.5',
                        minHeight: '40px'
                    }}>
                        {truncatedDesc}
                    </p>
                )}
                
                {/* Barre de progression avec message */}
                {showProgress && (
                    <div style={{ marginBottom: '15px', marginTop: 'auto' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '12px', 
                            marginBottom: '8px',
                            color: '#7f8c8d'
                        }}>
                            <span>
                                <i className="fas fa-chart-line me-1" style={{ color: '#ff5421' }}></i>
                                Progression
                            </span>
                            <span style={{ fontWeight: '600', color: getProgressColor(progression) }}>
                                {progression}%
                            </span>
                        </div>
                        <div style={{
                            height: '6px',
                            backgroundColor: '#ecf0f1',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${progression}%`,
                                height: '100%',
                                backgroundColor: getProgressColor(progression),
                                borderRadius: '3px',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: getProgressColor(progression),
                            marginTop: '5px',
                            fontWeight: '500'
                        }}>
                            <i className={`fas ${progression === 100 ? 'fa-check-circle' : 'fa-info-circle'} me-1`}></i>
                            {getProgressMessage(progression)}
                        </div>
                    </div>
                )}
                
                <div className="bottom-part" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid #ecf0f1',
                    paddingTop: '15px',
                    marginTop: 'auto'
                }}>
                    <div className="info-meta">
                        <ul style={{ display: 'flex', gap: '12px', paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                            <li className="user" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#7f8c8d' }}>
                                <i className="fa fa-user" style={{ color: '#ff5421', fontSize: '12px' }}></i> 
                                <span>Cours suivi</span>
                            </li>
                            {formattedDuration && (
                                <li className="duration" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#7f8c8d' }}>
                                    <i className="fa fa-clock-o" style={{ color: '#ff5421', fontSize: '12px' }}></i> 
                                    <span>{formattedDuration}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="btn-part">
                        <button 
                            onClick={handleContinueCourse}
                            style={{
                                backgroundColor: progression === 100 ? '#27ae60' : '#ff5421',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                                if (progression === 100) {
                                    e.target.style.backgroundColor = '#219a52';
                                } else {
                                    e.target.style.backgroundColor = '#e03a00';
                                }
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                if (progression === 100) {
                                    e.target.style.backgroundColor = '#27ae60';
                                } else {
                                    e.target.style.backgroundColor = '#ff5421';
                                }
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <i className={progression === 100 ? "fas fa-redo-alt" : "flaticon-right-arrow"}></i>
                            {progression === 100 ? 'Revoir' : 'Continuer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

CourseSingleSix.defaultProps = {
    courseClass: 'courses-item',
    courseTitle: 'Titre du cours',
    courseImg: null,
    courseCategory: null,
    courseDescription: null,
    courseDuration: null,
    catLink: null,
    courseid: null,
    initialProgression: 0,
    showProgress: false
};

export default CourseSingleSix;