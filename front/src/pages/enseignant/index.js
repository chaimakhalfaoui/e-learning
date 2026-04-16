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

const Enseignants = () => {
    const { idUser, role } = useAuth();
    const [enseignants, setEnseignants] = useState([]);
    const [filteredEnseignants, setFilteredEnseignants] = useState([]);
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
                
                // Autoriser uniquement coordinateur ou admin
                if (userRoleValue !== 'coordinateur' && userRoleValue !== 'admin') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du rôle:", error);
                navigate('/404');
            }
        };
        
        checkAccess();
    }, [role, navigate]);

    // Récupération des enseignants
    useEffect(() => {
        fetchEnseignants();
    }, []);

    const fetchEnseignants = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:8801/api/enseignants");
            setEnseignants(response.data);
            setFilteredEnseignants(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des enseignants:", error);
            setError("Impossible de charger la liste des enseignants.");
        } finally {
            setLoading(false);
        }
    };

    // Fonction de recherche
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        if (term === "") {
            setFilteredEnseignants(enseignants);
        } else {
            const filtered = enseignants.filter(ens => 
                ens.username?.toLowerCase().includes(term) ||
                ens.email?.toLowerCase().includes(term) ||
                ens.telephone?.toLowerCase().includes(term) ||
                ens.genre?.toLowerCase().includes(term) ||
                ens.id?.toString().includes(term)
            );
            setFilteredEnseignants(filtered);
        }
    };

    // Effacer la recherche
    const clearSearch = () => {
        setSearchTerm("");
        setFilteredEnseignants(enseignants);
    };

    // Suppression d'un enseignant
    const handleDelete = async (id, username) => {
        if (window.confirm(`Voulez-vous vraiment supprimer l'enseignant "${username}" ?`)) {
            try {
                await axios.delete(`http://localhost:8801/api/enseignants/${id}`);
                const updatedEnseignants = enseignants.filter(ens => ens.id !== id);
                setEnseignants(updatedEnseignants);
                setFilteredEnseignants(updatedEnseignants);
                alert("Enseignant supprimé avec succès !");
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                alert("Erreur lors de la suppression de l'enseignant.");
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
                <Header parentMenu='admin' secondParentMenu='enseignants' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Liste des Enseignants" pageName="Enseignants" breadcrumbsImg={bannerbg} />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des enseignants...</p>
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
                <Header parentMenu='admin' secondParentMenu='enseignants' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Liste des Enseignants" pageName="Enseignants" breadcrumbsImg={bannerbg} />
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
                secondParentMenu='enseignants'
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
                pageTitle="Liste des Enseignants"
                pageName="Enseignants"
                breadcrumbsImg={bannerbg}
            />
            <br />

            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                    <h2>
                        <i className="fas fa-chalkboard-user me-2" style={{ color: '#ff5421' }}></i>
                        Liste des Enseignants
                        {filteredEnseignants.length > 0 && (
                            <span className="badge bg-secondary ms-2">{filteredEnseignants.length}</span>
                        )}
                    </h2>
                    <div className="btn-part">
                        <Link className="readon orange-btn transparent" to="/admin/createns" style={addButtonStyle}>
                            <i className="fas fa-plus me-2"></i> Ajouter Enseignant
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

                {filteredEnseignants.length === 0 && searchTerm && (
                    <div className="alert alert-warning text-center">
                        <i className="fas fa-search"></i>
                        <p className="mt-2 mb-0">
                            Aucun enseignant ne correspond à votre recherche "<strong>{searchTerm}</strong>"
                        </p>
                        <button className="btn btn-link" onClick={clearSearch}>
                            Afficher tous les enseignants
                        </button>
                    </div>
                )}

                {filteredEnseignants.length === 0 && !searchTerm && (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle"></i>
                        <p className="mt-2 mb-0">Aucun enseignant trouvé.</p>
                        <Link to="/admin/createns" className="btn btn-primary mt-3">
                            <i className="fas fa-plus me-2"></i> Ajouter votre premier enseignant
                        </Link>
                    </div>
                )}

                {filteredEnseignants.length > 0 && (
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
                                {filteredEnseignants.map(ens => (
                                    <tr key={ens.id}>
                                        <td>{ens.id ?? '_'}</td>
                                        <td>
                                            <i className="fas fa-chalkboard-user me-2" style={{ color: '#ff5421' }}></i>
                                            {ens.username ?? '_'}
                                        </td>
                                        <td>
                                            <i className="fas fa-envelope me-2" style={{ color: '#ff5421' }}></i>
                                            {ens.email ?? '_'}
                                        </td>
                                        <td>{ens.age ?? '_'} ans</td>
                                        <td>
                                            <i className="fas fa-phone me-2" style={{ color: '#ff5421' }}></i>
                                            {ens.telephone ?? '_'}
                                        </td>
                                        <td>
                                            {ens.genre === 'Homme' ? (
                                                <i className="fas fa-mars me-1" style={{ color: '#007bff' }}></i>
                                            ) : ens.genre === 'Femme' ? (
                                                <i className="fas fa-venus me-1" style={{ color: '#ff69b4' }}></i>
                                            ) : (
                                                <i className="fas fa-genderless me-1"></i>
                                            )}
                                            {ens.genre ?? '_'}
                                        </td>
                                        <td>
                                            <i className="fas fa-calendar-alt me-2" style={{ color: '#ff5421' }}></i>
                                            {ens.created_at ? new Date(ens.created_at).toLocaleDateString('fr-FR') : '_'}
                                        </td>
                                        <td className="text-center">
                                            <Link 
                                                to={`/enseignants/edit/${ens.id}`} 
                                                className="me-3" 
                                                title="Modifier"
                                                style={{ color: '#007bff', textDecoration: 'none' }}
                                            >
                                                <i className="fas fa-edit fa-lg"></i>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(ens.id, ens.username)}
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
                {filteredEnseignants.length > 0 && (
                    <div className="mt-3 text-muted text-center">
                        <small>
                            <i className="fas fa-chart-line me-1"></i>
                            Total: {filteredEnseignants.length} enseignant(s)
                            {searchTerm && ` (filtré sur ${enseignants.length} total)`}
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

export default Enseignants;