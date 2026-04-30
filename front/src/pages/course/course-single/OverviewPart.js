import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const API_URL = http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api;

const OverviewPart = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [chapitre, setChapitre] = useState([]);
    const [edu, setEdu] = useState(0);
    const [enseignant, setEnseignant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Récupérer les informations du cours
            const courseResponse = await axios.get(`${API_URL}/cours/getCourse/${id}`);
            let courseData = null;
            if (courseResponse.data && Array.isArray(courseResponse.data) && courseResponse.data.length > 0) {
                courseData = courseResponse.data[0];
            } else if (courseResponse.data && !Array.isArray(courseResponse.data)) {
                courseData = courseResponse.data;
            }
            setCourse(courseData);
            
            // Récupérer les chapitres
            const chapitreResponse = await axios.get(`${API_URL}/chapitre/getChapitre/${id}`);
            setChapitre(chapitreResponse.data || []);
            
            // Récupérer le nombre d'étudiants
            const eduResponse = await axios.get(`${API_URL}/lecture/getLectureCours/${id}`);
            setEdu(eduResponse.data || 0);
            
            // Récupérer les informations de l'enseignant
            if (courseData?.id_user) {
                const enseignantResponse = await axios.get(`${API_URL}/users/${courseData.id_user}`);
                setEnseignant(enseignantResponse.data);
            }
            
            console.log("Cours chargé:", courseData);
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
        } finally {
            setLoading(false);
        }
    };

    // Formater la durée
    const formatDuration = (duration) => {
        if (!duration) return 'Non spécifiée';
        const hours = parseFloat(duration);
        if (isNaN(hours)) return 'Non spécifiée';
        if (hours === 1) return '1 heure';
        if (hours % 1 === 0) return `${hours} heures`;
        const minutes = Math.round((hours - Math.floor(hours)) * 60);
        return `${Math.floor(hours)}h ${minutes}min`;
    };

    if (loading) {
        return (
            <div className="content white-bg pt-30">
                <div className="course-overview">
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-3">Chargement des informations...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="content white-bg pt-30">
                <div className="course-overview">
                    <div className="alert alert-danger text-center">
                        <i className="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
                        <p>Cours non trouvé</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content white-bg pt-30">
            <div className="course-overview">
                <div className="inner-box">
                    {/* Image du cours */}
                    {course.image && (
                        <div className="course-image" style={{ marginBottom: '20px' }}>
                            <img 
                                src={`${API_URL}/image/${course.image}`}
                                alt={course.titre}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '400px',
                                    objectFit: 'cover',
                                    borderRadius: '10px'
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                                }}
                            />
                        </div>
                    )}

                    {/* Titre du cours */}
                    <h4 style={{ color: '#ff5421', marginBottom: '15px', fontSize: '24px' }}>
                        {course.titre || 'Titre du cours'}
                    </h4>
                    
                    {/* Description */}
                    <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '20px' }}>
                        {course.description || 'Aucune description disponible pour ce cours.'}
                    </p>

                    {/* Informations du cours - Cartes */}
                    <div className="course-info-cards" style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '15px', 
                        marginBottom: '25px',
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '10px'
                    }}>
                        {/* Enseignant */}
                        {enseignant && (
                            <div style={{ flex: 1, minWidth: '120px' }}>
                                <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                                    <i className="fa fa-user" style={{ color: '#ff5421', marginRight: '5px' }}></i>
                                    ENSEIGNANT
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                    {enseignant.username || 'Non défini'}
                                </div>
                            </div>
                        )}

                        {/* Catégorie */}
                        <div style={{ flex: 1, minWidth: '120px' }}>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                                <i className="fa fa-folder-open" style={{ color: '#ff5421', marginRight: '5px' }}></i>
                                CATÉGORIE
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                                {course.type || 'Non catégorisé'}
                            </div>
                        </div>

                        {/* Durée */}
                        <div style={{ flex: 1, minWidth: '120px' }}>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                                <img 
                                    src="https://img.icons8.com/ios-glyphs/16/ff5421/clock.png" 
                                    alt="clock" 
                                    style={{ width: '14px', height: '14px', marginRight: '5px', display: 'inline-block', verticalAlign: 'middle' }}
                                />
                                DURÉE TOTALE
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                                {formatDuration(course.duration)}
                            </div>
                        </div>

                        {/* Nombre d'étudiants */}
                        <div style={{ flex: 1, minWidth: '120px' }}>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                                <i className="fa fa-users" style={{ color: '#ff5421', marginRight: '5px' }}></i>
                                ÉTUDIANTS
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                                {edu || 0} étudiants
                            </div>
                        </div>
                    </div>

                    {/* Nombre de chapitres */}
                    <div style={{ 
                        backgroundColor: '#e8f5e9', 
                        padding: '12px 15px', 
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <i className="fa fa-book" style={{ color: '#28a745', fontSize: '18px' }}></i>
                        <span style={{ color: '#333' }}>
                            <strong>{chapitre.length}</strong> Séquence{chapitre.length > 1 ? 's' : ''} au total
                        </span>
                        {chapitre.length > 0 && (
                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
                                <i className="fa fa-clock-o me-1"></i>
                                Environ {chapitre.length * 2} heures de contenu
                            </span>
                        )}
                    </div>

                    {/* Section "Qu'allez-vous apprendre ?" */}
                    <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                        <i className="fa fa-graduation-cap" style={{ color: '#ff5421', marginRight: '10px' }}></i>
                        Programme du cours
                    </h3>
                    
                    {chapitre && chapitre.length > 0 ? (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '12px'
                        }}>
                            {chapitre.map((chap, index) => (
                                <div key={chap.id_chapitre || index} style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    borderLeft: '3px solid #ff5421',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        width: '30px',
                                        height: '30px',
                                        backgroundColor: '#ff5421',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        marginRight: '12px',
                                        fontSize: '14px'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                                            {chap.nom_chapitre || 'Séquence sans titre'}
                                        </div>
                                        {chap.description && (
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                {chap.description.length > 60 ? chap.description.substring(0, 60) + '...' : chap.description}
                                            </div>
                                        )}
                                    </div>
                                    {chap.duree && (
                                        <div style={{ fontSize: '11px', color: '#999', marginLeft: '10px' }}>
                                            <i className="fa fa-clock-o"></i> {chap.duree} min
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            Aucune séquence disponible pour le moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewPart;