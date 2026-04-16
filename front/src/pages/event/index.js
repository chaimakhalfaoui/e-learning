import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import { useAuth } from '../../context/authContext'; 
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/2.jpg';

const Event = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdminOrCoord, setIsAdminOrCoord] = useState(false);

    // ✅ Vérification des droits d'accès et du rôle
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                setIsAdminOrCoord(userRole === 'admin' || userRole === 'coordinateur');
            } catch (error) {
                console.error("Erreur rôle utilisateur:", error);
            }
        };
        checkAccess();
    }, [role]);

    // ✅ Récupération de TOUS les événements
    useEffect(() => {
        fetchAllEvents();
    }, []);

    const fetchAllEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8801/api/event/getAllEvents`);
            setEvents(response.data);
            setFilteredEvents(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements:", error);
            setError("Impossible de charger la liste des événements.");
            toast.error("Erreur lors du chargement des événements");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fonction de recherche
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        if (term === "") {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter(event => 
                event.titre?.toLowerCase().includes(term) ||
                event.description?.toLowerCase().includes(term) ||
                event.ville?.toLowerCase().includes(term) ||
                event.categorie?.toLowerCase().includes(term)
            );
            setFilteredEvents(filtered);
        }
    };

    // ✅ Effacer la recherche
    const clearSearch = () => {
        setSearchTerm("");
        setFilteredEvents(events);
        toast.info("Recherche effacée");
    };

    // ✅ Suppression d'un événement
    const handleDeleteEvent = async (id) => {
        const userRole = await role();
        if (userRole !== 'admin' && userRole !== 'coordinateur') {
            toast.error("Vous n'avez pas les droits pour supprimer un événement.");
            return;
        }
        
        if (window.confirm("Voulez-vous vraiment supprimer cet événement ?")) {
            try {
                const response = await axios.delete(`http://localhost:8801/api/event/deleteEvent/${id}`);
                
                if (response.status === 200) {
                    const updatedEvents = events.filter(event => event.id !== id);
                    setEvents(updatedEvents);
                    setFilteredEvents(updatedEvents);
                    toast.success("Événement supprimé avec succès !");
                }
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                const errorMessage = error.response?.data || "Erreur lors de la suppression de l'événement.";
                toast.error(errorMessage);
            }
        }
    };

    // ✅ Fonction pour formater la date
    const formatDate = (dateString) => {
        if (!dateString) return "Date non définie";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // ✅ Styles
    const searchContainerStyle = {
        marginBottom: "30px",
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "wrap"
    };

    const searchInputStyle = {
        width: "100%",
        maxWidth: "400px",
        padding: "12px 20px",
        fontSize: "16px",
        border: "2px solid #ddd",
        borderRadius: "25px",
        outline: "none",
        transition: "all 0.3s ease"
    };

    const clearButtonStyle = {
        padding: "12px 20px",
        fontSize: "16px",
        border: "2px solid #ddd",
        borderRadius: "25px",
        backgroundColor: "#f8f9fa",
        cursor: "pointer",
        transition: "all 0.3s ease",
        color: "#666"
    };

    const addButtonStyle = {
        backgroundColor: "#ff5421",
        color: "white",
        border: "none",
        padding: "12px 24px",
        borderRadius: "5px",
        cursor: "pointer",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "20px"
    };

    const resultCountStyle = {
        textAlign: "center",
        marginTop: "20px",
        marginBottom: "20px",
        color: "#666",
        fontSize: "14px"
    };

    const eventCardStyle = {
        border: '1px solid #eee',
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        backgroundColor: '#fff',
        height: '100%'
    };

    const eventImgStyle = {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        position: 'relative'
    };

    const eventContentStyle = {
        padding: '20px'
    };

    const eventMetaStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '13px',
        color: '#666'
    };

    const eventTitleStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '10px'
    };

    const eventDescStyle = {
        fontSize: '14px',
        color: '#666',
        marginBottom: '15px',
        lineHeight: '1.5'
    };

    const eventDateStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '13px',
        color: '#ff5421',
        backgroundColor: '#fff5f0',
        padding: '8px 10px',
        borderRadius: '8px'
    };

    const eventActionsStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #eee'
    };

    const editButtonStyle = {
        backgroundColor: '#ff5421',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        textDecoration: 'none',
        fontSize: '13px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'background 0.3s ease'
    };

    const deleteButtonStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#dc3545',
        fontSize: '18px',
        transition: 'all 0.3s ease',
        padding: '5px'
    };

    // ✅ Affichage du chargement
    if (loading) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header
                    parentMenu='event'
                    secondParentMenu='event'
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
                    pageTitle="Liste des Événements"
                    pageName="Événements"
                    breadcrumbsImg={bannerbg}
                />
                <div className="container pt-100 pb-100 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des événements...</p>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
            </React.Fragment>
        );
    }

    // ✅ Affichage de l'erreur
    if (error) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header
                    parentMenu='event'
                    secondParentMenu='event'
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
                    pageTitle="Liste des Événements"
                    pageName="Événements"
                    breadcrumbsImg={bannerbg}
                />
                <div className="container pt-100 pb-100">
                    <div className="alert alert-danger text-center">
                        <h4>Erreur !</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary mt-3" 
                            onClick={() => window.location.reload()}
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
            </React.Fragment>
        );
    }

    // ✅ Affichage principal
    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>Événements | ISETSO</title>
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='event'
                secondParentMenu='event'
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
                pageTitle="Liste des Événements"
                pageName="Événements"
                breadcrumbsImg={bannerbg}
            />

            <div className="rs-event orange-style pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">

                    {/* ✅ Barre de recherche */}
                    {events.length > 0 && (
                        <div style={searchContainerStyle}>
                            <input
                                type="text"
                                placeholder="🔍 Rechercher un événement..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={searchInputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#ff5421"}
                                onBlur={(e) => e.target.style.borderColor = "#ddd"}
                            />
                            {searchTerm && (
                                <button onClick={clearSearch} style={clearButtonStyle}>
                                    ✖ Effacer
                                </button>
                            )}
                        </div>
                    )}

                    {/* ✅ Affichage du nombre de résultats */}
                    {!loading && !error && events.length > 0 && (
                        <div style={resultCountStyle}>
                            <i className="fas fa-calendar-alt me-2"></i> 
                            {filteredEvents.length} événement(s) trouvé(s) sur {events.length} total
                            {searchTerm && ` pour "${searchTerm}"`}
                        </div>
                    )}

                    {/* ✅ Liste des événements */}
                    {filteredEvents.length === 0 && searchTerm && (
                        <div className="alert alert-warning text-center">
                            <i className="fas fa-search"></i>
                            <p className="mt-2 mb-0">
                                Aucun événement ne correspond à votre recherche "<strong>{searchTerm}</strong>"
                            </p>
                        </div>
                    )}

                    {filteredEvents.length === 0 && !searchTerm && events.length === 0 && (
                        <div className="alert alert-info text-center">
                            <i className="fas fa-info-circle fa-2x mb-2 d-block"></i>
                            <p>Aucun événement trouvé.</p>
                            {isAdminOrCoord && (
                                <Link to="/admin/createvt" className="btn btn-primary mt-3">
                                    <i className="fas fa-plus me-2"></i> Créer votre premier événement
                                </Link>
                            )}
                        </div>
                    )}

                    {filteredEvents.length > 0 && (
                        <div className="row">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="col-lg-4 col-md-6 mb-30">
                                    <div style={eventCardStyle}>
                                        <div style={{ position: 'relative' }}>
                                            <img 
                                                src={`http://localhost:8801/api/image/${event.image}`} 
                                                alt={event.titre} 
                                                style={eventImgStyle}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+non+trouvée';
                                                }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                backgroundColor: '#ff5421',
                                                color: 'white',
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                fontSize: '12px'
                                            }}>
                                                {formatDate(event.datedebut)}
                                            </div>
                                        </div>
                                        <div style={eventContentStyle}>
                                            <div style={eventMetaStyle}>
                                                <span>
                                                    <i className="fas fa-map-marker-alt" style={{ color: '#ff5421', marginRight: '5px' }}></i>
                                                    {event.ville}
                                                </span>
                                                <span>
                                                    <i className="fas fa-tag" style={{ color: '#ff5421', marginRight: '5px' }}></i>
                                                    {event.categorie}
                                                </span>
                                            </div>
                                            
                                            <h3 style={eventTitleStyle}>
                                                <Link to={`/event/${event.id}`} style={{ color: '#333', textDecoration: 'none' }}>
                                                    {event.titre}
                                                </Link>
                                            </h3>
                                            
                                            {/* ✅ Dates de début et de fin */}
                                            <div style={eventDateStyle}>
                                                <span>
                                                    <i className="fas fa-calendar-alt me-1"></i> Début: {formatDate(event.datedebut)}
                                                    
                                                </span>
                                                <span>
                                                    <i className="fas fa-calendar-check me-1"></i> Fin: {formatDate(event.datefin)}
                                                   
                                                </span>
                                            </div>
                                            
                                            <p style={eventDescStyle}>
                                                {event.description?.substring(0, 100)}...
                                            </p>
                                            
                                            {/* ✅ Actions - visible uniquement pour admin et coordinateur */}
                                            {isAdminOrCoord && (
                                                <div style={eventActionsStyle}>
                                                    <Link 
                                                        to={`/event/modifier/${event.id}`} 
                                                        style={editButtonStyle}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = "#e04e1a"}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = "#ff5421"}
                                                    >
                                                        <i className="fas fa-edit"></i> Modifier
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDeleteEvent(event.id)} 
                                                        style={deleteButtonStyle}
                                                        onMouseEnter={(e) => e.target.style.color = "#ff0000"}
                                                        onMouseLeave={(e) => e.target.style.color = "#dc3545"}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash-alt fa-lg"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ✅ Statistiques */}
                    {filteredEvents.length > 0 && (
                        <div className="text-center mt-4">
                            <small className="text-muted">
                                <i className="fas fa-chart-line me-1"></i>
                                Total: {filteredEvents.length} événement(s)
                                {searchTerm && ` (filtré sur ${events.length} total)`}
                            </small>
                        </div>
                    )}
                </div>
            </div>

            <Newsletter
                sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70"
                titleClass="title mb-0 white-color"
            />

            <Footer
                footerClass="rs-footer home9-style main-home"
                footerLogo={footerLogo}
            />

            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
            <ToastContainer position="top-right" />
        </React.Fragment>
    );
};

export default Event;