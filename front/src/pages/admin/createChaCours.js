import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import SearchModal from '../../components/Layout/Header/SearchModal';
import { useAuth } from '../../context/authContext'; 
import '../../assets/scss/modal.scss';

// Image
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const API_URL = 'http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api';

const CreateChaCours = () => {
    const [openModal, setOpenModal] = useState(false);
    const [openModalq, setOpenModalq] = useState(false);
    const [course, setCourse] = useState(null);
    const [chapitre, setChapitre] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const { id } = useParams();
    const { idUser } = useAuth();
    const [isAddingChapitre, setIsAddingChapitre] = useState(true);
    const [isAddingQuiz, setIsAddingQuiz] = useState(true);
    const [loading, setLoading] = useState(true);
    const [inputs, setInputs] = useState({
        id_chapitre: "",
        titre: "",
        idQuiz: "",
        titreQuiz: "",
        dureeQuiz: "",
    });
    const navigate = useNavigate();

    // Styles personnalisés
    const styles = {
        buttonPrimary: {
            backgroundColor: '#ff5421',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        },
        buttonEdit: {
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
        },
        buttonDelete: {
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
        },
        buttonOutline: {
            backgroundColor: 'transparent',
            color: '#ff5421',
            border: '1px solid #ff5421',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
        }
    };

    // Vérification des droits d'accès
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await idUser();
                const response = await axios.get(`${API_URL}/auth/checkUserRole/${userId}`);
                const userRole = response.data.role;
                if (userRole !== 'enseignant') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur:", error);
                navigate('/404');
            }
        };
        fetchUserData();
    }, [idUser, navigate]);

    // Récupération des données
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchCourse(),
                    fetchChapitre(),
                    fetchQuiz(),
                ]);
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`${API_URL}/cours/getCourse/${id}`);
            if (response.data && Array.isArray(response.data)) {
                setCourse(response.data[0]);
            } else if (response.data) {
                setCourse(response.data);
            } else {
                setCourse(null);
            }
        } catch (error) {
            console.error("Erreur:", error);
            setCourse(null);
        }
    };

    // FONCTION CORRIGÉE - Gère les différents formats de réponse
    const fetchChapitre = async () => {
        try {
            const response = await axios.get(`${API_URL}/chapitre/getChapitresByCours/${id}`);
            
            // Gérer différents formats de réponse
            let chapitresData = [];
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    chapitresData = response.data;
                } else if (typeof response.data === 'object' && response.data.id_chapitre) {
                    // Si c'est un objet unique, le mettre dans un tableau
                    chapitresData = [response.data];
                }
            }
            
            setChapitre(chapitresData);
        } catch (error) {
            console.error("Erreur fetchChapitre:", error);
            setChapitre([]);
        }
    };

    const fetchQuiz = async () => {
        try {
            const response = await axios.get(`${API_URL}/quiz/getQuiz/${id}`);
            if (response.data && response.data.length > 0) {
                setQuiz(response.data[0]);
            } else {
                setQuiz(null);
            }
        } catch (error) {
            console.error("Erreur:", error);
            setQuiz(null);
        }
    };

    const handleInputChange = (e) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Créer un chapitre
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/chapitre/createChapitre`, {
                nom_chapitre: inputs.titre,
                id_cours: id
            });
            toast.success('Séquence créée avec succès');
            setInputs(prev => ({ ...prev, titre: "" }));
            fetchChapitre();
            setOpenModal(false);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur lors de la création');
        }
    };

    // Créer un quiz
    const handleSubmitq = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/quiz/createQuiz`, {
                titre: inputs.titreQuiz,
                duree: inputs.dureeQuiz,
                id_cours: id
            });
            toast.success('Quiz créé avec succès');
            setInputs(prev => ({ ...prev, titreQuiz: "", dureeQuiz: "" }));
            fetchQuiz();
            setOpenModalq(false);
        } catch (err) {
            toast.error(err.response?.data || 'Erreur lors de la création du quiz');
        }
    };

    // Supprimer un chapitre
    const handleDeleteChapitre = async (chapitreId) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette séquence ?")) {
            try {
                await axios.delete(`${API_URL}/chapitre/deleteChapitre/${chapitreId}`);
                toast.success('Séquence supprimée avec succès');
                fetchChapitre();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    // Supprimer un quiz
    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce quiz ?")) {
            try {
                await axios.delete(`${API_URL}/quiz/deleteQuiz/${quizId}`);
                toast.success('Quiz supprimé avec succès');
                fetchQuiz();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    // Modifier un chapitre
    const handleUpdateChapitreModal = (id_chapitre, titre) => {
        setInputs(prev => ({ ...prev, titre: titre, id_chapitre: id_chapitre }));
        setOpenModal(true);
        setIsAddingChapitre(false);
    };

    const handleUpdateChapitre = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/chapitre/updateChapitre/${inputs.id_chapitre}`, {
                nom_chapitre: inputs.titre
            });
            toast.success('Séquence mise à jour avec succès');
            setInputs(prev => ({ ...prev, id_chapitre: "", titre: "" }));
            fetchChapitre();
            setOpenModal(false);
            setIsAddingChapitre(true);
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    // Modifier un quiz
    const handleUpdateQuizModal = (idQuiz, titreQuiz, dureeQuiz) => {
        setInputs(prev => ({ ...prev, idQuiz: idQuiz, titreQuiz: titreQuiz, dureeQuiz: dureeQuiz }));
        setOpenModalq(true);
        setIsAddingQuiz(false);
    };

    const handleUpdateQuiz = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/quiz/updateQuiz/${inputs.idQuiz}`, {
                titre: inputs.titreQuiz,
                duree: inputs.dureeQuiz
            });
            toast.success('Quiz mis à jour avec succès');
            setInputs(prev => ({ ...prev, idQuiz: "", titreQuiz: "", dureeQuiz: "" }));
            fetchQuiz();
            setOpenModalq(false);
            setIsAddingQuiz(true);
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du quiz');
        }
    };

    const closModalChap = () => {
        setIsAddingChapitre(true);
        setOpenModal(false);
        setInputs(prev => ({ ...prev, titre: "" }));
    };

    const closModalQuiz = () => {
        setIsAddingQuiz(true);
        setOpenModalq(false);
        setInputs(prev => ({ ...prev, titreQuiz: "", dureeQuiz: "" }));
    };

    if (loading) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header
                    parentMenu='cours'
                    secondParentMenu='others'
                    headerNormalLogo={Logo}
                    headerStickyLogo={Logo}
                    CanvasLogo={Logo}
                    mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md"
                    headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable'
                    TopBarClass="topbar-area home8-topbar"
                    emailAddress='admin@isetso.rnu.tn'
                    Location='Cité Erriadh - B.P 135'
                />
                <SiteBreadcrumb pageTitle="Séquences" pageName="Gestion des séquences" breadcrumbsImg={bannerbg} />
                <div className="container pt-100 pb-100 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des données...</p>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
                <ToastContainer position="top-right" autoClose={3000} />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Helmet><link rel="icon" href={favIcon} /></Helmet>
            <OffWrap />
            <Header
                parentMenu='cours'
                secondParentMenu='others'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn'
                Location='Cité Erriadh - B.P 135'
            />

            <SiteBreadcrumb
                pageTitle="Séquences de cours"
                pageName={course ? `Cours : ${course.titre}` : "Gestion des séquences"}
                breadcrumbsImg={bannerbg}
            />

            <div style={{ marginBottom: "100px" }} className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="notice-bord style1">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="title">
                                        <i className="fas fa-list me-2" style={{ color: '#ff5421' }}></i>
                                        Séquences du cours
                                        {course && <span style={{ color: "#ff5421", fontSize: "16px", marginLeft: "10px" }}>{course.titre}</span>}
                                    </h4>
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="re-button" 
                                            onClick={() => setOpenModal(true)}
                                            style={styles.buttonPrimary}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                                        >
                                            <i className="fas fa-plus"></i> Ajouter Séquence
                                        </button>
                                        {!quiz && (
                                            <button 
                                                className="re2-button" 
                                                onClick={() => setOpenModalq(true)}
                                                style={styles.buttonPrimary}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                                            >
                                                <i className="fas fa-plus"></i> Ajouter Quiz
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Liste des chapitres */}
                                <div className="ul-chap">
                                    {chapitre.length === 0 ? (
                                        <div className="alert alert-info text-center">
                                            <i className="fas fa-info-circle"></i> Aucune séquence pour le moment
                                        </div>
                                    ) : (
                                        <ul className="list-unstyled">
                                            {chapitre.map((chap, index) => (
                                                <li key={chap.id_chapitre} className="mb-2">
                                                    <div className="li-" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                                                        <div className="d-flex align-items-center">
                                                            <div className="date me-3">
                                                                <span className="badge bg-secondary rounded-circle px-3 py-2">{index + 1}</span>
                                                            </div>
                                                            <div className="desc">
                                                                <Link to={`/admin/createactivite/${chap.id_chapitre}`} style={{ color: '#333', textDecoration: 'none' }}>
                                                                    {chap.nom_chapitre}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                onClick={() => handleUpdateChapitreModal(chap.id_chapitre, chap.nom_chapitre)}
                                                                style={styles.buttonEdit}
                                                                title="Modifier"
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#0069d9'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                                                            >
                                                                <i className="fas fa-edit"></i> 
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteChapitre(chap.id_chapitre)}
                                                                style={styles.buttonDelete}
                                                                title="Supprimer"
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                                                            >
                                                                <i className="fas fa-trash"></i> 
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Quiz */}
                                {quiz && (
                                    <>
                                        <h4 className="title mt-4">
                                            <i className="fas fa-question-circle me-2" style={{ color: '#ff5421' }}></i>
                                            Quiz du cours
                                        </h4>
                                        <div className="ul-chap">
                                            <ul className="list-unstyled">
                                                <li className="mb-2">
                                                    <div className="li-" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                                                        <div className="d-flex align-items-center">
                                                            <div className="date me-3">
                                                                <span className="badge bg-secondary rounded-circle px-3 py-2">1</span>
                                                            </div>
                                                            <div className="desc">
                                                                <Link to={`/admin/createquestionq/${quiz.id}`} style={{ color: '#333', textDecoration: 'none' }}>
                                                                    {quiz.titre}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                onClick={() => handleUpdateQuizModal(quiz.id, quiz.titre, quiz.duree)}
                                                                style={styles.buttonEdit}
                                                                title="Modifier"
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#0069d9'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                                                            >
                                                                <i className="fas fa-edit"></i> 
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteQuiz(quiz.id)}
                                                                style={styles.buttonDelete}
                                                                title="Supprimer"
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                                                            >
                                                                <i className="fas fa-trash"></i> 
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Ajout/Modification Chapitre */}
            {openModal && (
                <div className='ext-modal'>
                    <div className='modal-add-chap' style={{ maxWidth: "500px", margin: "0 auto", backgroundColor: "white", borderRadius: "10px", padding: "20px" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 style={{ margin: 0, color: '#ff5421' }}>
                                <i className="fas fa-plus-circle me-2"></i>
                                {isAddingChapitre ? 'Créer une séquence' : 'Modifier la séquence'}
                            </h3>
                            <button onClick={closModalChap} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
                        </div>
                        <div className='name-cours-chap mb-3'>
                            <strong>Cours : </strong> {course ? course.titre : 'Chargement...'}
                        </div>
                        <form onSubmit={isAddingChapitre ? handleSubmit : handleUpdateChapitre}>
                            <div className="mb-3">
                                <label className="form-label">Titre de la séquence</label>
                                <input 
                                    type="text" 
                                    name="titre" 
                                    className="form-control"
                                    placeholder="Ex: Introduction, Chapitre 1, etc." 
                                    value={inputs.titre} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={closModalChap} className="btn btn-secondary">
                                    Annuler
                                </button>
                                <button type="submit" className="btn" style={{ backgroundColor: '#ff5421', color: 'white' }}>
                                    {isAddingChapitre ? 'Créer' : 'Modifier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ajout/Modification Quiz */}
            {openModalq && (
                <div className='ext-modal'>
                    <div className='modal-add-chap' style={{ maxWidth: "500px", margin: "0 auto", backgroundColor: "white", borderRadius: "10px", padding: "20px" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 style={{ margin: 0, color: '#ff5421' }}>
                                <i className="fas fa-plus-circle me-2"></i>
                                {isAddingQuiz ? 'Créer un quiz' : 'Modifier le quiz'}
                            </h3>
                            <button onClick={closModalQuiz} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
                        </div>
                        <div className='name-cours-chap mb-3'>
                            <strong>Cours : </strong> {course ? course.titre : 'Chargement...'}
                        </div>
                        <form onSubmit={isAddingQuiz ? handleSubmitq : handleUpdateQuiz}>
                            <div className="mb-3">
                                <label className="form-label">Titre du quiz</label>
                                <input 
                                    type="text" 
                                    name="titreQuiz" 
                                    className="form-control"
                                    placeholder="Ex: Quiz de fin de chapitre" 
                                    value={inputs.titreQuiz} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Durée (minutes)</label>
                                <input 
                                    type="number" 
                                    name="dureeQuiz" 
                                    className="form-control"
                                    placeholder="Durée en minutes" 
                                    value={inputs.dureeQuiz} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={closModalQuiz} className="btn btn-secondary">
                                    Annuler
                                </button>
                                <button type="submit" className="btn" style={{ backgroundColor: '#ff5421', color: 'white' }}>
                                    {isAddingQuiz ? 'Créer' : 'Modifier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
            <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
            <ToastContainer position="top-right" autoClose={3000} />
        </React.Fragment>
    );
};

export default CreateChaCours;