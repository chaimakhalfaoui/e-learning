import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/authContext'; 
// Image
import teamImg1 from '../../../assets/img/team/1.jpg';
import teamImg2 from '../../../assets/img/team/2.jpg';

const InstructorPart = () => {
    const [nam, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    const fetchInstructor = async () => {
        setLoading(true);
        try {
            // Récupérer le nom de l'enseignant
            const nameResponse = await axios.get(`process.env.REACT_APP_API_URL/cours/getUserNameByCourseId/${id}`);
            setName(nameResponse.data);
            
            // Récupérer l'email de l'enseignant
            const idResponse = await axios.get(`process.env.REACT_APP_API_URL/cours/getUserIdByCourseId/${id}`);
            const enseignantId = idResponse.data;
            
            if (enseignantId) {
                const userResponse = await axios.get(`process.env.REACT_APP_API_URL/users/${enseignantId}`);
                setEmail(userResponse.data.email || '');
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des informations :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructor();
    }, [id]);

    if (loading) {
        return (
            <div className="content pt-30 pb-30 pl-30 pr-30 white-bg">
                <div className="text-center p-5">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="content pt-30 pb-30 pl-30 pr-30 white-bg">
            <h3 className="instructor-title" style={{ 
                marginBottom: '20px',
                borderLeft: '3px solid #ff5421',
                paddingLeft: '15px'
            }}>
                👨‍🏫 Enseignant
            </h3>
            <div className="row rs-team style1 orange-color transparent-bg clearfix">
                <div className="col-lg-6 col-md-6 col-sm-12">
                    <div className="team-item" style={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease'
                    }}>
                        <img 
                            src={teamImg2} 
                            alt={nam || "Enseignant"}
                            style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                        />
                        <div className="content-part" style={{ padding: '20px' }}>
                            <h4 className="name" style={{ marginBottom: '5px' }}>
                                <a href="#" style={{ color: '#ff5421' }}>{nam || 'Enseignant'}</a>
                            </h4>
                            <span className="designation" style={{ display: 'block', marginBottom: '10px' }}>Enseignant</span>
                            
                            {/* Affichage de l'email */}
                            {email && (
                                <div style={{ 
                                    marginBottom: '15px',
                                    fontSize: '13px',
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px'
                                }}>
                                    <span>📧</span> {email}
                                </div>
                            )}
                            
                            <ul className="social-links" style={{ 
                                display: 'flex', 
                                justifyContent: 'center',
                                gap: '12px', 
                                marginTop: '10px',
                                padding: '0',
                                listStyle: 'none'
                            }}>
                                <li>
                                    <a href="#" style={{
                                        display: 'inline-block',
                                        width: '35px',
                                        height: '35px',
                                        lineHeight: '35px',
                                        textAlign: 'center',
                                        background: '#f5f5f5',
                                        borderRadius: '50%',
                                        color: '#ff5421',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" style={{
                                        display: 'inline-block',
                                        width: '35px',
                                        height: '35px',
                                        lineHeight: '35px',
                                        textAlign: 'center',
                                        background: '#f5f5f5',
                                        borderRadius: '50%',
                                        color: '#ff5421',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" style={{
                                        display: 'inline-block',
                                        width: '35px',
                                        height: '35px',
                                        lineHeight: '35px',
                                        textAlign: 'center',
                                        background: '#f5f5f5',
                                        borderRadius: '50%',
                                        color: '#ff5421',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" style={{
                                        display: 'inline-block',
                                        width: '35px',
                                        height: '35px',
                                        lineHeight: '35px',
                                        textAlign: 'center',
                                        background: '#f5f5f5',
                                        borderRadius: '50%',
                                        color: '#ff5421',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <i className="fab fa-google"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* Description de l'enseignant */}
                <div className="col-lg-6 col-md-6 col-sm-12">
                    <div style={{ 
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        height: '100%'
                    }}>
                        <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            marginBottom: '15px',
                            color: '#333'
                        }}>
                            📖 À propos
                        </h4>
                        <p style={{ 
                            lineHeight: '1.6', 
                            color: '#666',
                            fontSize: '14px'
                        }}>
                            {nam ? `M. ${nam} est un enseignant(e) passionné et expérimenté dans son domaine.` 
                                  : 'Enseignant(e) passionné et expérimenté dans son domaine.'}
                            Il s'engage à fournir une formation de qualité et à accompagner les étudiants vers la réussite.
                        </p>
                        
                        <div style={{ 
                            display: 'flex', 
                            gap: '20px', 
                            marginTop: '20px',
                            paddingTop: '15px',
                            borderTop: '1px solid #e0e0e0'
                        }}>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff5421' }}>5+</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>Années d'expérience</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff5421' }}>10+</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>Cours créés</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff5421' }}>100+</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>Étudiants</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>  
        </div>
    );
}

export default InstructorPart;