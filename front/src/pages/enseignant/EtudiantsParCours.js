import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../context/authContext';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import SiteBreadcrumb from '../../components/Common/Breadcumb';

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/2.jpg';

const API_URL = 'http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/api';

const EtudiantsParCours = () => {
    const { idCours } = useParams();
    const { role } = useAuth();
    const [etudiants, setEtudiants] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchEtudiants();
        fetchCourse();
    }, [idCours]);

    const fetchEtudiants = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/cours/etudiants/${idCours}`);
            // Vérifier la structure de la réponse
            if (response.data && Array.isArray(response.data)) {
                setEtudiants(response.data);
            } else if (response.data && response.data.etudiants && Array.isArray(response.data.etudiants)) {
                setEtudiants(response.data.etudiants);
            } else {
                setEtudiants([]);
            }
        } catch (error) {
            console.error("Erreur:", error);
            setError("Impossible de charger la liste des étudiants.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`${API_URL}/cours/getCourse/${idCours}`);
            if (response.data && response.data[0]) {
                setCourse(response.data[0]);
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    const filteredEtudiants = etudiants.filter(etudiant =>
        etudiant.username?.toLowerCase().includes(searchTerm) ||
        etudiant.email?.toLowerCase().includes(searchTerm) ||
        etudiant.telephone?.toLowerCase().includes(searchTerm) ||
        etudiant.genre?.toLowerCase().includes(searchTerm) ||
        etudiant.age?.toString().includes(searchTerm)
    );

    // Statistiques
    const hommesCount = etudiants.filter(e => e.genre === 'Homme').length;
    const femmesCount = etudiants.filter(e => e.genre === 'Femme').length;
    const ageMoyen = etudiants.length > 0 
        ? Math.round(etudiants.reduce((sum, e) => sum + (e.age || 0), 0) / etudiants.length) 
        : 0;
    const progressionMoyenne = etudiants.length > 0
        ? Math.round(etudiants.reduce((sum, e) => sum + (e.progression || 0), 0) / etudiants.length)
        : 0;

    if (loading) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header parentMenu='course' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Étudiants" pageName="Liste des étudiants" breadcrumbsImg={bannerbg} />
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

    return (
        <React.Fragment>
            <Helmet><link rel="icon" href={favIcon} /></Helmet>
            <OffWrap />
            <Header
                parentMenu='course'
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
                pageTitle="Étudiants"
                pageName={`Liste des étudiants`}
                breadcrumbsImg={bannerbg}
            />
            <br />

            <div className="container mt-5">
                {/* Titre du cours */}
                <div className="text-center mb-5">
                    <div className="course-header" style={{
                        background: 'linear-gradient(135deg, #ff5421 0%, #e03a00 100%)',
                        padding: '30px 20px',
                        borderRadius: '15px',
                        color: 'white',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                    }}>
                        <i className="fas fa-graduation-cap fa-3x mb-3"></i>
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
                            {course?.titre || 'Cours'}
                        </h1>
                        <p style={{ fontSize: '16px', opacity: 0.9 }}>
                            <i className="fas fa-users me-2"></i>
                            {etudiants.length} étudiant(s) inscrit(s)
                        </p>
                    </div>
                </div>

                {/* Cartes statistiques */}
                <div className="row mb-4 g-3">
                    <div className="col-md-3">
                        <div className="card text-center border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                            <div className="card-body">
                                <div className="rounded-circle bg-light d-inline-flex p-3 mb-2" style={{ backgroundColor: '#fff3e6 !important' }}>
                                    <i className="fas fa-users fa-2x" style={{ color: '#ff5421' }}></i>
                                </div>
                                <h3 className="mt-2 mb-0" style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff5421' }}>{etudiants.length}</h3>
                                <small className="text-muted">Total étudiants</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                            <div className="card-body">
                                <div className="rounded-circle bg-light d-inline-flex p-3 mb-2">
                                    <i className="fas fa-mars fa-2x" style={{ color: '#007bff' }}></i>
                                </div>
                                <h3 className="mt-2 mb-0">{hommesCount}</h3>
                                <small className="text-muted">Hommes</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                            <div className="card-body">
                                <div className="rounded-circle bg-light d-inline-flex p-3 mb-2">
                                    <i className="fas fa-venus fa-2x" style={{ color: '#ff69b4' }}></i>
                                </div>
                                <h3 className="mt-2 mb-0">{femmesCount}</h3>
                                <small className="text-muted">Femmes</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                            <div className="card-body">
                                <div className="rounded-circle bg-light d-inline-flex p-3 mb-2">
                                    <i className="fas fa-chart-line fa-2x" style={{ color: '#ff5421' }}></i>
                                </div>
                                <h3 className="mt-2 mb-0">{progressionMoyenne}%</h3>
                                <small className="text-muted">Progression moyenne</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="row mb-4">
                    <div className="col-md-6 col-lg-5 mx-auto">
                        <div className="search-box" style={{ position: 'relative' }}>
                            <i className="fas fa-search" style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#ff5421',
                                fontSize: '16px'
                            }}></i>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Rechercher par nom, email, téléphone..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={{
                                    padding: '12px 45px 12px 45px',
                                    borderRadius: '30px',
                                    border: '1px solid #e0e0e0',
                                    fontSize: '14px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#999',
                                        fontSize: '18px'
                                    }}
                                >
                                    <i className="fas fa-times-circle"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {filteredEtudiants.length === 0 ? (
                    <div className="alert alert-info text-center" style={{ borderRadius: '15px', padding: '40px' }}>
                        <i className="fas fa-user-graduate fa-3x mb-3" style={{ color: '#ff5421' }}></i>
                        <h5>Aucun étudiant trouvé</h5>
                        <p className="mb-0">
                            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun étudiant inscrit à ce cours pour le moment.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <thead style={{ backgroundColor: '#ff5421', color: 'white' }}>
                                    <tr>
                                        <th style={{ padding: '15px', width: '50px', textAlign: 'center' }}>#</th>
                                        <th style={{ padding: '15px' }}>Étudiant</th>
                                        <th style={{ padding: '15px' }}>Email</th>
                                        <th style={{ padding: '15px', width: '120px', textAlign: 'center' }}>Téléphone</th>
                                        <th style={{ padding: '15px', width: '80px', textAlign: 'center' }}>Âge</th>
                                        <th style={{ padding: '15px', width: '100px', textAlign: 'center' }}>Genre</th>
                                        <th style={{ padding: '15px', width: '130px', textAlign: 'center' }}>Progression</th>
                                        <th style={{ padding: '15px', width: '110px', textAlign: 'center' }}>Inscription</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEtudiants.map((etudiant, index) => (
                                        <tr key={etudiant.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#ff5421' }}>
                                                {index + 1}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: `linear-gradient(135deg, #ff5421, #e03a00)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}>
                                                        {etudiant.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span style={{ fontWeight: '600', color: '#2c3e50' }}>{etudiant.username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', color: '#555', fontSize: '13px' }}>
                                                <i className="fas fa-envelope me-2" style={{ color: '#ff5421' }}></i>
                                                {etudiant.email || '-'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {etudiant.telephone ? (
                                                    <span style={{ fontSize: '13px', color: '#555' }}>
                                                        <i className="fas fa-phone-alt me-1" style={{ color: '#ff5421' }}></i>
                                                        {etudiant.telephone}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#ccc' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {etudiant.age ? (
                                                    <span style={{ fontWeight: '500', color: '#2c3e50' }}>
                                                        {etudiant.age} <span style={{ fontSize: '11px', color: '#999' }}>ans</span>
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#ccc' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {etudiant.genre === 'Homme' ? (
                                                    <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', display: 'inline-block' }}>
                                                        <i className="fas fa-mars me-1"></i> Homme
                                                    </span>
                                                ) : etudiant.genre === 'Femme' ? (
                                                    <span style={{ background: '#fce4ec', color: '#c2185b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', display: 'inline-block' }}>
                                                        <i className="fas fa-venus me-1"></i> Femme
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#ccc' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', width: '130px' }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ 
                                                            height: '6px', 
                                                            backgroundColor: '#e9ecef', 
                                                            borderRadius: '10px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{ 
                                                                width: `${etudiant.progression || 0}%`, 
                                                                height: '100%', 
                                                                backgroundColor: (etudiant.progression || 0) === 100 ? '#28a745' : '#ff5421',
                                                                borderRadius: '10px',
                                                                transition: 'width 0.3s ease'
                                                            }}></div>
                                                        </div>
                                                    </div>
                                                    <span style={{ 
                                                        fontSize: '12px', 
                                                        fontWeight: '600',
                                                        color: (etudiant.progression || 0) === 100 ? '#28a745' : '#ff5421',
                                                        minWidth: '45px'
                                                    }}>
                                                        {etudiant.progression || 0}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '12px', color: '#7f8c8d', textAlign: 'center' }}>
                                                <i className="fas fa-calendar-alt me-1" style={{ color: '#ff5421' }}></i>
                                                {etudiant.date_inscription ? new Date(etudiant.date_inscription).toLocaleDateString('fr-FR') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Statistiques de fin */}
                        <div className="mt-4 text-center">
                            <div className="d-inline-block px-4 py-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '30px' }}>
                                <small className="text-muted">
                                    <i className="fas fa-users me-1" style={{ color: '#ff5421' }}></i>
                                    {filteredEtudiants.length} étudiant(s) affiché(s)
                                    {etudiants.length > filteredEtudiants.length && ` sur ${etudiants.length} total`}
                                </small>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70" />
            <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
        </React.Fragment>
    );
};

export default EtudiantsParCours;