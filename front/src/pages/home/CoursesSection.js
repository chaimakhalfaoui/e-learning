import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SectionTitle from '../../components/Common/SectionTitle';
import CourseSingle from '../../components/Courses/CourseSingle';

const API_URL = 'http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/api';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
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
            } catch (error) {
                console.error('Erreur:', error);
                setError("Impossible de charger les cours.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Filtrer par recherche
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCourses(courses);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = courses.filter(course =>
                course.titre?.toLowerCase().includes(term) ||
                course.description?.toLowerCase().includes(term) ||
                course.type?.toLowerCase().includes(term)
            );
            setFilteredCourses(filtered);
        }
    }, [searchTerm, courses]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    if (loading) {
        return (
            <div className="rs-popular-courses main-home event-bg pt-100 pb-100 md-pt-70 md-pb-70">
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
            <div className="rs-popular-courses main-home event-bg pt-100 pb-100 md-pt-70 md-pb-70">
                <div className="container">
                    <div className="alert alert-danger text-center">
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rs-popular-courses main-home event-bg pt-100 pb-100 md-pt-70 md-pb-70">
            <div className="container">
                <SectionTitle
                    sectionClass="sec-title3 text-center mb-44"
                    subtitleClass="sub-title"
                    subtitle="Sélectionnez des cours"
                    titleClass="title black-color"
                    title="Découvrez les cours populaires"
                />

                {/* Barre de recherche */}
                <div style={{
                    marginBottom: '30px',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <i className="fa fa-search" style={{
                            position: 'absolute',
                            left: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#999'
                        }}></i>
                        <input
                            type="text"
                            placeholder="Rechercher un cours..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{
                                width: '100%',
                                padding: '12px 20px 12px 40px',
                                fontSize: '14px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '30px',
                                outline: 'none'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#999'
                                }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle fa-2x mb-2 d-block"></i>
                        <p>Aucun cours trouvé pour "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="row">
                        {filteredCourses.slice(0, 6).map((course) => (
                            <div className="col-lg-4 col-md-6 mb-30" key={course.id}>
                                <CourseSingle
                                    itemClass="courses-item"
                                    image={course.image?.startsWith("http") ? course.image : "/placeholder.svg"}
                                    title={course.titre}
                                    description={course.description}
                                    category={course.type}
                                    duration={course.duration}
                                    studentQuantity={course.nb_etudiants || 0}
                                    lessonsQuantity={course.nb_chapitres || 0}
                                    courseLink={course.id}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Courses;