import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CourseSingleFour from '../../components/Courses/CourseSingleFour';
import { useAuth } from '../../context/authContext'; 
import { Helmet } from 'react-helmet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Courses = () => {
    const { idUser, role } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'enseignant' && userRole !== 'admin') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur rôle utilisateur:", error);
                navigate('/404');
            }
        };
        checkAccess();
    }, [role, navigate]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const id_user = await idUser();
            const response = await axios.get(`http://localhost:8801/api/cours/getAllCoursesId/${id_user}`);
            const coursesData = Array.isArray(response.data) ? response.data : [];
            setCourses(coursesData);
            setFilteredCourses(coursesData);
        } catch (error) {
            console.error("Erreur lors de la récupération des cours :", error);
            setError("Impossible de charger la liste des cours.");
            toast.error("Erreur lors du chargement des cours");
        } finally {
            setLoading(false);
        }
    };

    // Appliquer les filtres
    useEffect(() => {
        if (courses.length === 0) return;
        
        let filtered = [...courses];
        
        if (searchTerm) {
            filtered = filtered.filter(cours => 
                cours.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cours.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter !== "all") {
            filtered = filtered.filter(cours => cours.status === statusFilter);
        }
        
        setFilteredCourses(filtered);
    }, [courses, searchTerm, statusFilter]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const clearSearch = () => {
        setSearchTerm("");
        setStatusFilter("all");
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
    };

    const handleCourseDelete = async (courseId) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce cours ?")) {
            try {
                await axios.delete(`http://localhost:8801/api/cours/deleteCourse/${courseId}`);
                await fetchCourses();
                toast.success("Cours supprimé avec succès !");
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                toast.error("Erreur lors de la suppression du cours.");
            }
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'published') {
            return { text: 'Publié', color: '#28a745', icon: 'fa-check-circle', bgColor: '#d4edda' };
        }
        return { text: 'Caché', color: '#dc3545', icon: 'fa-eye-slash', bgColor: '#f8d7da' };
    };

    const searchContainerStyle = {
        marginBottom: "20px",
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

    const filterButtonStyle = (isActive) => ({
        padding: "8px 20px",
        fontSize: "14px",
        border: `1px solid ${isActive ? '#ff5421' : '#ddd'}`,
        borderRadius: "20px",
        backgroundColor: isActive ? '#ff5421' : '#fff',
        color: isActive ? '#fff' : '#666',
        cursor: "pointer",
        transition: "all 0.3s ease"
    });

    const resultCountStyle = {
        textAlign: "center",
        marginTop: "20px",
        marginBottom: "20px",
        color: "#666",
        fontSize: "14px"
    };

    if (loading) {
        return (
            <div className="rs-popular-courses style3 orange-style pt-100 pb-100 md-pt-70 md-pb-80">
                <div className="container text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des cours...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rs-popular-courses style3 orange-style pt-100 pb-100 md-pt-70 md-pb-80">
                <div className="container">
                    <div className="alert alert-danger text-center">
                        <i className="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
                        <p>{error}</p>
                        <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Helmet>
                <title>Mes Cours | ISETSO</title>
            </Helmet>
            
            <div className="rs-popular-courses style3 orange-style pt-100 pb-100 md-pt-70 md-pb-80">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-30">
                        <h2 className="mb-3 mb-md-0">
                            <i className="fas fa-book-open me-2" style={{ color: '#ff5421' }}></i>
                            Mes Cours
                            {filteredCourses.length > 0 && (
                                <span className="badge bg-secondary ms-2">{filteredCourses.length}</span>
                            )}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleStatusFilterChange("all")} style={filterButtonStyle(statusFilter === "all")}>
                            Tous
                        </button>
                        <button onClick={() => handleStatusFilterChange("published")} style={filterButtonStyle(statusFilter === "published")}>
                            <i className="fas fa-check-circle me-1"></i> Publiés
                        </button>
                        <button onClick={() => handleStatusFilterChange("hidden")} style={filterButtonStyle(statusFilter === "hidden")}>
                            <i className="fas fa-eye-slash me-1"></i> Cachés
                        </button>
                    </div>

                    {courses.length > 0 && (
                        <div style={searchContainerStyle}>
                            <input
                                type="text"
                                placeholder="🔍 Rechercher un cours..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={searchInputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#ff5421"}
                                onBlur={(e) => e.target.style.borderColor = "#ddd"}
                            />
                            {(searchTerm || statusFilter !== "all") && (
                                <button onClick={clearSearch} style={clearButtonStyle}>
                                    ✖ Effacer
                                </button>
                            )}
                        </div>
                    )}

                    {!loading && !error && courses.length > 0 && (
                        <div style={resultCountStyle}>
                            <i className="fas fa-chalkboard me-2"></i> 
                            {filteredCourses.length} cours trouvé(s) sur {courses.length} total
                            {searchTerm && ` pour "${searchTerm}"`}
                            {statusFilter !== "all" && ` • ${statusFilter === "published" ? "Publiés" : "Cachés"}`}
                        </div>
                    )}

                    {filteredCourses.length === 0 && searchTerm && (
                        <div className="alert alert-warning text-center">
                            <i className="fas fa-search"></i>
                            <p className="mt-2 mb-2">
                                Aucun cours ne correspond à votre recherche "<strong>{searchTerm}</strong>"
                            </p>
                        </div>
                    )}

                    {filteredCourses.length === 0 && !searchTerm && courses.length === 0 && (
                        <div className="alert alert-info text-center">
                            <i className="fas fa-info-circle fa-2x mb-2 d-block"></i>
                            <p>Vous n'avez pas encore créé de cours.</p>
                        </div>
                    )}

                    {filteredCourses.length > 0 && (
                        <div className="row">
                            {filteredCourses.map((cours) => (
                                <div key={cours.id} className="col-lg-4 col-md-6 col-sm-6 mb-40">
                                    <CourseSingleFour
                                        btnLink={cours.id}
                                        courseClass="courses-item"
                                        courseImg={`http://localhost:8801/api/image/${cours.image}`}
                                        courseCategory={cours.type}
                                        courseTitle={cours.titre}
                                        studentQuantity="0"
                                        onDelete={() => handleCourseDelete(cours.id)}
                                        status={cours.status}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredCourses.length > 0 && (
                        <div className="text-center mt-4">
                            <small className="text-muted">
                                <i className="fas fa-chart-line me-1"></i>
                                Total: {filteredCourses.length} cours
                                {searchTerm && ` (filtré sur ${courses.length} total)`}
                                {statusFilter !== "all" && ` • ${statusFilter === "published" ? "📢 Publiés" : "🔒 Cachés"}`}
                            </small>
                        </div>
                    )}
                </div>
            </div>
            
            <ToastContainer position="top-right" />
        </React.Fragment>
    );
};

export default Courses;