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

const Users = () => {
    const { idUser, role } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Vérification des droits d'accès (seul l'admin peut accéder)
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'admin') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du rôle:", error);
                navigate('/404');
            }
        };
        
        checkAccess();
    }, [role, navigate]);

    // Récupération des utilisateurs
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:8801/api/users");
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            setError("Impossible de charger la liste des utilisateurs.");
        } finally {
            setLoading(false);
        }
    };

    // Fonction de recherche
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        if (term === "") {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => 
                user.username?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.role?.toLowerCase().includes(term) ||
                user.telephone?.toLowerCase().includes(term) ||
                user.genre?.toLowerCase().includes(term) ||
                user.id?.toString().includes(term)
            );
            setFilteredUsers(filtered);
        }
    };

    // Effacer la recherche
    const clearSearch = () => {
        setSearchTerm("");
        setFilteredUsers(users);
    };

    // Suppression d'un utilisateur
    const handleDelete = async (id, username) => {
        if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur "${username}" ?`)) {
            try {
                await axios.delete(`http://localhost:8801/api/users/${id}`);
                const updatedUsers = users.filter(user => user.id !== id);
                setUsers(updatedUsers);
                setFilteredUsers(updatedUsers);
                alert("Utilisateur supprimé avec succès !");
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                alert("Erreur lors de la suppression de l'utilisateur.");
            }
        }
    };

    // Obtenir la classe CSS pour le badge de rôle
    const getRoleBadgeClass = (role) => {
        switch(role) {
            case 'admin':
                return 'bg-danger';
            case 'coordinateur':
                return 'bg-warning';
            case 'enseignant':
                return 'bg-info';
            case 'etudiant':
                return 'bg-success';
            default:
                return 'bg-secondary';
        }
    };

    // Obtenir l'icône pour le rôle
    const getRoleIcon = (role) => {
        switch(role) {
            case 'admin':
                return 'fa-user-shield';
            case 'coordinateur':
                return 'fa-users-gear';
            case 'enseignant':
                return 'fa-chalkboard-user';
            case 'etudiant':
                return 'fa-user-graduate';
            default:
                return 'fa-user';
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
                <Header parentMenu='admin' secondParentMenu='users' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='admin@isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Liste des Utilisateurs" pageName="Users" breadcrumbsImg={bannerbg} />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des utilisateurs...</p>
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
                <Header parentMenu='admin' secondParentMenu='users' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='admin@isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Liste des Utilisateurs" pageName="Users" breadcrumbsImg={bannerbg} />
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
                secondParentMenu='users'
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
                pageTitle="Liste des Utilisateurs"
                pageName="Users"
                breadcrumbsImg={bannerbg}
            />
            <br />

            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                    <h2>
                        <i className="fas fa-users me-2" style={{ color: '#ff5421' }}></i>
                        Liste des Utilisateurs
                        {filteredUsers.length > 0 && (
                            <span className="badge bg-secondary ms-2">{filteredUsers.length}</span>
                        )}
                    </h2>
                         {/* Barre de recherche */}
                <div style={searchContainerStyle}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par nom, email, rôle, téléphone..."
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
                </div>

           

                {filteredUsers.length === 0 && searchTerm && (
                    <div className="alert alert-warning text-center">
                        <i className="fas fa-search"></i>
                        <p className="mt-2 mb-0">
                            Aucun utilisateur ne correspond à votre recherche "<strong>{searchTerm}</strong>"
                        </p>
                        <button className="btn btn-link" onClick={clearSearch}>
                            Afficher tous les utilisateurs
                        </button>
                    </div>
                )}

                {filteredUsers.length === 0 && !searchTerm && (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle"></i>
                        <p className="mt-2 mb-0">Aucun utilisateur trouvé.</p>
                    </div>
                )}

                {filteredUsers.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nom d'utilisateur</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Âge</th>
                                    <th>Téléphone</th>
                                    <th>Genre</th>
                                    <th>Date création</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id ?? '_'}</td>
                                        <td>
                                            <i className={`fas ${getRoleIcon(user.role)} me-2`} style={{ color: '#ff5421' }}></i>
                                            {user.username ?? '_'}
                                        </td>
                                        <td>
                                            <i className="fas fa-envelope me-2" style={{ color: '#ff5421' }}></i>
                                            {user.email ?? '_'}
                                        </td>
                                        <td>
                                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                                <i className={`fas ${getRoleIcon(user.role)} me-1`}></i>
                                                {user.role ?? '_'}
                                            </span>
                                        </td>
                                        <td>{user.age ?? '_'} ans</td>
                                        <td>
                                            <i className="fas fa-phone me-2" style={{ color: '#ff5421' }}></i>
                                            {user.telephone ?? '_'}
                                        </td>
                                        <td>
                                            {user.genre === 'Homme' ? (
                                                <i className="fas fa-mars me-1" style={{ color: '#007bff' }}></i>
                                            ) : user.genre === 'Femme' ? (
                                                <i className="fas fa-venus me-1" style={{ color: '#ff69b4' }}></i>
                                            ) : (
                                                <i className="fas fa-genderless me-1"></i>
                                            )}
                                            {user.genre ?? '_'}
                                        </td>
                                        <td>
                                            <i className="fas fa-calendar-alt me-2" style={{ color: '#ff5421' }}></i>
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '_'}
                                        </td>
                                        <td className="text-center">
                                            <Link 
                                                to={`/users/edit/${user.id}`} 
                                                className="me-3" 
                                                title="Modifier"
                                                style={{ color: '#007bff', textDecoration: 'none' }}
                                            >
                                                <i className="fas fa-edit fa-lg"></i>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.id, user.username)}
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
                {filteredUsers.length > 0 && (
                    <div className="mt-3 text-muted text-center">
                        <small>
                            <i className="fas fa-chart-line me-1"></i>
                            Total: {filteredUsers.length} utilisateur(s)
                            {searchTerm && ` (filtré sur ${users.length} total)`}
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

export default Users;