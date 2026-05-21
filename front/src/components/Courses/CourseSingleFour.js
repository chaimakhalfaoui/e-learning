import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 
import { toast } from 'react-toastify';

const CourseSingleFour = ({ 
    btnLink, 
    courseImg, 
    courseCategory, 
    courseTitle, 
    courseDescription,
    courseDuration,
    studentCount,
    onDelete,
    status,
    validationStatus,
    onRequestValidation,
    updating
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!window.confirm("Supprimer ce cours ?")) return;
        
        setIsDeleting(true);
        try {
            await axios.delete(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/cours/deleteCourse/${btnLink}`);
            toast.success('Cours supprimé !');
            if (onDelete) onDelete(btnLink);
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatStudentCount = (count) => {
        if (!count) return '0';
        const num = parseInt(count);
        return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
    };

    const formatDuration = (duration) => {
        if (!duration) return null;
        const hours = parseFloat(duration);
        if (isNaN(hours)) return null;
        if (hours === 1) return "1 heure";
        if (hours % 1 === 0) return `${hours} heures`;
        return `${hours} heures`;
    };

    const truncateDesc = (text) => {
        if (!text) return '';
        return text.length > 80 ? text.substring(0, 80) + '...' : text;
    };

    const getStatusStyle = (status) => {
        if (status === 'published') {
            return { text: '✓ Publié', bgColor: '#28a745', color: 'white' };
        }
        return { text: '🔒 Caché', bgColor: '#dc3545', color: 'white' };
    };

    const getValidationBadge = () => {
        if (validationStatus === 'approved') {
            return { text: '✓ Validé', bgColor: '#d4edda', color: '#155724' };
        }
        if (validationStatus === 'pending') {
            return { text: '⏳ En attente', bgColor: '#fff3cd', color: '#856404' };
        }
        if (validationStatus === 'rejected') {
            return { text: '✗ Rejeté', bgColor: '#f8d7da', color: '#721c24' };
        }
        return null;
    };

    const statusStyle = getStatusStyle(status);
    const validationBadge = getValidationBadge();
    const durationText = formatDuration(courseDuration);
    const studentText = formatStudentCount(studentCount);
    const descText = truncateDesc(courseDescription);

    return (
        <div className="courses-item" style={{ position: 'relative', height: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            
            {/* Bouton supprimer */}
            {onDelete && (
                <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        zIndex: 10,
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        padding: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                >
                    {isDeleting ? <span style={{fontSize:"12px"}}>⏳</span> : <img width="16" height="16" src="https://img.icons8.com/ios-filled/50/FA5252/trash.png" alt="delete" />}
                </button>
            )}

            {/* Badge statut publication */}
            {statusStyle && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 10,
                    backgroundColor: statusStyle.bgColor,
                    color: statusStyle.color,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                }}>
                    {statusStyle.text}
                </div>
            )}

            {/* Badge validation */}
            {validationBadge && (
                <div style={{
                    position: 'absolute',
                    top: '38px',
                    left: '8px',
                    zIndex: 10,
                    backgroundColor: validationBadge.bgColor,
                    color: validationBadge.color,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '9px',
                    fontWeight: 'bold'
                }}>
                    {validationBadge.text}
                </div>
            )}

            {/* Image */}
            <Link to={`/course/course/${btnLink}`}>
                <img
                    src={courseImg || "/placeholder.svg"}
                    alt={courseTitle}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
            </Link>

            {/* Contenu */}
            <div style={{ padding: '12px' }}>
                <span style={{ fontSize: '11px', color: '#ff5421', textTransform: 'uppercase' }}>
                    {courseCategory || 'Catégorie'}
                </span>
                
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '8px 0' }}>
                    <Link to={`/course/course/${btnLink}`} style={{ color: '#333', textDecoration: 'none' }}>
                        {courseTitle || 'Titre du cours'}
                    </Link>
                </h3>
                
                {courseDescription && (
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', lineHeight: '1.4' }}>
                        {descText}
                    </p>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                    <Link 
                        to={``}
                        style={{ fontSize: '11px', color: '#ff5421', textDecoration: 'none' }}
                    >
                        <i className="fa fa-user"></i> {studentText} étudiants
                    </Link>
                    {durationText && (
                        <span style={{ fontSize: '11px', color: '#999' }}>
                            <i className="fa fa-clock-o"></i> {durationText}
                        </span>
                    )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Link 
                        to={`/admin/createchapitre/${btnLink}`}
                        style={{ flex: 1, textAlign: 'center', background: '#ff5421', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '11px', textDecoration: 'none' }}
                    >
                        Séquences
                    </Link>
                    <Link 
                        to={`/cours/modifier/${btnLink}`}
                        style={{ flex: 1, textAlign: 'center', background: '#6c757d', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '11px', textDecoration: 'none' }}
                    >
                        Modifier
                    </Link>
                </div>

                {/* Message d'information ou bouton de soumission */}
                <div className="mt-3">
                    {validationStatus === 'pending' && (
                        <div className="alert alert-info text-center" style={{ fontSize: '11px', padding: '8px', marginBottom: 0 }}>
                            <i className="fas fa-hourglass-half"></i> En attente de validation
                        </div>
                    )}
                    
                    {(validationStatus === 'rejected' || !validationStatus) && onRequestValidation && (
                        <button
                            onClick={onRequestValidation}
                            disabled={updating}
                            className="btn btn-sm w-100"
                            style={{ 
                                backgroundColor: '#ffc107', 
                                color: '#333', 
                                border: 'none', 
                                padding: '8px',
                                fontSize: '12px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginTop: '5px'
                            }}
                        >
                            {updating ? '⏳...' : '📤 Soumettre à validation'}
                        </button>
                    )}
                    
                    {validationStatus === 'approved' && (
                        <div className="alert alert-success text-center" style={{ fontSize: '11px', padding: '8px', marginBottom: 0 }}>
                            <i className="fas fa-check-circle"></i> Cours validé
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

CourseSingleFour.defaultProps = {
    btnLink: null,
    courseImg: null,
    courseCategory: null,
    courseTitle: null,
    courseDescription: null,
    courseDuration: null,
    studentCount: 0,
    onDelete: null,
    status: 'hidden',
    validationStatus: null,
    onRequestValidation: null,
    updating: false
};

export default CourseSingleFour;
