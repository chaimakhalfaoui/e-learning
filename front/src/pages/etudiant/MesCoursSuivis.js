import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../context/authContext';
import CourseSingleTwo from '../../components/Courses/CourseSingleTwo';
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

const API_URL = 'http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api';

const MesCoursSuivis = () => {
    const { idUser, role } = useAuth();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState({});
    const [totalHours, setTotalHours] = useState(0);
    const [completedCourses, setCompletedCourses] = useState(0);
    const [inProgressCount, setInProgressCount] = useState(0);
    
    const coursesPerPage = 9;

    // Couleurs calmes pour le thème
    const colors = {
        primary: '#4A90A4',      // Bleu calme
        primaryLight: '#6BA5B8',  // Bleu clair
        primaryDark: '#3A7383',   // Bleu foncé
        success: '#5A9E6E',       // Vert doux
        successLight: '#7BB58C',  // Vert clair
        warning: '#D4A05A',       // Jaune orangé doux
        warningLight: '#E0B87A',  // Jaune clair
        info: '#6B8CAE',          // Bleu grisé
        infoLight: '#8BA8C4',     // Bleu grisé clair
        grayBg: '#F5F7FA',        // Fond gris clair
        border: '#E1E8EE',        // Bordure douce
        textDark: '#4A5568',      // Texte foncé
        textLight: '#718096'      // Texte clair
    };

    useEffect(() => {
        fetchMesCours();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchQuery, courses]);

    const fetchMesCours = async () => {
        setLoading(true);
        setError(null);
        try {
            const userId = await idUser();
            
            if (!userId) {
                setError("Utilisateur non identifié.");
                setLoading(false);
                return;
            }
            
            let coursesData = [];
            let success = false;
            let totalH = 0;
            let completed = 0;
            let inProgress = 0;
            
            // Essai 1: student-courses
            try {
                const response = await axios.get(`${API_URL}/cours/student-courses/${userId}`);
                if (response.data && response.data.success && Array.isArray(response.data.cours)) {
                    coursesData = response.data.cours;
                    success = true;
                }
            } catch (e) {
                console.log("Endpoint student-courses non disponible:", e.message);
            }
            
            // Essai 2: fallback
            if (!success) {
                const allCoursesResponse = await axios.get(`${API_URL}/cours/by-status/published`);
                let allCourses = [];
                
                if (allCoursesResponse.data && allCoursesResponse.data.cours && Array.isArray(allCoursesResponse.data.cours)) {
                    allCourses = allCoursesResponse.data.cours;
                } else if (Array.isArray(allCoursesResponse.data)) {
                    allCourses = allCoursesResponse.data;
                }
                
                const filtered = [];
                for (const course of allCourses) {
                    try {
                        const progRes = await axios.get(`${API_URL}/avc/avc/${course.id}/${userId}`);
                        if (progRes.data && progRes.data.avc !== undefined) {
                            filtered.push(course);
                            const prog = progRes.data.avc || 0;
                            if (prog === 100) completed++;
                            if (prog > 0 && prog < 100) inProgress++;
                            if (course.duration) totalH += parseInt(course.duration) || 0;
                        }
                    } catch (e) {}
                }
                coursesData = filtered;
                success = true;
            }
            
            setCourses(coursesData);
            setFilteredCourses(coursesData);
            
            const progressData = {};
            for (const course of coursesData) {
                try {
                    const progRes = await axios.get(`${API_URL}/avc/avc/${course.id}/${userId}`);
                    const prog = progRes.data?.avc || 0;
                    progressData[course.id] = prog;
                    if (prog === 100) completed++;
                    if (prog > 0 && prog < 100) inProgress++;
                    if (course.duration) totalH += parseInt(course.duration) || 0;
                } catch (e) {
                    progressData[course.id] = 0;
                }
            }
            setProgress(progressData);
            setCompletedCourses(completed);
            setInProgressCount(inProgress);
            setTotalHours(totalH);
            
        } catch (error) {
            console.error("Erreur:", error);
            setError("Impossible de charger vos cours.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim() === "") {
            setFilteredCourses(courses);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = courses.filter(course =>
                (course.titre?.toLowerCase().includes(query)) ||
                (course.description?.toLowerCase().includes(query)) ||
                (course.categorie?.toLowerCase().includes(query)) ||
                (course.type?.toLowerCase().includes(query)) ||
                (course.enseignant?.toLowerCase().includes(query))
            );
            setFilteredCourses(filtered);
        }
        setCurrentPage(1);
    };

    const handleSearchInput = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setFilteredCourses(courses);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getProgressColor = (value) => {
        if (value < 30) return colors.warning;
        if (value < 70) return colors.info;
        return colors.success;
    };

    const getStatusLabel = (value) => {
        if (value === 0) return 'Non commencé';
        if (value < 30) return 'Débutant';
        if (value < 70) return 'En progression';
        if (value < 100) return 'Presque fini';
        return 'Terminé';
    };

    // Pagination
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    if (loading) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header parentMenu='course' secondParentMenu='etucours' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Mes Cours" pageName="Mes Cours Suivis" breadcrumbsImg={bannerbg} />
                <div className="container mt-5 text-center">
                    <div className="spinner-border" role="status" style={{ color: colors.primary }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3" style={{ color: colors.textLight }}>Chargement de vos cours...</p>
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
                <Header parentMenu='course' secondParentMenu='etucours' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Mes Cours" pageName="Mes Cours Suivis" breadcrumbsImg={bannerbg} />
                <div className="container mt-5">
                    <div className="alert alert-danger text-center" style={{ backgroundColor: '#FDE8E8', borderColor: '#F5C6C6', color: '#DC3545' }}>
                        <i className="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
                        <p>{error}</p>
                        <button className="btn btn-primary mt-2" onClick={fetchMesCours} style={{ backgroundColor: colors.primary, border: 'none' }}>
                            <i className="fas fa-sync-alt me-2"></i>Réessayer
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
            <Helmet><link rel="icon" href={favIcon} /></Helmet>
            <OffWrap />
            <Header
                parentMenu='course'
                secondParentMenu='etucours'
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
                pageTitle="Mes Cours"
                pageName="Mes Cours Suivis"
                breadcrumbsImg={bannerbg}
            />
            <br />

            <div className="container mt-5">
                {/* En-tête avec statistiques - Couleurs calmes */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="dashboard-stats" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                                padding: '20px',
                                borderRadius: '15px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <i className="fa fa-book-open fa-2x mb-2"></i>
                                <h3 style={{ fontSize: '28px', marginBottom: '5px' }}>{courses.length}</h3>
                                <p style={{ margin: 0, opacity: 0.9 }}>Cours suivis</p>
                            </div>
                            <div style={{
                                background: `linear-gradient(135deg, ${colors.success}, ${colors.successLight})`,
                                padding: '20px',
                                borderRadius: '15px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <i className="fa fa-check-circle fa-2x mb-2"></i>
                                <h3 style={{ fontSize: '28px', marginBottom: '5px' }}>{completedCourses}</h3>
                                <p style={{ margin: 0, opacity: 0.9 }}>Cours terminés</p>
                            </div>
                            <div style={{
                                background: `linear-gradient(135deg, ${colors.warning}, ${colors.warningLight})`,
                                padding: '20px',
                                borderRadius: '15px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <i className="fa fa-chart-line fa-2x mb-2"></i>
                                <h3 style={{ fontSize: '28px', marginBottom: '5px' }}>{inProgressCount}</h3>
                                <p style={{ margin: 0, opacity: 0.9 }}>En progression</p>
                            </div>
                            <div style={{
                                background: `linear-gradient(135deg, ${colors.info}, ${colors.infoLight})`,
                                padding: '20px',
                                borderRadius: '15px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <i className="fa fa-hourglass-half fa-2x mb-2"></i>
                                <h3 style={{ fontSize: '28px', marginBottom: '5px' }}>{totalHours}</h3>
                                <p style={{ margin: 0, opacity: 0.9 }}>Heures de formation</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="search-widget">
                            <div className="search-wrap" style={{ 
                                display: 'flex', 
                                gap: '0',
                                borderRadius: '50px',
                                overflow: 'hidden',
                                boxShadow: `0 5px 20px rgba(0,0,0,0.05)`
                            }}>
                                <input
                                    type="search"
                                    placeholder="Rechercher dans mes cours..."
                                    value={searchQuery}
                                    onChange={handleSearchInput}
                                    onKeyPress={handleKeyPress}
                                    className="search-input"
                                    style={{ 
                                        flex: 1, 
                                        padding: '15px 20px',
                                        border: `1px solid ${colors.border}`,
                                        borderRight: 'none',
                                        outline: 'none',
                                        fontSize: '15px',
                                        borderRadius: '50px 0 0 50px'
                                    }}
                                />
                                <button 
                                    onClick={handleSearch}
                                    style={{ 
                                        padding: '0 30px',
                                        backgroundColor: colors.primary,
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = colors.primaryDark}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = colors.primary}
                                >
                                    <i className="fa fa-search me-2"></i> Rechercher
                                </button>
                            </div>
                            
                            {searchQuery && (
                                <div className="text-center mt-3">
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        backgroundColor: colors.grayBg,
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        color: colors.textLight
                                    }}>
                                        {filteredCourses.length} cours trouvé(s) pour "{searchQuery}"
                                        <button 
                                            onClick={clearSearch}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: colors.primary,
                                                marginLeft: '10px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✖ Effacer
                                        </button>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Résultats */}
                {filteredCourses.length === 0 && searchQuery && (
                    <div className="alert alert-info text-center" style={{ backgroundColor: colors.grayBg, borderColor: colors.border, color: colors.textLight }}>
                        <i className="fas fa-info-circle fa-2x mb-2 d-block" style={{ color: colors.primary }}></i>
                        <h5>Aucun cours ne correspond à votre recherche</h5>
                        <button className="btn btn-link" onClick={clearSearch} style={{ color: colors.primary }}>
                            Afficher tous mes cours
                        </button>
                    </div>
                )}
                
                {filteredCourses.length === 0 && !searchQuery && courses.length === 0 && (
                    <div className="alert alert-info text-center" style={{ backgroundColor: colors.grayBg, borderColor: colors.border, color: colors.textLight }}>
                        <i className="fas fa-book-open fa-3x mb-3 d-block" style={{ color: colors.primary }}></i>
                        <h5>Vous n'avez pas encore de cours suivis</h5>
                        <p>Commencez votre apprentissage en vous inscrivant à un cours.</p>
                        <Link to="/course" className="btn btn-primary mt-3" style={{ backgroundColor: colors.primary, border: 'none' }}>
                            <i className="fa fa-search me-2"></i> Découvrir des cours
                        </Link>
                    </div>
                )}

                {filteredCourses.length > 0 && (
                    <>
                        <div className="row">
                            {currentCourses.map((cours) => (
                                <div className="col-lg-4 col-md-6 mb-30" key={cours.id}>
                                    <CourseSingleTwo
                                        courseClass="courses-item"
                                        courseImg={`${API_URL}/image/${cours.image}`}
                                        courseTitle={cours.titre}
                                        courseDescription={cours.description}
                                        courseCategory={cours.categorie || cours.type}
                                        courseid={cours.id}
                                        progression={progress[cours.id] || 0}
                                        showProgress={true}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-area text-center mt-50">
                                <ul className="pagination-part" style={{ display: 'flex', justifyContent: 'center', gap: '8px', listStyle: 'none' }}>
                                    {currentPage > 1 && (
                                        <li>
                                            <Link 
                                                to="#" 
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                style={{ padding: '8px 15px', border: `1px solid ${colors.border}`, borderRadius: '5px', color: colors.primary }}
                                            >
                                                <i className="fa fa-chevron-left"></i> Précédent
                                            </Link>
                                        </li>
                                    )}
                                    
                                    {[...Array(Math.min(totalPages, 5)).keys()].map((number) => (
                                        <li key={number + 1}>
                                            <Link 
                                                to="#" 
                                                onClick={() => handlePageChange(number + 1)}
                                                style={{
                                                    padding: '8px 15px',
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '5px',
                                                    backgroundColor: currentPage === number + 1 ? colors.primary : 'transparent',
                                                    color: currentPage === number + 1 ? 'white' : colors.textDark
                                                }}
                                            >
                                                {number + 1}
                                            </Link>
                                        </li>
                                    ))}
                                    
                                    {currentPage < totalPages && (
                                        <li>
                                            <Link 
                                                to="#" 
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                style={{ padding: '8px 15px', border: `1px solid ${colors.border}`, borderRadius: '5px', color: colors.primary }}
                                            >
                                                Suivant <i className="fa fa-chevron-right"></i>
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                        
                        {/* Statistiques des résultats */}
                        <div className="text-center mt-4">
                            <small style={{ color: colors.textLight }}>
                                <i className="fas fa-chart-line me-1"></i>
                                Affichage de {indexOfFirstCourse + 1} à {Math.min(indexOfLastCourse, filteredCourses.length)} sur {filteredCourses.length} cours
                                {searchQuery && ` (filtré sur ${courses.length} total)`}
                            </small>
                        </div>
                    </>
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
};

export default MesCoursSuivis;