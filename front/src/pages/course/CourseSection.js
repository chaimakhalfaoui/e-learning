import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CourseSingleTwo from '../../components/Courses/CourseSingleTwo';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api';

const CoursePart = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentsCount, setStudentsCount] = useState({});
    
    const coursesPerPage = 9;

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchQuery, courses]);

    // Récupérer tous les cours
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/cours/by-status/published`);
            let coursesData = [];
            if (response.data.cours && Array.isArray(response.data.cours)) {
                coursesData = response.data.cours;
            } else if (Array.isArray(response.data)) {
                coursesData = response.data;
            }
            setCourses(coursesData);
            setFilteredCourses(coursesData);
            
            await fetchAllStudentsCount(coursesData);
            
        } catch (error) {
            console.error("Erreur:", error);
            setError("Impossible de charger les cours.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllStudentsCount = async (coursesData) => {
        const counts = {};
        
        await Promise.all(
            coursesData.map(async (course) => {
                try {
                    const response = await axios.get(`${API_URL}/lecture/count/${course.id}`);
                    
                    let count = 0;
                    if (typeof response.data === 'number') {
                        count = response.data;
                    } else if (response.data && typeof response.data === 'object') {
                        count = response.data.lectureCount || response.data.count || 0;
                    }
                    
                    counts[course.id] = count;
                } catch (error) {
                    console.error(`Erreur pour le cours ${course.id}:`, error);
                    counts[course.id] = 0;
                }
            })
        );
        
        setStudentsCount(counts);
    };

    const updateStudentCount = async (courseId, newCount) => {
        setStudentsCount(prev => ({
            ...prev,
            [courseId]: newCount
        }));
        
        try {
            const response = await axios.get(`${API_URL}/lecture/count/${courseId}`);
            let count = typeof response.data === 'number' ? response.data : 0;
            setStudentsCount(prev => ({
                ...prev,
                [courseId]: count
            }));
        } catch (error) {
            console.error("Erreur lors du rafraîchissement:", error);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim() === "") {
            setFilteredCourses(courses);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = courses.filter(course =>
                course.titre?.toLowerCase().includes(query) ||
                course.description?.toLowerCase().includes(query) ||
                course.type?.toLowerCase().includes(query) ||
                course.enseignant?.toLowerCase().includes(query)
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

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    if (loading) {
        return (
            <div className="rs-popular-courses style1 orange-style rs-inner-blog white-bg pt-100 pb-100">
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
            <div className="rs-popular-courses style1 orange-style rs-inner-blog white-bg pt-100 pb-100">
                <div className="container">
                    <div className="alert alert-danger text-center">
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div id="rs-popular-course" className="rs-popular-courses style1 course-view-style orange-style rs-inner-blog white-bg pt-100 pb-100 md-pt-70 md-pb-80">
                <div className="container">
                    {/* Barre de recherche */}
                    <div className="row mb-50">
                        <div className="col-md-10 col-lg-8 mx-auto">
                            <div className="search-widget">
                                <h3 className="widget-title text-center mb-30" style={{ fontSize: '24px', fontWeight: '600' }}>
                                    <i className="fa fa-graduation-cap me-2" style={{ color: '#ff5421' }}></i>
                                    Trouvez le cours qui vous correspond
                                </h3>
                                <div className="search-wrap" style={{ 
                                    display: 'flex', 
                                    gap: '0',
                                    borderRadius: '50px',
                                    overflow: 'hidden',
                                    boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                                }}>
                                    <input
                                        type="search"
                                        placeholder="Rechercher un cours (titre, description, catégorie)..."
                                        value={searchQuery}
                                        onChange={handleSearchInput}
                                        onKeyPress={handleKeyPress}
                                        className="search-input"
                                        style={{ 
                                            flex: 1, 
                                            padding: '15px 20px',
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '15px'
                                        }}
                                    />
                                    <button 
                                        onClick={handleSearch}
                                        style={{ 
                                            padding: '0 30px',
                                            backgroundColor: '#ff5421',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                                    >
                                        <i className="fa fa-search me-2"></i> Rechercher
                                    </button>
                                </div>
                                
                                {searchQuery && (
                                    <div className="search-info text-center mt-3">
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '8px 16px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '30px',
                                            fontSize: '14px'
                                        }}>
                                            <i className="fa fa-chart-line me-1" style={{ color: '#ff5421' }}></i>
                                            {filteredCourses.length} cours trouvé(s) pour "<strong>{searchQuery}</strong>"
                                            <button 
                                                onClick={clearSearch}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ff5421',
                                                    marginLeft: '10px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <i className="fa fa-times-circle"></i> Effacer
                                            </button>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="row mb-40">
                        <div className="col-12">
                            <div className="course-stats" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                padding: '15px 20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '10px'
                            }}>
                                <div>
                                    <i className="fa fa-book me-1" style={{ color: '#ff5421' }}></i>
                                    <strong>{courses.length}</strong> cours disponibles
                                </div>
                                <div>
                                    <i className="fa fa-users me-1" style={{ color: '#ff5421' }}></i>
                                    <strong>{Object.values(studentsCount).reduce((a, b) => a + b, 0)}</strong> étudiants inscrits
                                </div>
                                <div>
                                    <i className="fa fa-clock-o me-1" style={{ color: '#ff5421' }}></i>
                                    <strong>1000+</strong> heures de formation
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Résultats des cours */}
                    {filteredCourses.length === 0 && searchQuery ? (
                        <div className="alert alert-info text-center" style={{ borderRadius: '15px' }}>
                            <i className="fas fa-info-circle fa-3x mb-3 d-block" style={{ color: '#17a2b8' }}></i>
                            <h5>Aucun cours ne correspond à votre recherche</h5>
                        </div>
                    ) : (
                        <>
                            <div className="row">
                                {currentCourses.map((cours) => (
                                    <div className="col-lg-4 col-md-6 mb-30" key={cours.id}>
                                        <CourseSingleTwo
                                            courseClass="courses-item"
                                            courseImg={`${API_URL}/image/${cours.image}`}
                                            courseTitle={cours.titre}
                                            courseDescription={cours.description}
                                            courseCategory={cours.type}
                                            courseDuration={cours.duration}
                                            courseid={cours.id}
                                            studentCount={studentsCount[cours.id] || 0}
                                            onStudentCountChange={updateStudentCount}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination-area orange-color text-center mt-50">
                                    <ul className="pagination-part" style={{ display: 'flex', justifyContent: 'center', gap: '8px', listStyle: 'none' }}>
                                        {currentPage > 1 && (
                                            <li>
                                                <Link 
                                                    to="#" 
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    style={{
                                                        padding: '8px 15px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '5px',
                                                        color: '#ff5421',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <i className="fa fa-long-arrow-left"></i> Précédent
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
                                                        border: '1px solid #ddd',
                                                        borderRadius: '5px',
                                                        backgroundColor: currentPage === number + 1 ? '#ff5421' : 'transparent',
                                                        color: currentPage === number + 1 ? 'white' : '#333',
                                                        textDecoration: 'none'
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
                                                    style={{
                                                        padding: '8px 15px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '5px',
                                                        color: '#ff5421',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    Suivant <i className="fa fa-long-arrow-right"></i>
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default CoursePart;
