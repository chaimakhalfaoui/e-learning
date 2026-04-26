import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 
import axios from "axios";

const API_URL = 'http://localhost:8801/api';

const CourseSingleTwo = (props) => {
    const { 
        courseid, 
        courseClass, 
        courseImg, 
        courseTitle, 
        courseDescription,
        courseCategory, 
        courseDuration,
        catLink 
    } = props;
    
    const { idUser } = useAuth();
    const [studentCount, setStudentCount] = useState(0);
    const navigate = useNavigate();

    // Récupérer le nombre d'étudiants inscrits
    const fetchStudentCount = useCallback(async () => {
        if (!courseid) return;
        
        try {
            const response = await axios.get(`${API_URL}/cours/etudiants/${courseid}`);
            console.log(`Réponse API pour cours ${courseid}:`, response.data);
            
            let count = 0;
            if (Array.isArray(response.data)) {
                count = response.data.length;
            } else if (typeof response.data === 'number') {
                count = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (response.data.count !== undefined) count = response.data.count;
                else if (response.data.total !== undefined) count = response.data.total;
                else if (response.data.nombre !== undefined) count = response.data.nombre;
                else if (response.data.etudiants && Array.isArray(response.data.etudiants)) count = response.data.etudiants.length;
                else if (response.data.length !== undefined) count = response.data.length;
            }
            
            setStudentCount(count);
        } catch (error) {
            console.error(`Erreur pour le cours ${courseid}:`, error);
            setStudentCount(0);
        }
    }, [courseid]); // Ajout de courseid comme dépendance

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

    const handleViewCourse = async (e) => {
        e.preventDefault();
        
        const userid = await idUser();
        
        if (!userid || userid === 0) {
            navigate('/login');
            return;
        }
        
        navigate(`/course/course/${courseid}`);
    };

    useEffect(() => {
        fetchStudentCount();
    }, [fetchStudentCount]); // Correction : inclure fetchStudentCount comme dépendance

    const truncateDescription = (text, maxLength = 80) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const formattedDuration = formatDuration(courseDuration);
    const formattedStudentCount = formatStudentCount(studentCount);
    const truncatedDesc = truncateDescription(courseDescription);

    return (
        <div className={courseClass ? courseClass : 'courses-item'}>
            <div className="img-part" style={{ position: 'relative' }}>
                <Link to={`/course/course/${courseid}`}>
                    <img
                        src={courseImg || "https://via.placeholder.com/400x250?text=Image+non+disponible"}
                        alt={courseTitle || "Cours"}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x250?text=Image+non+disponible";
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
                            <li className="user" title="Nombre d'étudiants">
                                <i className="fa fa-user"></i> 
                                {formattedStudentCount} Étudiant{studentCount !== 1 ? 's' : ''}
                            </li>
                            {formattedDuration && (
                                <li className="duration" style={{ marginLeft: '10px' }}>
                                    <i className="fa fa-clock-o"></i> {formattedDuration}
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="btn-part">
                        <button 
                            onClick={handleViewCourse}
                            style={{
                                backgroundColor: '#ff5421',
                                color: 'white',
                                border: 'none',
                                padding: '8px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                        >
                            <i className="flaticon-right-arrow"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
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
    courseid: null
};

export default CourseSingleTwo;