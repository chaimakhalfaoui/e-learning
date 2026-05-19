import React from 'react';
import { Link } from 'react-router-dom';

const CourseSingle = (props) => {
    // Formater le nombre d'étudiants
    const formatStudentCount = (count) => {
        if (!count && count !== 0) return '0';
        const numCount = parseInt(count) || 0;
        if (numCount >= 1000) {
            return (numCount / 1000).toFixed(1) + 'k';
        }
        return numCount.toString();
    };

    // Formater la durée
    const formatDuration = (duration) => {
        if (!duration) return null;
        if (typeof duration === 'string') return duration;
        const hours = Math.floor(duration);
        const minutes = Math.round((duration - hours) * 60);
        if (hours === 0) return `${minutes}min`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}min`;
    };

    // Tronquer la description
    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className={props.itemClass}>
            <div className="courses-grid">
                <div className="img-part">
                    <Link to={`/course/course/${props.courseLink}`}>
                        <img
                            src={props.image || "/placeholder.svg"}
                            alt={props.title || "Cours"}
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = "/placeholder.svg";
                            }}
                        />
                        {props.category && (
                            <span style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                backgroundColor: '#ff5421',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                {props.category}
                            </span>
                        )}
                        {props.duration && formatDuration(props.duration) && (
                            <span style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px'
                            }}>
                                <i className="fa fa-clock-o me-1"></i>
                                {formatDuration(props.duration)}
                            </span>
                        )}
                    </Link>
                </div>
                <div className="content-part">
                    <h3 className="title">
                        <Link to={`/course/course/${props.courseLink}`}>
                            {props.title || 'Titre du cours'}
                        </Link>
                    </h3>
                    
                    {/* Description */}
                    {props.description && (
                        <p style={{
                            fontSize: '13px',
                            color: '#666',
                            marginBottom: '12px',
                            lineHeight: '1.5'
                        }}>
                            {truncateDescription(props.description)}
                        </p>
                    )}
                
                    
                    <div style={{
                        marginTop: '10px',
                        paddingTop: '10px',
                        borderTop: '1px solid #eee'
                    }}>
                        <Link 
                            to={`/course`}
                            style={{
                                color: '#ff5421',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                textDecoration: 'none'
                            }}
                        >
                            Voir plus des cours <i className="fa fa-arrow-right ms-1"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

CourseSingle.defaultProps = {
    itemClass: 'courses-item',
    title: 'Titre du cours',
    courseLink: '#',
    image: null,
    category: null,
    duration: null,
    description: null,
};

export default CourseSingle;