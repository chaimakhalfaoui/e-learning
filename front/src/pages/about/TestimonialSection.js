//import React, { useEffect, useState } from 'react';
//import Slider from "react-slick";
//import SectionTitle from '../../components/Common/SectionTitle';
//import SingleTestimonialThree from '../../components/Testimonial/SingleTestimonialThree';
//import { useAuth } from '../../context/authContext'; 
//import axios from 'axios';
//import '../../assets/scss/style.scss';

// Testimonial Avatars
//import author1 from '../../assets/img/testimonial/style3/1.png';
//import author2 from '../../assets/img/testimonial/style3/2.png';
//import author3 from '../../assets/img/testimonial/style3/3.png';
//import author4 from '../../assets/img/testimonial/style3/4.png';
//import author5 from '../../assets/img/testimonial/style3/5.png';

const Testimonial = () => {
    {/*
    const { idUser, role, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);

    const testimonialSettings = {
        dots: true,
        centerMode: false,
        infinite: comments.length > 2,
        arrows: false,
        slidesToShow: Math.min(2, comments.length || 1),
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    dots: false,
                }
            }
        ]
    };

    // Récupérer l'ID utilisateur et le rôle au chargement
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userid = await idUser();
                setUserId(userid);
                
                const userRole = await role();
                setUserRole(userRole);
            } catch (error) {
                console.error('Erreur lors de la récupération des infos utilisateur:', error);
            }
        };
        
        fetchUserInfo();
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const response = await axios.get('http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/commentaire/getComments');
            setComments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires :', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated || !userId) {
            setError('Vous devez être connecté pour laisser un commentaire.');
            return;
        }

        if (!newComment.trim()) {
            setError('Le commentaire ne peut pas être vide.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/commentaire/createComment', {
                iduser: userId,
                commentaire: newComment,
                role: userRole || 'etudiant'
            });

            if (response.status === 200 || response.status === 201) {
                setSuccess('Votre commentaire a été ajouté avec succès !');
                setNewComment('');
                fetchComments();
                
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Erreur:', error);
            const errorMessage = error.response?.data?.message || 'Une erreur s\'est produite.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const formContainerStyle = {
        marginTop: '40px',
        padding: '30px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0,0,0,0.05)'
    };

    const textareaStyle = {
        width: '100%',
        padding: '12px 15px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        resize: 'vertical',
        minHeight: '100px',
        marginBottom: '15px'
    };

    const buttonStyle = {
        backgroundColor: '#ff5421',
        color: 'white',
        border: 'none',
        padding: '10px 25px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background 0.3s ease'
    };

    const errorStyle = {
        color: '#dc3545',
        fontSize: '14px',
        marginBottom: '10px'
    };

    const successStyle = {
        color: '#28a745',
        fontSize: '14px',
        marginBottom: '10px'
    };

    const loginMessageStyle = {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#e9ecef',
        borderRadius: '10px',
        marginTop: '40px'
    };

    const emptyMessageStyle = {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        margin: '20px 0'
    };

    return (
        <React.Fragment>
            <div className="rs-testimonial style3 orange-color pt-102 md-pt-70 pb-60">
                <div className="container">
                    <SectionTitle
                        sectionClass="sec-title mb-60 text-center md-mb-30"
                        subtitleClass="sub-title orange"
                        subtitle="Avis des Étudiants"
                        titleClass="title mb-0"
                        title="Ce que disent nos étudiants"
                    />
                    <div className="row">
                        {comments.length > 0 ? (
                            <Slider {...testimonialSettings}>
                                {comments.map((comment, index) => (
                                    <SingleTestimonialThree
                                        key={comment.id}
                                        itemClass="testi-item"
                                        authorImage={index % 5 === 0 ? author1 : index % 5 === 1 ? author2 : index % 5 === 2 ? author3 : index % 5 === 3 ? author4 : author5}
                                        Title={comment.username || 'Utilisateur'}
                                        Designation={comment.role === 'etudiant' ? 'Étudiant' : comment.role === 'enseignant' ? 'Enseignant' : comment.role === 'coordinateur' ? 'Coordinateur' : 'Utilisateur'}
                                        Description={comment.commentaire}
                                    />
                                ))}
                            </Slider>
                        ) : (
                            <div style={emptyMessageStyle}>
                                <i className="fas fa-comments" style={{ fontSize: '48px', color: '#ff5421', marginBottom: '15px', display: 'block' }}></i>
                                <h4 style={{ marginBottom: '10px' }}>Aucun avis pour le moment</h4>
                                <p>Soyez le premier à partager votre expérience !</p>
                            </div>
                        )}
                    </div>
                    
                   
                    {isAuthenticated ? (
                        <div style={formContainerStyle}>
                            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <i className="fas fa-pen-alt me-2" style={{ color: '#ff5421' }}></i>
                                Laissez votre avis
                            </h4>
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Partagez votre expérience avec nous..."
                                    style={textareaStyle}
                                    disabled={loading}
                                ></textarea>
                                {error && <p style={errorStyle}><i className="fas fa-exclamation-circle me-1"></i>{error}</p>}
                                {success && <p style={successStyle}><i className="fas fa-check-circle me-1"></i>{success}</p>}
                                <div style={{ textAlign: 'center' }}>
                                    <button 
                                        type="submit" 
                                        style={buttonStyle}
                                        disabled={loading}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e04e1a'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin me-2"></i>
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>
                                                Envoyer mon avis
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div style={loginMessageStyle}>
                            <i className="fas fa-lock" style={{ fontSize: '30px', color: '#ff5421', marginBottom: '10px', display: 'block' }}></i>
                            <h5>Connectez-vous pour laisser un commentaire</h5>
                            <p>Vous devez être connecté pour partager votre expérience.</p>
                            <a href="/login" className="btn btn-primary" style={{ backgroundColor: '#ff5421', border: 'none' }}>
                                Se connecter
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
    */}
}

export default Testimonial;