import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import CourseSidebar from './CourseSidebarSection';
import CourseSingleTwo from '../../components/Courses/CourseSingleTwo';

const CoursePart = () => {
    const [courses, setCourses] = useState([]);
    const [sortOption, setSortOption] = useState("Default");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [filters, setFilters] = useState({ skill: "", duration: "",category:"" });
    const coursesPerPage = 10;

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        sortCourses();
    }, [sortOption]);

    const fetchCourses = async () => {
        try {
            const response = await axios.get("http://localhost:8801/api/cours/getAllCourses");
            setCourses(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    const handleFilterLevel = (level) => {
        setFilters(prevFilters => ({ ...prevFilters, skill: level }));
    };

    const handleFilterDuration = (duration) => {
        setFilters(prevFilters => ({ ...prevFilters, duration: duration }));
    };
    const handleCategoryChange = (category) => {
        setFilters(prevFilters => ({ ...prevFilters, category: category }));
    };

    const sortCourses = () => {
        let sortedCourses = [...courses];
        if (sortOption === "Newest") {
            sortedCourses.sort((a, b) => new Date(b.dateCre) - new Date(a.dateCre));
        } else if (sortOption === "Old") {
            sortedCourses.sort((a, b) => new Date(a.dateCre) - new Date(b.dateCre));
        }
        setCourses(sortedCourses);
    };

    const listClassAdd = () => {
        document.getElementById("rs-popular-course").classList.add('list-view');
    };

    const listClassRemove = () => {
        document.getElementById("rs-popular-course").classList.remove('list-view');
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const filteredCourses = courses.filter(course =>
        course.titre.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filters.skill ? course.level === filters.skill : true) &&
        (filters.duration ? course.duration == filters.duration : true)&&
        (filters.category ? course.type == filters.category : true)
    );

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    return (
        <div id="rs-popular-course" className="rs-popular-courses style1 course-view-style orange-style rs-inner-blog white-bg pt-100 pb-100 md-pt-70 md-pb-80">
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 col-md-12 order-last">
                        <CourseSidebar handleSearch={handleSearchChange} handleFilterLevel={handleFilterLevel} handleFilterDuration={handleFilterDuration} handleFilterCategory={handleCategoryChange} />
                    </div>
                    <div className="col-lg-8 pr-50 md-pr-14">
                        <div className="course-search-part">
                            <div className="course-view-part">
                                <div className="view-icons">
                                    <button onClick={listClassRemove} className="view-grid mr-10"><i className="fa fa-th-large"></i></button>
                                    <button onClick={listClassAdd} className="view-list"><i className="fa fa-list-ul"></i></button>
                                </div>
                                <div className="view-text">Showing {indexOfFirstCourse + 1}-{Math.min(indexOfLastCourse, filteredCourses.length)} of {filteredCourses.length} results</div>
                            </div>
                            <div className="type-form">
                                <form method="post" action="#">
                                    <div className="form-group mb-0">
                                        <div className="custom-select-box">
                                            <select id="timing" onChange={handleSortChange}>
                                                <option value="Default">Default</option>
                                                <option value="Newest">Newest</option>
                                                <option value="Old">Old</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="course-part clearfix">
                            {currentCourses.map((cours) => (
                                <CourseSingleTwo
                                    key={cours.id}
                                    courseClass="courses-item"
                                    courseImg={`http://localhost:8801/api/image/${cours.image}`}
                                    courseTitle={cours.titre}
                                    coursePrice="FREE"
                                    courseCategory={cours.type}
                                    courseid={cours.id}
                                />
                            ))}
                        </div>
                        <div className="pagination-area orange-color text-center mt-30 md-mt-0">
                            <ul className="pagination-part">
                                {[...Array(totalPages).keys()].map((number) => (
                                    <li key={number + 1} className={currentPage === number + 1 ? 'active' : ''}>
                                        <Link to="#" onClick={() => handlePageChange(number + 1)}>
                                            {number + 1}
                                        </Link>
                                    </li>
                                ))}
                                {currentPage < totalPages && (
                                    <li>
                                        <Link to="#" onClick={() => handlePageChange(currentPage + 1)}>Next <i className="fa fa-long-arrow-right"></i></Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CoursePart;