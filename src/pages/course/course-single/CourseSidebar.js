import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalVideo from 'react-modal-video';
import { Link,useParams } from 'react-router-dom';
import { useAuth } from '../../../context/authContext'; 

// Image
import videoImg from '../../../assets/img/about/about-video-bg2.png';

const CourseSidebar = () => {
    const { id } = useParams();
    const [courses, setCourses] = useState([]);
    const [edu, setEdu] = useState();
    const [complete,setComplete]=useState(0)
    const { idUser } = useAuth();
    useEffect(() => {
        
        fetchCourses();
        fetchEdu();
        fetchDataC();
    }, []);

        const fetchDataC = async () => {
            const userid = await idUser();
            try {
                const response = await axios.get(`http://localhost:8801/api/avc/avc/${id}/${userid}`);
                setComplete(response.data.avc);
            } catch (error) {
                console.error('Error fetching AVC data:', error);
            }
            
        };

        


    const fetchCourses = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/cours/getCourse/${id}`);
            setCourses(response.data[0]);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const fetchEdu = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/lecture/getLectureCours/${id}`);
            setEdu(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(!isOpen);

    return (
        <div className="inner-column">
            <ModalVideo channel='youtube' isOpen={isOpen} videoId='YLN1Argi7ik' onClose={() => { openModal(); }} />
            <div className="intro-video media-icon orange-color2">
                {courses.image && <img className="video-img" src={`http://localhost:8801/api/image/${courses.image}`} alt="Video Image" />}
                <Link className="popup-videos" >
                    <i className="fa fa-play"></i>
                </Link>
                <h4>Preview this course</h4>
            </div>
            <div className="course-features-info">
                <ul>
                    {/* <li className="lectures-feature">
                        <i className="fa fa-files-o"></i>
                        <span className="label">Lectures</span>
                        <span className="value">3</span>
                    </li> */}
                    
                    <li className="quizzes-feature">
                        <i className="fa fa-puzzle-piece"></i>
                        <span className="label">Quizzes</span>
                        <span className="value">1</span>
                    </li>
                    
                    <li className="duration-feature">
                        <i className="fa fa-clock-o"></i>
                        <span className="label">Duration</span>
                        <span className="value">{courses.duration && courses.duration} heur</span>
                    </li>
                    
                    <li className="students-feature">
                        <i className="fa fa-users"></i>
                        <span className="label">Students</span>
                        <span className="value">{edu && edu}</span>
                    </li>
                    
                    {/* <li className="assessments-feature">
                        <i className="fa fa-check-square-o"></i>
                        <span className="label">Assessments</span>
                        <span className="value">Yes</span>
                    </li> */}
                </ul>
            </div>          
            <div class="max-w-sm mx-auto bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
                <div class="px-5 py-3 flex justify-between items-center">
                    <h3 class="text-zinc-900 dark:text-white text-lg">Progress</h3>
                    <svg
                    stroke-width="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    fill="none"
                    class="h-6 w-6 text-zinc-900 dark:text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                    ></path>
                    </svg>
                </div>
                <div class="px-5 pb-5">
                    
                    <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2-5">
                        <div class="bg-blue-600 h-2-8 rounded-full"> <div style={{ width: complete ? `${complete}%` : "0%" }} className={`bg-blue-600 h- rounded-full`}></div></div>
                    </div>
                    <div class="flex justify-between items-center mt-3">
                    <span class="text-sm text-zinc-600 dark:text-zinc-400">{complete}% Complete</span>
                    </div>
                </div>
            </div>      
            
        </div>
    );
}

export default CourseSidebar;