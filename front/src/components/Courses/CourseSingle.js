import React from 'react';
import { Link } from 'react-router-dom';

const CourseSingle = (props) => {
    // Formater le nombre d'étudiants
    const formatStudentCount = (count) => {
        if (!count) return '0';
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'k';
        }
        return count.toString();
    };

    // Afficher les étoiles
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 4.5);
        const hasHalfStar = (rating % 1) >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<i key={i} className="fa fa-star" style={{ color: '#ff5421' }}></i>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<i key={i} className="fa fa-star-half-o" style={{ color: '#ff5421' }}></i>);
            } else {
                stars.push(<i key={i} className="fa fa-star-o" style={{ color: '#ff5421' }}></i>);
            }
        }
        return stars;
    };

    return (
        <div className={props.itemClass}>
            <div className="courses-grid">
                <div className="img-part">
                    <Link to={`/course/course/${props.courseLink}`}>
                        <img
                            src={props.image || "https://via.placeholder.com/400x250?text=Image+non+disponible"}
                            alt={props.title || "Cours"}
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/400x250?text=Image+non+disponible";
                            }}
                        />
                    </Link>
                </div>
                <div className="content-part">
                    <div className="info-meta">
                        <ul>
                            <li className="ratings">
                                {renderStars(props.rating)}
                                <span>({props.reviewCount} notation(s))</span>
                            </li>
                        </ul>
                    </div>
                    <h3 className="title">
                        <Link to={`/course/course/${props.courseLink}`}>
                            {props.title}
                        </Link>
                    </h3>
                    <ul className="meta-part">
                        <li className="user">
                            <i className="fa fa-user"></i>
                            {formatStudentCount(props.studentQuantity)} Étudiants
                        </li>
                        <li className="user">
                            <i className="fa fa-file"></i>
                            {props.lessonsQuantity} Leçons
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

CourseSingle.defaultProps = {
    itemClass: 'courses-item',
    studentQuantity: 0,
    lessonsQuantity: 0,
    rating: 4.5,
    reviewCount: 0,
    title: 'Titre du cours',
    courseLink: '#'
};

export default CourseSingle;