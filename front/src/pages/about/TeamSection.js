import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SingleTeam from '../../components/Team/SingleTeam';
import SectionTitle from '../../components/Common/SectionTitle';

// Images par défaut (si pas d'images disponibles)
import teamimg1 from '../../assets/img/team/1.jpg';
import teamimg2 from '../../assets/img/team/2.jpg';
import teamimg3 from '../../assets/img/team/3.jpg';
import teamimg4 from '../../assets/img/team/4.jpg';
import teamimg5 from '../../assets/img/team/5.jpg';
import teamimg6 from '../../assets/img/team/6.jpg';

// Styles CSS pour uniformiser les images
const teamContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
};

const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease'
};

const Team = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestTeachers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:8801/api/auth/latestTeachers');
                console.log("Enseignants récupérés:", response.data);
                setTeachers(response.data || []);
            } catch (error) {
                console.error("Erreur lors de la récupération des derniers enseignants :", error);
                setError("Impossible de charger les enseignants.");
            } finally {
                setLoading(false);
            }
        };

        fetchLatestTeachers();
    }, []);

    // Images par défaut (cycle infini)
    const teamImages = [teamimg1, teamimg2, teamimg3, teamimg4, teamimg5, teamimg6];

    // Fonction pour obtenir une image (avec fallback)
    const getTeamImage = (index) => {
        return teamImages[index % teamImages.length];
    };

    // Styles pour les images uniformes
    const imageStyles = {
        width: '100%',
        height: '300px',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block'
    };

    if (loading) {
        return (
            <div id="rs-team" className="rs-team style1 inner-style orange-style pt-102 pb-110 md-pt-64 md-pb-70 gray-bg">
                <div className="container">
                    <SectionTitle
                        sectionClass="sec-title mb-50 md-mb-30 text-center"
                        subtitleClass="sub-title orange"
                        subtitle="Notre Équipe"
                        titleClass="title mb-0"
                        title="Nos Experts"
                    />
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-3">Chargement des enseignants...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div id="rs-team" className="rs-team style1 inner-style orange-style pt-102 pb-110 md-pt-64 md-pb-70 gray-bg">
                <div className="container">
                    <SectionTitle
                        sectionClass="sec-title mb-50 md-mb-30 text-center"
                        subtitleClass="sub-title orange"
                        subtitle="Notre Équipe"
                        titleClass="title mb-0"
                        title="Nos Experts"
                    />
                    <div className="alert alert-danger text-center">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                        <button 
                            className="btn btn-link" 
                            onClick={() => window.location.reload()}
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <div id="rs-team" className="rs-team style1 inner-style orange-style pt-102 pb-110 md-pt-64 md-pb-70 gray-bg">
                <div className="container">
                    <SectionTitle
                        sectionClass="sec-title mb-50 md-mb-30 text-center"
                        subtitleClass="sub-title orange"
                        subtitle="Notre Équipe"
                        titleClass="title mb-0"
                        title="Experts E-Learning"
                    />
                    
                    {teachers.length === 0 ? (
                        <div className="text-center">
                            <p>Aucun enseignant disponible pour le moment.</p>
                        </div>
                    ) : (
                        <div className="row" style={teamContainerStyle}>
                            {teachers.map((teacher, index) => (
                                <div key={teacher.id || index} className="col-lg-4 col-md-6 mb-30">
                                    <div style={cardStyle}>
                                        <SingleTeam
                                            itemClass="team-item"
                                            Image={teacher.image ? `http://localhost:8801/api/image/${teacher.image}` : getTeamImage(index)}
                                            Title={teacher.username || 'Enseignant'}
                                            Designation={teacher.role === 'enseignant' ? 'Enseignant Expert' : teacher.role || 'Formateur'}
                                            email={teacher.email}
                                            telephone={teacher.telephone}
                                            imageStyle={imageStyles}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}

export default Team;