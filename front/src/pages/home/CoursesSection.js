import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SectionTitle from '../../components/Common/SectionTitle';
import CourseSingle from '../../components/Courses/CourseSingle';

const Courses = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Effectuer une requête pour récupérer les données des cours depuis votre backend
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:8801/api/lecture/getTop6CoursesByLecture');
                setCourses(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des cours:', error);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="rs-popular-courses main-home event-bg pt-100 pb-100 md-pt-70 md-pb-70">
            <div className="container">
                <SectionTitle
                    sectionClass="sec-title3 text-center mb-44"
                    subtitleClass="sub-title"
                    subtitle="Select Courses"
                    titleClass="title black-color"
                    title="Explore Popular Courses"
                />
                <div className="row">
                    {courses.map(course => (
                        <div className="col-lg-4 col-md-6 mb-30" key={course.id}>
                            <CourseSingle
                                itemClass="courses-item"
                                image={`http://localhost:8801/api/image/${course.image}`}
                                title={course.titre}
                                pricing="Free"
                                studentQuantity={course.lectureCount}
                                lessonsQuantity={course.chapterCount}
                                courseLink={course.id_cours}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Courses;