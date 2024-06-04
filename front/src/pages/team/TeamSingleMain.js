import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import teamImg1 from '../../assets/img/team/9.jpg';
import { useAuth } from '../../context/authContext'; 

const TeamSingleMain = () => {
    const { idUser } = useAuth();
    const { role } = useAuth();
    const [userData, setUserData] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [rol,setrole]=useState("");
    
    const getData = async () => {
        const userId = await idUser();
        await axios.get(`http://localhost:8801/api/auth/getUserById/${userId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => {
                console.error('Une erreur s\'est produite lors de la récupération des données de l\'utilisateur :', error);
            });
    };
    const getDataAdmin = async () => {
        const userId = await idUser();
        await axios.get(`http://localhost:8801/api/auth/getAdminById/${userId}`)
            .then(response => {
                setAdminData(response.data);
            })
            .catch(error => {
                console.error('Une erreur s\'est produite lors de la récupération des données de l\'utilisateur :', error);
            });
    };

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const userRole = await role();
                setrole(userRole);
            } catch (error) {
                console.error('Erreur lors de la récupération du rôle :', error);
            }
        };
        
        fetchRole();
        getData();
        getDataAdmin();
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        const formData = new FormData();
        formData.append("username", userData.username);
        formData.append("age", userData.age);
        formData.append("genre", userData.genre);
        formData.append("email", userData.email);
        formData.append("telephone", userData.telephone);
        if (userData.image instanceof File) {
            formData.append("image", userData.image);
        }
        
        axios.put(`http://localhost:8801/api/auth/updateprofil/${userData.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Profil utilisateur mis à jour avec succès :', response.data);
                setIsEditing(false);
                getData();
            })
            .catch(error => {
                console.error('Une erreur s\'est produite lors de la mise à jour du profil utilisateur :', error);
            });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setUserData({ ...userData, image: file });
        }
    };
    const handleSaveClickA = () => {
        const updatedData = {
            username: adminData.username,
            email: adminData.email,
        };
    
        axios.put(`http://localhost:8801/api/auth/updateAdminById/${adminData.id}`, updatedData)
            .then(response => {
                console.log('Informations de l\'administrateur mises à jour avec succès :', response.data);
                setIsEditing(false);
                getDataAdmin();
            })
            .catch(error => {
                console.error('Une erreur s\'est produite lors de la mise à jour des informations de l\'administrateur :', error);
            });
    };
    
    return (
        <div className="profile-section pt-100 pb-90 md-pt-80 md-pb-70">
            <div className="container">
               {rol && rol === 'admin' ?
               <div className="row clearfix">
               <div className="image-column col-lg-5 md-mb-50">
                   <div className="inner-column mb-50 md-mb-0">
                       {/* <div className="image">
                       <label style={isEditing ? { cursor: "pointer" } : {}}>
                           {previewImage ? (
                               <img style={isEditing ? { opacity: "0.5" } : {}} src={previewImage} alt="preview" />
                           ) : (
                               userData && userData.image ? (
                                   <img style={isEditing ? { opacity: "0.5" } : {}} src={`http://localhost:8801/api/image/${userData.image}`} alt="images" />
                               ) : (
                                   <img src={teamImg1} alt="images" />
                               )
                           )}
                           {isEditing && (
                               
                                   
                                       <input type="file" onChange={handleImageChange} hidden/>
                              
                           )}
                           </label>
                       </div> */}
                       <div className="team-content text-center">
                           <h3>{adminData && adminData.username}</h3>
                           <div className='text'>{adminData && adminData.role}</div>
                           <ul className="personal-info">
                               <li className="email">
                                   <span><i className="glyph-icon flaticon-email"> </i> </span>
                                   <Link to="#">{adminData && adminData.email}</Link>
                               </li>
                               {/* <li className="phone">
                                   <span><i className="glyph-icon flaticon-call"></i></span>
                                   <Link to="#">{userData && userData.telephone}</Link>
                               </li> */}
                           </ul>
                           {/* <ul className="personal-info">
                               <li className="genre">
                                   <span><i className="glyph-icon flaticon-genre"></i> </span>
                                   <Link to="#">Genre : {userData && userData.genre}</Link>
                               </li>
                               <li className="age">
                                   <span><i className="glyph-icon flaticon-age"></i></span>
                                   <Link to="#">Age : {userData && userData.age}</Link>
                               </li>
                           </ul> */}
                       </div>
                   </div>
               </div>
               <div className="content-column col-lg-7 pl-60 pt-50 md-pl-14 md-pt-0">
                   <div className="inner-column">
                       <h2>username</h2>
                       <input style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }} type="text" value={adminData && adminData.username} onChange={(e) => setAdminData({ ...adminData, username: e.target.value })} disabled={!isEditing} />
                       {/* <h5 style={{marginTop:"25px"}}>Age</h5>
                       <input style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }} type="text" value={userData && userData.age} onChange={(e) => setUserData({ ...userData, age: e.target.value })} disabled={!isEditing} />
                       <h5 style={{ marginTop: "25px" }}>Genre</h5>
                       <select
                           style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }}
                           value={userData && userData.genre}
                           onChange={(e) => setUserData({ ...userData, genre: e.target.value })}
                           disabled={!isEditing}
                       >
                           <option value="Homme">Homme</option>
                           <option value="Femme">Femme</option>
                       </select> */}
                       <h5 style={{marginTop:"25px"}}>Email</h5>
                       <input style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }} type="email" value={adminData && adminData.email} onChange={(e) => setAdminData({ ...adminData, email: e.target.value })} disabled={!isEditing} />
                       {/* <h5 style={{marginTop:"25px"}}>Téléphone</h5>
                       <input style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }} type="tel" value={userData && userData.telephone} onChange={(e) => setUserData({ ...userData, telephone: e.target.value })} disabled={!isEditing} /> */}
                   </div>
                   {!isEditing && (
                       <div style={{marginLeft:"79%",marginTop:"45px"}}>
                           <button style={{border:"none",background:"#ff5421",padding:"8px 8px 8px 8px",color:"#ffff",cursor:"pointer"}} onClick={handleEditClick}>Modifier Profil</button>
                       </div>
                   )}
                   {isEditing && (
                       <div style={{marginLeft:"79%",marginTop:"45px"}}>
                           <button style={{border:"none",background:"#ff5421",padding:"8px 8px 8px 8px",color:"#ffff",cursor:"pointer"}} onClick={handleSaveClickA}>Enregistrer</button>
                       </div>
                   )}
               </div>
           </div>
               :
               <div className="row clearfix">
               <div className="image-column col-lg-5 md-mb-50">
                   <div className="inner-column mb-50 md-mb-0">
                       <div className="image">
                       <label style={isEditing ? { cursor: "pointer" } : {}}>
                           {previewImage ? (
                               <img style={isEditing ? { opacity: "0.5" } : {}} src={previewImage} alt="preview" />
                           ) : (
                               userData && userData.image ? (
                                   <img style={isEditing ? { opacity: "0.5" } : {}} src={`http://localhost:8801/api/image/${userData.image}`} alt="images" />
                               ) : (
                                   <img src={teamImg1} alt="images" />
                               )
                           )}
                           {isEditing && (
                               
                                   
                                       <input type="file" onChange={handleImageChange} hidden/>
                              
                           )}
                           </label>
                       </div>
                       <div className="team-content text-center">
                           <h3>{userData && userData.username}</h3>
                           <div className='text'>{userData && userData.role}</div>
                           <ul className="personal-info">
                               <li className="email">
                                   <span><i className="glyph-icon flaticon-email"> </i> </span>
                                   <Link to="#">{userData && userData.email}</Link>
                               </li>
                               <li className="phone">
                                   <span><i className="glyph-icon flaticon-call"></i></span>
                                   <Link to="#">{userData && userData.telephone}</Link>
                               </li>
                           </ul>
                           <ul className="personal-info">
                               <li className="genre">
                                   <span><i className="glyph-icon flaticon-genre"></i> </span>
                                   <Link to="#">Genre : {userData && userData.genre}</Link>
                               </li>
                               <li className="age">
                                   <span><i className="glyph-icon flaticon-age"></i></span>
                                   <Link to="#">Age : {userData && userData.age}</Link>
                               </li>
                           </ul>
                       </div>
                   </div>
               </div>
               <div className="content-column col-lg-7 pl-60 pt-50 md-pl-14 md-pt-0">
                   <div className="inner-column">
                       <h2>username</h2>
                       <input style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }} type="text" value={userData && userData.username} onChange={(e) => setUserData({ ...userData, username: e.target.value })} disabled={!isEditing} />
                       <h5 style={{marginTop:"25px"}}>Age</h5>
                       <input style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }} type="text" value={userData && userData.age} onChange={(e) => setUserData({ ...userData, age: e.target.value })} disabled={!isEditing} />
                       <h5 style={{ marginTop: "25px" }}>Genre</h5>
                       <select
                           style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }}
                           value={userData && userData.genre}
                           onChange={(e) => setUserData({ ...userData, genre: e.target.value })}
                           disabled={!isEditing}
                       >
                           <option value="Homme">Homme</option>
                           <option value="Femme">Femme</option>
                       </select>
                       <h5 style={{marginTop:"25px"}}>Email</h5>
                       <input style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }} type="email" value={userData && userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} disabled={!isEditing} />
                       <h5 style={{marginTop:"25px"}}>Téléphone</h5>
                       <input style={{ marginTop: "5px", ...(isEditing ? {} : { background: "transparent", border: "none" }) }} type="tel" value={userData && userData.telephone} onChange={(e) => setUserData({ ...userData, telephone: e.target.value })} disabled={!isEditing} />
                   </div>
                   {!isEditing && (
                       <div style={{marginLeft:"79%",marginTop:"45px"}}>
                           <button style={{border:"none",background:"#ff5421",padding:"8px 8px 8px 8px",color:"#ffff",cursor:"pointer"}} onClick={handleEditClick}>Modifier Profil</button>
                       </div>
                   )}
                   {isEditing && (
                       <div style={{marginLeft:"79%",marginTop:"45px"}}>
                           <button style={{border:"none",background:"#ff5421",padding:"8px 8px 8px 8px",color:"#ffff",cursor:"pointer"}} onClick={handleSaveClick}>Enregistrer</button>
                       </div>
                   )}
               </div>
           </div>
            }
                
            </div>
        </div>
        
    );
}

export default TeamSingleMain;