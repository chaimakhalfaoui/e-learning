import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link ,useParams} from 'react-router-dom';

const OverviewPart = () => {
    const { id } = useParams();
    const [course, setCourse] = useState([]);
    const [chapitre, setChapitre] = useState([]);
    const [edu, setEdu] = useState();

    useEffect(() => {
        fetchEdu();
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {

            const response = await axios.get(`http://localhost:8801/api/cours/getCourse/${id}`);
            setCourse(response.data[0]);
            const responsec = await axios.get(`http://localhost:8801/api/chapitre/getChapitre/${id}`);
            setChapitre(responsec.data);
            console.log(response.data[0])
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
    return (
        <div className="content white-bg pt-30">
            <div className="course-overview">
            { !chapitre || !course ?
            <div  className='ext-modal'>
                <div class="col-3">
                    <div class="snippet" data-title="dot-spin">
                        <div class="stage">
                        <div class="dot-spin"></div>
                        </div>
                    </div>
                </div>
            </div>
           :
                <div className="inner-box">
                    <h4>{course && course.titre}</h4>
                    <p>{course && course.description}</p>
                    <ul className="student-list">
                        <li>{edu && edu} Total Students</li>
                        {/* <li><span className="theme_color">4.5</span> <span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span> (1254 Rating)</li>
                        <li>256 Reviews</li> */}
                    </ul>
                    <h3>What you’ll learn?</h3>
                    <ul className="review-list">
                    {chapitre && chapitre.map((chapitre, index) => (
                        <li>{chapitre.nom_chapitre}</li>
                    ))}
                    </ul>
                </div>}
            </div>
        </div>
    );
}

export default OverviewPart;