import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CourseSingleFour from '../../components/Courses/CourseSingleFour';
import { useAuth } from '../../context/authContext'; 
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

const API_URL = 'http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api';

const Courses = () => {
    const { idUser, role } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [validationFilter, setValidationFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'enseignant' && userRole !== 'admin') {
                    navigate('/404');
                }
            } catch (error) {
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
        try {
            const id_user = await idUser();
            const response = await axios.get(`${API_URL}/cours/my-courses-validation/${id_user}`);
            const coursesData = Array.isArray(response.data) ? response.data : [];
            
            // CORRECTION : Utiliser la nouvelle route /lecture/count/:id
            const coursesWithStudentCount = await Promise.all(
                coursesData.map(async (course) => {
                    try {
                        // Changement ici : /getLectureCours/ → /count/
                        const studentCountResponse = await axios.get(`${API_URL}/lecture/count/${course.id}`);
                        // La réponse peut être un nombre directement ou un objet
                        let count = 0;
                        if (typeof studentCountResponse.data === 'number') {
                            count = studentCountResponse.data;
                        } else if (studentCountResponse.data && typeof studentCountResponse.data === 'object') {
                            count = studentCountResponse.data.lectureCount || studentCountResponse.data.count || 0;
                        } else {
                            count = studentCountResponse.data || 0;
                        }
                        return { ...course, studentCount: count };
                    } catch (error) {
                        console.error(`Erreur pour le cours ${course.id}:`, error);
                        return { ...course, studentCount: 0 };
                    }
                })
            );
            
            setCourses(coursesWithStudentCount);
            setFilteredCourses(coursesWithStudentCount);
        } catch (error) {
            console.error("Erreur:", error);
            setError("Impossible de charger la liste des cours.");
            toast.error("Erreur lors du chargement des cours");
        } finally {
            setLoading(false);
        }
    };

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
        
        if (validationFilter !== "all") {
            filtered = filtered.filter(cours => cours.validation_status === validationFilter);
        }
        
        setFilteredCourses(filtered);
    }, [courses, searchTerm, statusFilter, validationFilter]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const clearSearch = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setValidationFilter("all");
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
    };

    const handleValidationFilterChange = (status) => {
        setValidationFilter(status);
    };

    // Soumettre à validation (enseignant)
    const requestValidation = async (courseId) => {
        if (window.confirm("Soumettre ce cours à la validation du coordinateur ?")) {
            setUpdating(courseId);
            try {
                const response = await axios.put(`${API_URL}/cours/request-validation/${courseId}`, {
                    message: "Je soumets ce cours à validation"
                });
                if (response.status === 200) {
                    const updatedCourses = courses.map(course => 
                        course.id === courseId ? { ...course, validation_status: 'pending' } : course
                    );
                    setCourses(updatedCourses);
                    setFilteredCourses(updatedCourses);
                    toast.success("✅ Demande de validation envoyée au coordinateur");
                }
            } catch (error) {
                console.error("Erreur:", error);
                toast.error("❌ Erreur lors de la demande de validation");
            } finally {
                setUpdating(null);
            }
        }
    };

    const handleCourseDelete = useCallback(async (courseId) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce cours ?")) {
            try {
                await axios.delete(`${API_URL}/cours/deleteCourse/${courseId}`);
                setCourses(prev => prev.filter(c => c.id !== courseId));
                setFilteredCourses(prev => prev.filter(c => c.id !== courseId));
                toast.success("Cours supprimé avec succès !");
            } catch (error) {
                toast.error("Erreur lors de la suppression du cours.");
            }
        }
    }, []);

    const filterButtonStyle = (isActive) => ({
        padding: "8px 20px",
        fontSize: "14px",
        border: `1px solid ${isActive ? '#ff5421' : '#ddd'}`,
        borderRadius: "20px",
        backgroundColor: isActive ? '#ff5421' : '#fff',
        color: isActive ? '#fff' : '#666',
        cursor: "pointer"
    });

    if (loading) {
        return (
            <div className="rs-popular-courses style3 orange-style pt-100 pb-100">
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
            <div className="rs-popular-courses style3 orange-style pt-100 pb-100">
                <div className="container">
                    <div className="alert alert-danger text-center">
                        <i className="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchCourses}>Réessayer</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rs-popular-courses style3 orange-style pt-100 pb-100 md-pt-70 md-pb-80">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center flex-wrap mb-30">
                    <h2>
                        <i className="fas fa-book-open me-2" style={{ color: '#ff5421' }}></i>
                        Mes Cours
                        {filteredCourses.length > 0 && (
                            <span className="badge bg-secondary ms-2">{filteredCourses.length}</span>
                        )}
                    </h2>
                </div>

                {/* Filtres par statut de publication */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleStatusFilterChange("all")} style={filterButtonStyle(statusFilter === "all")}>Tous</button>
                    <button onClick={() => handleStatusFilterChange("published")} style={filterButtonStyle(statusFilter === "published")}><i className="fas fa-check-circle me-1"></i> Publiés</button>
                    <button onClick={() => handleStatusFilterChange("hidden")} style={filterButtonStyle(statusFilter === "hidden")}><i className="fas fa-eye-slash me-1"></i> Cachés</button>
                </div>


                {/* Barre de recherche */}
                {courses.length > 0 && (
                    <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
                        <input
                            type="text"
                            placeholder="🔍 Rechercher un cours..."
                            value={searchTerm}
                            onChange={handleSearch}
                            style={{
                                width: "300px",
                                padding: "10px 15px",
                                border: "1px solid #ddd",
                                borderRadius: "25px",
                                outline: "none"
                            }}
                        />
                        {(searchTerm || statusFilter !== "all" || validationFilter !== "all") && (
                            <button onClick={clearSearch} style={{ padding: "10px 15px", border: "1px solid #ddd", borderRadius: "25px", backgroundColor: "#f8f9fa", cursor: "pointer" }}>
                                ✖ Effacer
                            </button>
                        )}
                    </div>
                )}

                {filteredCourses.length === 0 && searchTerm && (
                    <div className="alert alert-warning text-center">
                        <p>Aucun cours ne correspond à votre recherche "<strong>{searchTerm}</strong>"</p>
                    </div>
                )}

                {filteredCourses.length === 0 && !searchTerm && courses.length === 0 && (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle fa-2x mb-2 d-block"></i>
                        <p>Vous n'avez pas encore créé de cours.</p>
                    </div>
                )}

                {/* Liste des cours */}
                {filteredCourses.length > 0 && (
                    <div className="row">
                        {filteredCourses.map((cours) => (
                            <div key={cours.id} className="col-lg-4 col-md-6 col-sm-6 mb-40">
                                <CourseSingleFour
                                    btnLink={cours.id}
                                    courseImg={cours.image && cours.image.startsWith("http") ? cours.image : `${API_URL}/image/${cours.image}`}
                                    courseCategory={cours.type}
                                    courseTitle={cours.titre}
                                    courseDescription={cours.description}
                                    courseDuration={cours.duration}
                                    studentCount={cours.studentCount || 0}
                                    onDelete={handleCourseDelete}
                                    status={cours.status}
                                    validationStatus={cours.validation_status}
                                    onRequestValidation={() => requestValidation(cours.id)}
                                    updating={updating === cours.id}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
