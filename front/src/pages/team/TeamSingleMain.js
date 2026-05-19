import { getImageUrl } from "../../utils/imageUtils";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import teamImg1 from '../../assets/img/team/9.jpg';
import { useAuth } from '../../context/authContext';

const TeamSingleMain = () => {
    const { idUser, role } = useAuth();
    const [userData, setUserData] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [rol, setRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    // Nettoyage au démontage
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    const getData = useCallback(async () => {
        if (!mountedRef.current) return;
        try {
            const userId = await idUser();
            if (!userId) return;
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/auth/getUserById/${userId}`);
            if (mountedRef.current) {
                setUserData(response.data);
                setError(null);
            }
        } catch (error) {
            console.error('Erreur:', error);
            if (mountedRef.current) {
                setError("Erreur de chargement des données");
            }
        }
    }, [idUser]);

    const getDataAdmin = useCallback(async () => {
        if (!mountedRef.current) return;
        try {
            const userId = await idUser();
            if (!userId) return;
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/auth/getAdminById/${userId}`);
            if (mountedRef.current) {
                setAdminData(response.data);
                setError(null);
            }
        } catch (error) {
            console.error('Erreur:', error);
            if (mountedRef.current) {
                setError("Erreur de chargement des données");
            }
        }
    }, [idUser]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userRole = await role();
                if (mountedRef.current) {
                    setRole(userRole);
                    
                    if (userRole === 'admin') {
                        await getDataAdmin();
                    } else {
                        await getData();
                    }
                }
            } catch (error) {
                console.error('Erreur:', error);
                if (mountedRef.current) {
                    setError("Erreur de chargement");
                }
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                }
            }
        };
        
        fetchData();
    }, [role, getData, getDataAdmin]);

    const handleEditClick = (e) => {
        e.preventDefault();
        setIsEditing(true);
    };

    const handleCancelEdit = (e) => {
        e.preventDefault();
        setIsEditing(false);
        setPreviewImage(null);
        if (rol === 'admin') {
            getDataAdmin();
        } else {
            getData();
        }
    };

    const handleSaveClick = async (e) => {
        e.preventDefault();
        if (!userData || !userData.id) return;
        
        const formData = new FormData();
        formData.append("username", userData.username || "");
        formData.append("age", userData.age || "");
        formData.append("genre", userData.genre || "");
        formData.append("email", userData.email || "");
        formData.append("telephone", userData.telephone || "");
        
        if (userData.image && userData.image instanceof File) {
            formData.append("image", userData.image);
        }
        
        try {
            await axios.put(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/auth/updateprofil/${userData.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsEditing(false);
            setPreviewImage(null);
            await getData();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleSaveClickAdmin = async (e) => {
        e.preventDefault();
        if (!adminData || !adminData.id) return;
        
        const updatedData = {
            username: adminData.username || "",
            email: adminData.email || "",
        };
    
        try {
            await axios.put(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/auth/updateAdminById/${adminData.id}`, updatedData);
            setIsEditing(false);
            await getDataAdmin();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // ✅ Vérifier que c'est bien un fichier
        console.log("Fichier sélectionné:", file.name, file.type, file.size);
        
        // ✅ Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            alert("Veuillez sélectionner une image valide");
            return;
        }
        
        // ✅ Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("L'image ne doit pas dépasser 5MB");
            return;
        }
        
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
        
        // ✅ Créer l'URL de prévisualisation
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);
        
        // ✅ Stocker le vrai fichier, pas l'URL
        setUserData(prev => ({ ...prev, image: file }));
    }
};

    if (loading) {
        return (
            <div className="profile-section pt-100 pb-90">
                <div className="container">
                    <div className="text-center">Chargement...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-section pt-100 pb-90">
                <div className="container">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </div>
        );
    }

    // ✅ Styles pour l'image - TAILLE FIXE
    const imageContainerStyle = {
        width: "300px",
        height: "300px",
        margin: "0 auto",
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative"
    };

    const imageStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        transition: "opacity 0.3s ease"
    };

    const imageLabelStyle = {
        cursor: isEditing ? "pointer" : "default",
        display: "block",
        width: "100%",
        height: "100%"
    };

    const overlayStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        opacity: 0,
        transition: "opacity 0.3s ease",
        cursor: "pointer",
        borderRadius: "50%"
    };

    // ✅ Style pour les champs avec icônes
    const fieldContainerStyle = {
        marginBottom: "20px"
    };

    const labelStyle = {
        fontWeight: "500",
        marginBottom: "5px",
        display: "block",
        fontSize: "14px",
        color: "#555"
    };

    const iconStyle = {
        marginRight: "8px",
        color: "#ff5421"
    };

    // Style communs
    const inputStyle = {
        marginTop: "5px",
        width: "100%",
        padding: "10px 12px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        fontSize: "14px"
    };

    const readonlyInputStyle = {
        ...inputStyle,
        background: "transparent",
        border: "none",
        paddingLeft: "0"
    };

    const hideNumberArrowsStyle = {
        ...inputStyle,
        MozAppearance: 'textfield',
        WebkitAppearance: 'none',
        appearance: 'textfield'
    };

    const hideNumberArrowsReadonlyStyle = {
        ...readonlyInputStyle,
        MozAppearance: 'textfield',
        WebkitAppearance: 'none',
        appearance: 'textfield'
    };

    const buttonStyle = {
        border: "none",
        background: "#ff5421",
        padding: "8px 16px",
        color: "#fff",
        cursor: "pointer",
        borderRadius: "4px",
        marginRight: "10px"
    };

    const cancelButtonStyle = {
        ...buttonStyle,
        background: "#6c757d"
    };

    // Rendu pour admin
    if (rol === 'admin') {
        if (!adminData) return null;
        
        return (
            <div className="profile-section pt-100 pb-90 md-pt-80 md-pb-70">
                <div className="container">
                    <div className="row clearfix">
                        <div className="image-column col-lg-5 md-mb-50">
                            <div className="inner-column mb-50 md-mb-0">
                                <div className="team-content text-center">
                                    <h3>{adminData.username || ""}</h3>
                                    <div className="text">{adminData.role || ""}</div>
                                    <ul className="personal-info">
                                        <li className="email">
                                            <span><i className="glyph-icon flaticon-email"></i></span>
                                            <Link to="#">{adminData.email || ""}</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="content-column col-lg-7 pl-60 pt-50 md-pl-14 md-pt-0">
                            <div className="inner-column">
                                {/* Nom d'utilisateur avec icône */}
                                <div style={fieldContainerStyle}>
                                    <h5 style={labelStyle}>
                                        <i className="fas fa-user" style={iconStyle}></i>
                                        Nom d'utilisateur
                                    </h5>
                                    <input 
                                        style={isEditing ? inputStyle : readonlyInputStyle} 
                                        type="text" 
                                        value={adminData.username || ""} 
                                        onChange={(e) => setAdminData({...adminData, username: e.target.value})} 
                                        disabled={!isEditing} 
                                    />
                                </div>
                                
                                {/* Email avec icône */}
                                <div style={fieldContainerStyle}>
                                    <h5 style={labelStyle}>
                                        <i className="fas fa-envelope" style={iconStyle}></i>
                                        Email
                                    </h5>
                                    <input 
                                        style={isEditing ? inputStyle : readonlyInputStyle} 
                                        type="email" 
                                        value={adminData.email || ""} 
                                        onChange={(e) => setAdminData({...adminData, email: e.target.value})} 
                                        disabled={!isEditing} 
                                    />
                                </div>
                            </div>
                            <div style={{marginLeft:"79%", marginTop:"45px"}}>
                                {!isEditing ? (
                                    <button style={buttonStyle} onClick={handleEditClick}>
                                        <i className="fas fa-edit" style={{marginRight: "5px"}}></i>
                                        Modifier Profil
                                    </button>
                                ) : (
                                    <>
                                        <button style={buttonStyle} onClick={handleSaveClickAdmin}>
                                            <i className="fas fa-save" style={{marginRight: "5px"}}></i>
                                            Enregistrer
                                        </button>
                                        <button style={cancelButtonStyle} onClick={handleCancelEdit}>
                                            <i className="fas fa-times" style={{marginRight: "5px"}}></i>
                                            Annuler
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Rendu pour utilisateur normal
    if (!userData) return null;

    return (
        <div className="profile-section pt-100 pb-90 md-pt-80 md-pb-70">
            <div className="container">
                <div className="row clearfix">
                    <div className="image-column col-lg-5 md-mb-50">
                        <div className="inner-column mb-50 md-mb-0">
                            <div className="image">
                                <div style={imageContainerStyle}>
                                    <label style={imageLabelStyle}>
                                        {(previewImage || userData.image) ? (
                                            <img 
                                                style={{
                                                    ...imageStyle,
                                                    opacity: isEditing ? "0.7" : "1"
                                                }}
                                                src={previewImage || getImageUrl(userData.image)} 
                                                alt="profile" 
                                            />
                                        ) : (
                                            <img 
                                                style={imageStyle} 
                                                src={teamImg1} 
                                                alt="default" 
                                            />
                                        )}
                                        {isEditing && (
                                            <div 
                                                style={overlayStyle}
                                                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                                onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                                            >
                                                <i className="fas fa-camera" style={{ fontSize: "24px" }}></i>
                                            </div>
                                        )}
                                        {isEditing && (
                                            <input 
                                                type="file" 
                                                onChange={handleImageChange} 
                                                accept="image/*"
                                                style={{ display: 'none' }} 
                                                id="profile-image-input"
                                            />
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div className="team-content text-center">
                                <h3>{userData.username || ""}</h3>
                                <div className="text">{userData.role || ""}</div>
                                <ul className="personal-info">
                                    <li className="email">
                                        <span><i className="glyph-icon flaticon-email"></i></span>
                                        <Link to="#">{userData.email || ""}</Link>
                                    </li>
                                    <li className="phone">
                                        <span><i className="glyph-icon flaticon-call"></i></span>
                                        <Link to="#">{userData.telephone || ""}</Link>
                                    </li>
                                </ul>
                                <ul className="personal-info">
                                    <li className="genre">
                                        <span><i className="glyph-icon flaticon-genre"></i></span>
                                        <Link to="#">Genre : {userData.genre || ""}</Link>
                                    </li>
                                    <li className="age">
                                        <span><i className="glyph-icon flaticon-age"></i></span>
                                        <Link to="#">Age : {userData.age || ""}</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="content-column col-lg-7 pl-60 pt-50 md-pl-14 md-pt-0">
                        <div className="inner-column">
                            {/* Nom d'utilisateur avec icône */}
                            <div style={fieldContainerStyle}>
                                <h5 style={labelStyle}>
                                    <i className="fas fa-user" style={iconStyle}></i>
                                    Nom d'utilisateur
                                </h5>
                                <input 
                                    style={isEditing ? inputStyle : readonlyInputStyle} 
                                    type="text" 
                                    value={userData.username || ""} 
                                    onChange={(e) => setUserData({...userData, username: e.target.value})} 
                                    disabled={!isEditing} 
                                />
                            </div>
                            
                            {/* Âge avec icône */}
                            <div style={fieldContainerStyle}>
                                <h5 style={labelStyle}>
                                    <i className="fas fa-calendar-alt" style={iconStyle}></i>
                                    Âge
                                </h5>
                                <input 
                                    style={isEditing ? hideNumberArrowsStyle : hideNumberArrowsReadonlyStyle} 
                                    type="number" 
                                    value={userData.age || ""} 
                                    onChange={(e) => setUserData({...userData, age: e.target.value})} 
                                    disabled={!isEditing}
                                    onKeyDown={(e) => {
                                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            
                            {/* Genre avec icône */}
                            <div style={fieldContainerStyle}>
                                <h5 style={labelStyle}>
                                    <i className="fas fa-venus-mars" style={iconStyle}></i>
                                    Genre
                                </h5>
                                <select
                                    style={isEditing ? inputStyle : {...readonlyInputStyle, appearance: 'none'}}
                                    value={userData.genre || ""}
                                    onChange={(e) => setUserData({...userData, genre: e.target.value})}
                                    disabled={!isEditing}
                                >
                                    <option value="Homme">Homme</option>
                                    <option value="Femme">Femme</option>
                                </select>
                            </div>
                            
                            {/* Email avec icône */}
                            <div style={fieldContainerStyle}>
                                <h5 style={labelStyle}>
                                    <i className="fas fa-envelope" style={iconStyle}></i>
                                    Email
                                </h5>
                                <input 
                                    style={isEditing ? inputStyle : readonlyInputStyle} 
                                    type="email" 
                                    value={userData.email || ""} 
                                    onChange={(e) => setUserData({...userData, email: e.target.value})} 
                                    disabled={!isEditing} 
                                />
                            </div>
                            
                            {/* Téléphone avec icône */}
                            <div style={fieldContainerStyle}>
                                <h5 style={labelStyle}>
                                    <i className="fas fa-phone" style={iconStyle}></i>
                                    Téléphone
                                </h5>
                                <input 
                                    style={isEditing ? inputStyle : readonlyInputStyle} 
                                    type="tel" 
                                    value={userData.telephone || ""} 
                                    onChange={(e) => setUserData({...userData, telephone: e.target.value})} 
                                    disabled={!isEditing} 
                                />
                            </div>
                        </div>
                        <div style={{marginLeft:"79%", marginTop:"45px"}}>
                            {!isEditing ? (
                                <button style={buttonStyle} onClick={handleEditClick}>
                                    <i className="fas fa-edit" style={{marginRight: "5px"}}></i>
                                    Modifier Profil
                                </button>
                            ) : (
                                <>
                                    <button style={buttonStyle} onClick={handleSaveClick}>
                                        <i className="fas fa-save" style={{marginRight: "5px"}}></i>
                                        Enregistrer
                                    </button>
                                    <button style={cancelButtonStyle} onClick={handleCancelEdit}>
                                        <i className="fas fa-times" style={{marginRight: "5px"}}></i>
                                        Annuler
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSingleMain;
