import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SectionTitle from '../../components/Common/SectionTitle';
import CourseSingle from '../../components/Courses/CourseSingle';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                // Récupérer tous les cours publiés depuis l'API
                const response = await axios.get('http://localhost:8801/api/cours/by-status/published');
                
                let coursesData = [];
                if (response.data.cours && Array.isArray(response.data.cours)) {
                    coursesData = response.data.cours;
                } else if (Array.isArray(response.data)) {
                    coursesData = response.data;
                }
                
                // Ne prendre que les 6 premiers
                const top6Courses = coursesData.slice(0, 6);
                setCourses(top6Courses);
                
                console.log(`Top 6 cours publiés récupérés: ${top6Courses.length}`);
            } catch (error) {
                console.error('Erreur lors de la récupération des cours:', error);
                setError("Impossible de charger les cours.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

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
                {courses.length === 0 ? (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle fa-2x mb-2 d-block"></i>
                    </div>
                ) : (
                    <div className="row">
                        {courses.map((course) => (
                            <div className="col-lg-4 col-md-6 mb-30" key={course.id}>
                                <CourseSingle
                                    itemClass="courses-item"
                                    image={`http://localhost:8801/api/image/${course.image}`}
                                    title={course.titre}
                                    studentQuantity={course.lectureCount || course.nb_etudiants || 0}
                                    lessonsQuantity={course.chapterCount || course.nb_chapitres || 0}
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