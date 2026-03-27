import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 
import axios from "axios";

const CourseSingleTwo = (props) => {
    const { courseid ,courseClass, courseImg, courseTitle, catLink, coursePrice, courseCategory, userCount, userRating } = props;
    const { idUser } = useAuth();
    const [edu, setEdu] = useState();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        const userid = await idUser();
        if(userid===0){
            navigate('/login')
        }
        e.preventDefault();
        try {
           console.log(userid , courseid)
            await axios.post("http://localhost:8801/api/lecture/createLecture", {
                avancement : 1,
                id_cours : courseid,
                id_user:userid,
            });
            try {
            await axios.post("http://localhost:8801/api/avc/createOrUpdateAvc", {
                idCours : courseid,
                iduser:userid,
            });
                }
                catch (err) {
                
                    console.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
            
            }
            navigate(`/course/course/${courseid}`)
            
        } catch (err) {
           
                console.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
           
        }
    };
    const handleSubmitavc = async (e) => {
        const userid = await idUser();
        if(userid===0){
            navigate('/login')
        }
        e.preventDefault();
        try {
           console.log(userid , courseid)
            
            navigate(`/course/course/${courseid}`)
            
        } catch (err) {
           
                console.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
           
        }
    };
       
        const fetchEdu = async () => {
            try {
                const response = await axios.get(`http://localhost:8801/api/lecture/getLectureCours/${courseid}`);
                setEdu(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des événements :", error);
            }
        };

        
    
    useEffect(() => {
        fetchEdu();
       
    }, []);
    return (
        <div className={courseClass ? courseClass : 'courses-item'}>
            <div className="img-part">
                <img
                    src={courseImg}
                    alt={courseTitle}
                />
            </div>
            <div className="content-part">
                <ul className="meta-part">
                    <li><span className="price">{coursePrice ? coursePrice : '55.00'}</span></li>
                    <li><Link className="categorie" to={catLink ? catLink : 'course-categories'}>{courseCategory ? courseCategory : 'Web Development'}</Link></li>
                </ul>
                <h3 className="title"><Link to="#">{courseTitle ? courseTitle : 'Become a PHP Master and Make Money Fast'}</Link></h3>
                <div className="bottom-part">
                    <div className="info-meta">
                        <ul>
                            <li className="user"><i className="fa fa-user"></i> {edu && edu}</li>
                            <li className="ratings">
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <span>({userRating ? userRating : '05'})</span>
                            </li>
                        </ul>
                    </div>
                    <div className="btn-part">
                        <button onClick={handleSubmit}>
                            <i className="flaticon-right-arrow"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseSingleTwo