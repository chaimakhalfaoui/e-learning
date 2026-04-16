import axios from 'axios';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseSingleFour = (props) => {
    const { 
        btnLink, 
        courseClass, 
        courseCategory, 
        courseImg, 
        catLink, 
        courseTitle, 
        studentQuantity, 
        userRating, 
        metaIcon, 
        onDelete,
        status 
    } = props;
    const { idUser } = useAuth();
    const navigate = useNavigate();

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (window.confirm("Voulez-vous vraiment supprimer ce cours ?")) {
            try {
                await axios.delete(`http://localhost:8801/api/cours/deleteCourse/${btnLink}`);
                toast.success('Cours supprimé avec succès !');
                if (onDelete) onDelete();
            } catch (error) {
                console.error("Erreur:", error);
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    // Badge de statut
    const getStatusBadge = (status) => {
        if (status === 'published') {
            return { text: 'Publié', color: '#28a745', icon: 'fa-check-circle', bgColor: '#d4edda' };
        }
        return { text: 'Caché', color: '#dc3545', icon: 'fa-eye-slash', bgColor: '#f8d7da' };
    };

    const statusInfo = getStatusBadge(status);

    return (
        <div style={{ height: "480px", position: "relative" }} className={courseClass ? courseClass : 'courses-item'}>
            {/* Bouton supprimer */}
            <button 
                className='supprimer-cours' 
                onClick={handleDelete}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    padding: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
            >
                <img width="20" height="20" src="https://img.icons8.com/ios-filled/50/FA5252/trash.png" alt="delete" />
            </button>

            {/* Badge de statut */}
            {status && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: 10,
                    backgroundColor: statusInfo.bgColor,
                    color: statusInfo.color,
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <i className={`fas ${statusInfo.icon}`}></i>
                    {statusInfo.text}
                </div>
            )}

            <div className="img-part">
                <img
                    src={courseImg || "https://via.placeholder.com/400x250?text=Image+non+disponible"}
                    alt={courseTitle || "Cours"}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x250?text=Image+non+disponible";
                    }}
                />
            </div>
            <div className="content-part">
                <span>
                    <Link className="categories" to={catLink ? catLink : 'course-categories'}>
                        {courseCategory ? courseCategory : 'Web Development'}
                    </Link>
                </span>
                <ul className="meta-part">
                    <li className="user">
                        <i className={metaIcon ? metaIcon : 'fa fa-user'}></i> 
                        {studentQuantity ? studentQuantity : '0'}
                    </li>
                    <li><span>Étudiants</span></li>
                </ul>
                <h3 className="title">
                    <Link to={`/course/course/${btnLink}`}>
                        {courseTitle ? courseTitle : 'Introduction to Quantitativ and Qualitative.'}
                    </Link>
                </h3>
                <div className="bottom-part">
                    <div className="info-meta">
                        <ul className="course-meta">
                            <li className="ratings">
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <span>({userRating ? userRating : '4.5'})</span>
                            </li>
                        </ul>
                    </div>
                    <div className="btn-part">
                        <Link to={btnLink && idUser ? `/admin/createchapitre/${btnLink}` : '#'}>
                            Chapitre cours <i className="flaticon-next"></i>
                        </Link>
                    </div>
                    <div className="btn-part">
                        <Link to={btnLink && idUser ? `/cours/modifier/${btnLink}` : '#'}>
                            Modifier Cours <i className="flaticon-next"></i>
                        </Link>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" />
        </div>
    );
};

export default CourseSingleFour;