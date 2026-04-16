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

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/2.jpg';

const Etudiants = () => {
    const { idUser, role } = useAuth();
    const [etudiants, setEtudiants] = useState([]);
    const [filteredEtudiants, setFilteredEtudiants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    // Vérification des droits d'accès
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRoleValue = await role();
                setUserRole(userRoleValue);
                
                // Autoriser uniquement coordinateur, admin ou enseignant
                if (userRoleValue !== 'coordinateur' && userRoleValue !== 'admin' && userRoleValue !== 'enseignant') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du rôle:", error);
                navigate('/404');
            }
        };
        
        checkAccess();
    }, [role, navigate]);

    // Récupération des étudiants
    useEffect(() => {
        fetchEtudiants();
    }, []);

    const fetchEtudiants = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:8801/api/etudiants");
            setEtudiants(response.data);
            setFilteredEtudiants(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des étudiants:", error);
            setError("Impossible de charger la liste des étudiants.");
        } finally {
            setLoading(false);
        }
    };

    // Fonction de recherche
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        if (term === "") {
            setFilteredEtudiants(etudiants);
        } else {
            const filtered = etudiants.filter(etd => 
                etd.username?.toLowerCase().includes(term) ||
                etd.email?.toLowerCase().includes(term) ||
                etd.telephone?.toLowerCase().includes(term) ||
                etd.genre?.toLowerCase().includes(term) ||
                etd.id?.toString().includes(term)
            );
            setFilteredEtudiants(filtered);
        }
    };

    // Effacer la recherche
    const clearSearch = () => {
        setSearchTerm("");
        setFilteredEtudiants(etudiants);
    };

    // Suppression d'un étudiant
    const handleDelete = async (id, username) => {
        if (window.confirm(`Voulez-vous vraiment supprimer l'étudiant "${username}" ?`)) {
            try {
                await axios.delete(`http://localhost:8801/api/etudiants/${id}`);
                const updatedEtudiants = etudiants.filter(etd => etd.id !== id);
                setEtudiants(updatedEtudiants);
                setFilteredEtudiants(updatedEtudiants);
                alert("Étudiant supprimé avec succès !");
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                alert("Erreur lors de la suppression de l'étudiant.");
            }
        }
    };

    // Styles personnalisés
    const searchContainerStyle = {
        marginBottom: "20px",
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
    };

    const searchInputStyle = {
        padding: "10px 15px",
        fontSize: "14px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        outline: "none",
        width: "300px",
        transition: "all 0.3s ease"
    };

    const clearButtonStyle = {
        padding: "10px 15px",
        fontSize: "14px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        backgroundColor: "#f8f9fa",
        cursor: "pointer",
        transition: "all 0.3s ease"
    };

    const addButtonStyle = {
        backgroundColor: "#ff5421",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px"
    };

    if (loading) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header parentMenu='admin' secondParentMenu='etudiants' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Liste des Etudiants" pageName="Etudiants" breadcrumbsImg={bannerbg} />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des étudiants...</p>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
            </React.Fragment>
        );
    }

    if (error) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header parentMenu='admin' secondParentMenu='etudiants' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Liste des Etudiants" pageName="Etudiants" breadcrumbsImg={bannerbg} />
                <div className="container mt-5">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Erreur !</h4>
                        <p>{error}</p>
                        <hr />
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
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

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='admin'
                secondParentMenu='etudiants'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='isetso.rnu.tn'
                Location='Cité Erriadh - B.P 135'
            />

            <SiteBreadcrumb
                pageTitle="Liste des Etudiants"
                pageName="Etudiants"
                breadcrumbsImg={bannerbg}
            />
            <br />

            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                    <h2>
                        <i className="fas fa-users me-2" style={{ color: '#ff5421' }}></i>
                        Liste des Étudiants
                        {filteredEtudiants.length > 0 && (
                            <span className="badge bg-secondary ms-2">{filteredEtudiants.length}</span>
                        )}
                    </h2>
                    <div className="btn-part">
                        <Link className="readon orange-btn transparent" to="/admin/createetudiant" style={addButtonStyle}>
                            <i className="fas fa-plus me-2"></i> Ajouter Étudiant
                        </Link>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div style={searchContainerStyle}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par nom, email, téléphone..."
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

                {filteredEtudiants.length === 0 && searchTerm && (
                    <div className="alert alert-warning text-center">
                        <i className="fas fa-search"></i>
                        <p className="mt-2 mb-0">
                            Aucun étudiant ne correspond à votre recherche "<strong>{searchTerm}</strong>"
                        </p>
                        <button className="btn btn-link" onClick={clearSearch}>
                            Afficher tous les étudiants
                        </button>
                    </div>
                )}

                {filteredEtudiants.length === 0 && !searchTerm && (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle"></i>
                        <p className="mt-2 mb-0">Aucun étudiant trouvé.</p>
                        <Link to="/admin/createetudiant" className="btn btn-primary mt-3">
                            <i className="fas fa-plus me-2"></i> Ajouter votre premier étudiant
                        </Link>
                    </div>
                )}

                {filteredEtudiants.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nom d'utilisateur</th>
                                    <th>Email</th>
                                    <th>Âge</th>
                                    <th>Téléphone</th>
                                    <th>Genre</th>
                                    <th>Date création</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEtudiants.map(etd => (
                                    <tr key={etd.id}>
                                        <td>{etd.id ?? '_'}</td>
                                        <td>
                                            <i className="fas fa-user-graduate me-2" style={{ color: '#ff5421' }}></i>
                                            {etd.username ?? '_'}
                                        </td>
                                        <td>
                                            <i className="fas fa-envelope me-2" style={{ color: '#ff5421' }}></i>
                                            {etd.email ?? '_'}
                                        </td>
                                        <td>{etd.age ?? '_'} ans</td>
                                        <td>
                                            <i className="fas fa-phone me-2" style={{ color: '#ff5421' }}></i>
                                            {etd.telephone ?? '_'}
                                        </td>
                                        <td>
                                            {etd.genre === 'Homme' ? (
                                                <i className="fas fa-mars me-1" style={{ color: '#007bff' }}></i>
                                            ) : etd.genre === 'Femme' ? (
                                                <i className="fas fa-venus me-1" style={{ color: '#ff69b4' }}></i>
                                            ) : (
                                                <i className="fas fa-genderless me-1"></i>
                                            )}
                                            {etd.genre ?? '_'}
                                        </td>
                                        <td>
                                            <i className="fas fa-calendar-alt me-2" style={{ color: '#ff5421' }}></i>
                                            {etd.created_at ? new Date(etd.created_at).toLocaleDateString('fr-FR') : '_'}
                                        </td>
                                        <td className="text-center">
                                            <Link 
                                                to={`/etudiants/edit/${etd.id}`} 
                                                className="me-3" 
                                                title="Modifier"
                                                style={{ color: '#007bff', textDecoration: 'none' }}
                                            >
                                                <i className="fas fa-edit fa-lg"></i>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(etd.id, etd.username)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    padding: 0,
                                                    cursor: "pointer",
                                                    color: "red"
                                                }}
                                                title="Supprimer"
                                            >
                                                <i className="fas fa-trash fa-lg"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Statistiques */}
                {filteredEtudiants.length > 0 && (
                    <div className="mt-3 text-muted text-center">
                        <small>
                            <i className="fas fa-chart-line me-1"></i>
                            Total: {filteredEtudiants.length} étudiant(s)
                            {searchTerm && ` (filtré sur ${etudiants.length} total)`}
                        </small>
                    </div>
                )}
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
        </React.Fragment>
    );
}

export default Etudiants;