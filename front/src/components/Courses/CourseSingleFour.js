import axios from 'axios';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseSingleFour = (props) => {
    const { btnLink, courseClass, courseCategory, courseImg, catLink, courseTitle, coursePrice, studentQuantity, userRating, btnText, metaIcon, onDelete  } = props;
    const { idUser } = useAuth();
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8801/api/cours/deleteCourse/${btnLink}`);
            toast.success('Course deleted successfully', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            onDelete()
        } catch (error) {
            toast.error('An error occurred while deleting the course', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <div style={{ height: "480px" }} className={courseClass ? courseClass : 'courses-item'}>
            <button className='supprimer-cours' onClick={handleDelete}>
                <img width="28" height="28" src="https://img.icons8.com/ios-filled/50/FA5252/twitterx--v1.png" alt="delete" />
            </button>
            <div className="img-part">
                <img
                    src={courseImg}
                    alt={courseTitle}
                />
            </div>
            <div className="content-part">
                <span>
                    <Link className="categories" to={catLink ? catLink : 'course-categories'}>{courseCategory ? courseCategory : 'Web Development'}</Link>
                </span>
                <ul className="meta-part">
                    <li className="user">
                        <i className={metaIcon ? metaIcon : 'fa fa-user'}></i> {studentQuantity ? studentQuantity : '245'}
                    </li>
                    <li>
                        <span>
                            {coursePrice ? coursePrice : '$55.00'}
                        </span>
                    </li>
                </ul>
                <h3 className="title"><Link to="/course/course-single">{courseTitle ? courseTitle : 'Introduction to Quantitativ and Qualitative.'}</Link></h3>
                <div className="bottom-part">
                    <div className="info-meta">
                        <ul className="course-meta">
                            <li className="ratings">
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <span>({userRating ? userRating : '03'})</span>
                            </li>
                        </ul>
                    </div>
                    <div className="btn-part">
                        <Link to={btnLink && idUser ? `/admin/createchapitre/${btnLink}` : '#'}>Chapitre cours <i className="flaticon-next"></i></Link>
                    </div>
                    <div className="btn-part">
                        <Link to={btnLink && idUser ? `/cours/modifier/${btnLink}` : '#'}>Modifier Cours <i className="flaticon-next"></i></Link>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default CourseSingleFour;