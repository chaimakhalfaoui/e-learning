import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams,Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import SearchModal from '../../components/Layout/Header/SearchModal';
import { useAuth } from '../../context/authContext'; 
import img from '../../assets/img/breadcrumbs/upload.png';
import '../../assets/scss/modal.scss';
// Image
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const CreateActivite = () => {
    const [openModal,setOpenModal]=useState(false);
    const [isAddingActive, setIsAddingActiv] = useState(true);
    const [openModalText,setOpenModalText]=useState(false);
    const [openModalImage,setOpenModalImage]=useState(false);
    const [openModalVideo,setOpenModalVideo]=useState(false);
    const [activite, setActivite] = useState(null);
    const [chapitre, setChapitre] = useState(null);
    const { id } = useParams();
    const { idUser } = useAuth();
    const [inputs, setInputs] = useState({
        id:"",
        titre: "",
        categorie:"",
        contenu:"",
        duration:"",
        image :null,
        video:null
    });
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    const [openIndex, setOpenIndex] = useState(null); 

    const toggleActivite = (index) => {
        setOpenIndex(openIndex === index ? null : index); 
    };

    // Gestionnaire d'événements pour les champs de texte
const handleInputChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
};
const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    const imageUrl = URL.createObjectURL(selectedImage); // Créer une URL pour l'image sélectionnée
    setInputs(prev => ({ ...prev, image: selectedImage, imageUrl: imageUrl }));
};

const handleVideoChange = (e) => {
    const selectedVideo = e.target.files[0];
    const videoUrl = URL.createObjectURL(selectedVideo);
    if (selectedVideo) {
        setInputs(prev => ({ ...prev, video: selectedVideo , videoUrl: videoUrl }));
        
    }
    else {
        console.error("Aucun fichier vidéo sélectionné.");
    }
};

useEffect(() => {
    const fetchUserData = async () => {
        try {
            const userId = await idUser(); // Récupérer l'ID de l'utilisateur à partir du contexte d'authentification
            const response = await axios.get(`http://localhost:8801/api/auth/checkUserRole/${userId}`);
            const userRole = response.data.role;

            // Vérifier le rôle de l'utilisateur et agir en conséquence
            if (userRole !== 'enseignant') {
                // Rediriger l'utilisateur non administrateur vers une autre page ou afficher un message d'erreur
                navigate('/404'); // Exemple de redirection vers la page d'accueil
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du rôle de l'utilisateur :", error);
            // Afficher un message d'erreur ou rediriger vers une autre page en cas d'erreur
        }
    };

    fetchUserData(); // Appel de la fonction pour récupérer et vérifier le rôle de l'utilisateur
}, [idUser, navigate]);


    const handleSubmit = async (e) => {
        
        e.preventDefault();
        try {
           
            await axios.post("http://localhost:8801/api/activite/createActivite", {
                titre : inputs.titre,
                categorie : inputs.categorie,
                contenu:inputs.contenu,
                duration:inputs.duration,
                id_chapitre:id
            });
            toast.success('Activité créé avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setInputs({
                titre : "",
                contenu:"",
                categorie:"",
                duration:"",
                image:null,
                video:null
            });
            fetchActivite();
            setOpenModalText(false);
            setOpenModal(true)
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
            }
        }
    };
    const handleSubmitim = async (e) => {
        
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('categorie', inputs.categorie);
            formData.append('image', inputs.image);
            formData.append('duration', inputs.duration);
            formData.append('id_chapitre', id);
            await axios.post("http://localhost:8801/api/activite/createActivitei",formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Activité créé avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setInputs({
                titre : "",
                contenu:"",
                duration:"",
                image:null,
                categorie:""
            });
            fetchActivite();
            setOpenModalImage(false);
            setOpenModal(true)
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
            }
        }
    };
    const handleSubmitvi = async (e) => {
        console.log(inputs.video)
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('categorie', inputs.categorie);
            formData.append('video', inputs.video);
            formData.append('duration', inputs.duration);
            formData.append('id_chapitre', id);
            await axios.post("http://localhost:8801/api/activite/createActivitev",formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Activité créé avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setInputs({
                titre : "",
                contenu:"",
                duration:"",
                video : null,
                categorie:""
            });
            fetchActivite();
            setOpenModalVideo(false);
            setOpenModal(true)
            
            
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
            }
        }
    };
    
    const fetchActivite = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/activite/getAllActiviteId/${id}`);
            setActivite(response.data);
           console.log(response.data)
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const fetchid = async () => {
        try { 
          
          const userid = await idUser();
          setInputs(prev => ({ ...prev, idUse: userid }));
        } catch (error) {
          console.error("Erreur lors de la récupération du id:", error);
        }
      };

    
    useEffect(() => {
        fetchActivite();
        fetchid();
       
      }, [id]);

      const modalText=() =>{
        
            setInputs(prev => ({ ...prev, categorie : "text" }));
        
        setOpenModalText(true);
        setOpenModal(false)
      }
      const modalImage=() =>{
        setInputs(prev => ({ ...prev, categorie : "image" }));
        setOpenModalImage(true);
        setOpenModal(false)
      }
      const modalvideo=() =>{
        setInputs(prev => ({ ...prev, categorie : "video" }));
        setOpenModalVideo(true);
        setOpenModal(false)
      }
      const openCat=()=>{
        setOpenModal(true);
        setOpenModalVideo(false);
        setOpenModalImage(false);
        setOpenModalText(false);
      }
      const handleUpdateActivitTModal = (id, titre, contenu, categorie, duration) => {
        setInputs(prev => ({ ...prev, id: id, titre: titre, contenu: contenu, categorie: categorie, duration: duration }));
        setOpenModalText(true);
        setIsAddingActiv(false);
    };

    
    const handleUpdateActivitIModal = (id, titre, contenu, categorie, duration) => {
        const imageUrl = `http://localhost:8801/api/image/${contenu}`;
        setInputs(prev => ({ ...prev, id: id, titre: titre, image: contenu, categorie: categorie, duration: duration, imageUrl: imageUrl }));
        setOpenModalImage(true);
        setIsAddingActiv(false);
    };
    const handleUpdateActivitVModal = (id, titre, contenu, categorie, duration) => {
        const videoUrl = `http://localhost:8801/api/video/${contenu}`;
        setInputs(prev => ({ ...prev, id: id, titre: titre, video: contenu, categorie: categorie, duration: duration,videoUrl:videoUrl }));
        setOpenModalVideo(true);
        setIsAddingActiv(false);
    };

      const handleUpdateActiviteText = async (e) => {
        e.preventDefault();
        try {
            // Envoyer la requête de mise à jour
            await axios.put(`http://localhost:8801/api/activite/updateActiviteText/${inputs.id}`, {
                titre: inputs.titre,
                categorie: inputs.categorie,
                contenu: inputs.contenu,
                duration: inputs.duration,
                id_chapitre: id
            });
            // Afficher un message de succès
            toast.success('L\'activité a été mise à jour avec succès.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            
            // Rechargez la liste des activités après la mise à jour
            fetchActivite();
            closModalT();
        } catch (err) {
            console.error("Erreur lors de la mise à jour de l'activité :", err);
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la mise à jour de l\'activité.');
            }
        }
    };

    const updateActiviteI = async (e) => {
        e.preventDefault();
        try {
          const formData = new FormData();
          formData.append('titre', inputs.titre);
          formData.append('categorie', inputs.categorie);
          formData.append('duration', inputs.duration);
          formData.append('id_chapitre', id);
      
          // Vérifier s'il y a une nouvelle image
          if (inputs.image) {
            formData.append('image', inputs.image);
          }
          console.log(inputs)
      
          // Vérifier si inputs contient un ID pour déterminer s'il s'agit d'une création ou d'une mise à jour
          if (inputs.id) {
            // S'il y a un ID, il s'agit d'une mise à jour
            await axios.put(`http://localhost:8801/api/activite/updateActiviteI/${inputs.id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            toast.success('Activité mise à jour avec succès', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else {
            // S'il n'y a pas d'ID, il s'agit d'une création
            // Faire une requête POST pour créer une nouvelle activité
            // Assurez-vous de configurer cette partie en fonction de votre backend
          }
      
          // Fermer le modal et actualiser les données si nécessaire
          closModalI();
          fetchActivite();
          setOpenModalImage(false);
          setOpenModal(true);
        } catch (err) {
          // Gérer les erreurs
          if (err.response && err.response.data) {
            toast.error(err.response.data);
          } else {
            toast.error('Une erreur inattendue s\'est produite lors de la création ou de la mise à jour de l\'activité.');
          }
        }
      };


    const updateActiviteVideo = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('categorie', inputs.categorie);
            formData.append('video', inputs.video);
            formData.append('duration', inputs.duration);
            formData.append('id_chapitre', id);
    
            // Vérifier s'il y a un ID pour déterminer s'il s'agit d'une création ou d'une mise à jour
            if (inputs.id) {
                // S'il y a un ID, il s'agit d'une mise à jour
                
                await axios.put(`http://localhost:8801/api/activite/updateActiviteVideo/${inputs.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Activité mise à jour avec succès', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            
            }
           
            // Réinitialiser les valeurs après la création ou la mise à jour
            closModalV();
            fetchActivite();
            setOpenModalImage(false);
            setOpenModal(true);
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la création ou de la mise à jour de l\'activité.');
            }
        }
    };
       

      const handleDeleteActivite = async (idActivite) => {
        try {
            await axios.delete(`http://localhost:8801/api/activite/deleteActivite/${idActivite}`);
            toast.success('Activité supprimée avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            fetchActivite(); // Rechargez la liste des activités après suppression
        } catch (err) {
            console.error("Erreur lors de la suppression de l'activité :", err);
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la suppression de l\'activité.');
            }
        }
    };
    const closModalT=()=>{
        setIsAddingActiv(true)
        setInputs({
            id :"",
            titre : "",
            contenu:"",
            duration:"",
            categorie:""
        });
        setOpenModalText(false)
        
    }
    const closModalI=()=>{
        setIsAddingActiv(true)
        setInputs({
            id :"",
            titre : "",
            image:null,
            imageUrl:null,
            duration:"",
            categorie:""
        });
        setOpenModalImage(false)
       
    }
    const closModalV=()=>{
        setIsAddingActiv(true)
        setInputs({
            id :"",
            titre : "",
            video:null,
            videoUrl:null,
            duration:"",
            categorie:""
        });
        setOpenModalVideo(false)
        
    }
    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='course'
                secondParentMenu='others'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='support@website.com'
                Location='374 William S Canning Blvd, MA 2721, USA '
            />

            {/* breadcrumb-area-start */}
            <SiteBreadcrumb
                pageTitle=" Activité"
                pageName="Create Activité"
                breadcrumbsImg={bannerbg}
            />
            {/* breadcrumb-area-End */}
            { !activite ?
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
            <div style={{marginBottom:"100px"}} className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                <div style={{width: "100%"}} class="col-lg-4 order-last">
                    <div class="notice-bord style1">
                    
                        <div>
                            <h4 class="title">les Activité de Chapitre  : <span style={{color:"black" , fontSize:"16px" , marginLeft:"10px"}}></span></h4>
                        </div>
                        <div className='chap-f-b'>

                        <div className='ul-activite'>
                            <ul>
                                {activite.map((activites, index) => (
                                    <li key={index}>
                                        <div className='li-'>
                                            <div style={{ display: "flex" }}>
                                                <div className="date">
                                                    <span>{index + 1}</span>
                                                </div>
                                                <div className="desc">
                                                    <a href='#'>{activites.titre } </a>
                                                </div>
                                                <div className='ul-img-chap'>
                                                <button onClick={() => toggleActivite(index)}>
                                                        <img width="20" height="20" src="https://img.icons8.com/ios/50/1A1A1A/circled-chevron-down.png" alt="circled-chevron-down" />
                                                    </button>
                                               
                                                    {activites.categorie === 'text' ? (
                                                        <button onClick={() => handleUpdateActivitTModal(activites.id, activites.titre, activites.contenu, activites.categorie, activites.duration)}>
                                                            <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/64/1A1A1A/create-new--v2.png" alt="create-new--v2"/>
                                                        </button>
                                                    ) : activites.categorie === 'image' ? (
                                                        <button onClick={() => handleUpdateActivitIModal(activites.id, activites.titre, activites.contenu, activites.categorie, activites.duration)}>
                                                            <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/64/1A1A1A/create-new--v2.png" alt="create-new--v2"/>
                                                        </button>
                                                    ) : activites.categorie === 'video' ? (
                                                        <button onClick={() => handleUpdateActivitVModal(activites.id, activites.titre, activites.contenu, activites.categorie, activites.duration)}>
                                                            <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/64/1A1A1A/create-new--v2.png" alt="create-new--v2"/>
                                                        </button>
                                                    ) : null}
                                            <button onClick={() => handleDeleteActivite(activites.id)}> {/* Remplacez activites.id par l'identifiant correct */}
                                                <img width="20" height="20" src="https://img.icons8.com/wired/64/f00000/filled-trash.png" alt="delete"/>
                                            </button>
                                       
                                        
                                                   
                                                </div>
                                            </div>
                                        </div>
                                        {/* Afficher la sous-activité si l'index correspond à l'index ouvert */}
                                        {openIndex === index && (
                                            <div className='sous-activite'>
                                                {activites.categorie && activites.categorie === "text" ?
                                                    <div className='modal-activite-text-aff'>
                                                        <p>{activites.contenu}</p>
                                                    </div>
                                                    : activites.categorie === "image" ?
                                                        <div className='modal-activite-text-aff'>
                                                            <img src={`http://localhost:8801/api/image/${activites.contenu}`} alt="image" />
                                                        </div>
                                                        : activites.categorie === "video" ?
                                                            <div className='modal-activite-text-aff'>
                                                                <video controls>
                                                                    <source src={`http://localhost:8801/api/video/${activites.contenu}`} type="video/mp4" />
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            </div>
                                                            : ""
                                                }
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div class="form-group mb-0">
                            <button class="re-button" onClick={()=>setOpenModal(true)}>Ajouter Activité</button>
                        </div>
                    </div>
                    </div>
                </div>
                    
                    
                    <div style={{display : openModal ? "block" : "none"}} className='ext-modal'>   
                        <div className='modal-add-act'>
                            <button className='btn-fermer-modal' onClick={()=>setOpenModal(false)} >
                                <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/> 
                            </button>
                            <div className='titre-h2-modal'>
                                <h2>Catégorie Activité</h2>
                            </div>
                            
                           <div className='div-categorie-modal-activite'>
                                <button onClick={modalText} href='#' className='categorie-activite'>
                                    <img width="70" height="70" src="https://img.icons8.com/quill/100/ff5421/text.png" alt="text"/>
                                </button>
                            
                                <button onClick={modalImage} href='#' className='categorie-activite'>
                                    <img width="70" height="70" src="https://img.icons8.com/quill/100/ff5421/full-image.png" alt="full-image"/>
                                </button>
                            
                                <button onClick={modalvideo} href='#' className='categorie-activite'>
                                    <img width="70" height="70" src="https://img.icons8.com/quill/100/ff5421/video.png" alt="video"/>
                                </button>
                           </div>
                        </div>

                        


                    </div>
                    <div style={{display : openModalText ? "block" : "none"}} className='ext-modal'>
                        <div  className='modal-act-add-cat'>
                            <button className='btn-fermer-modal' onClick={closModalT} >
                                <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/> 
                            </button>
                            <div className='titre-h2-modal'>
                                <h2>Text</h2>
                            </div>
                            <form id="" >
                           
                                    <div className="">
                                    <textarea  id="contenu" name="contenu" placeholder="contenu" value={inputs.contenu} onChange={handleInputChange}  required=""></textarea>
                                    <div className='style-2-input-cat'>
                                    <input type="text" id="titre" name="titre"  placeholder="Titre de Activite" value={inputs.titre} onChange={handleInputChange}  required />
                                    <input type="number" id="duration" name="duration"  placeholder="durée par min" value={inputs.duration} onChange={handleInputChange}  required />
                                        
                                        </div>
                                    </div>
                                    <button class="re-button" onClick={isAddingActive ? handleSubmit : handleUpdateActiviteText}>
                                        {isAddingActive ? 'Ajouter' : 'Modifier'}
                                    </button>
                                    {isAddingActive && <div class="users-a-a">change Categorie? <a onClick={openCat}>categories</a></div>}
                            </form>
                        </div>
                    </div>
                    <div style={{display : openModalImage ? "block" : "none"}} className='ext-modal'>
                        <div  className='modal-act-add-cat'>
                            <button className='btn-fermer-modal' onClick={closModalI} >
                                <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/> 
                            </button>
                            <div className='titre-h2-modal'>
                                <h2>Image</h2>
                            </div>
                            <form id="" >
                                    <div className="">
                                        <label htmlFor="image" style={{ cursor: "pointer", width: "50%",height:"250px",background:"#ffff",marginLeft:"25%" }}>
                                            {inputs.imageUrl ? (
                                                <img style={{width:"100%", height:"100%",position:"relative"}} src={inputs.imageUrl} alt="image" />
                                            ) : (
                                                <img style={{marginLeft:"20%",marginTop:"6%",width:"60%", height:"80%",position:"relative"}} src="https://img.icons8.com/carbon-copy/100/1A1A1A/full-image.png" alt="image"/>
                                            )}
                                            <input  type="file" id="image" name="image" onChange={handleImageChange}   hidden />
                                        </label>
                                        <div className='style-2-input-cat'>
                                        
                                        <input type="text" id="titre" name="titre"  placeholder="Titre de Activite" value={inputs.titre} onChange={handleInputChange}  required />
                                        <input type="number" id="duration" name="duration"  placeholder="durée par min" value={inputs.duration} onChange={handleInputChange}  required />
                                        </div>
                                    </div>
                                    <button class="re-button" onClick={isAddingActive ? handleSubmitim : updateActiviteI}>
                                        {isAddingActive ? 'Ajouter' : 'Modifier'}
                                    </button>
                                    {isAddingActive && <div class="users-a-a">change Categorie? <a onClick={openCat}>categories</a></div>}
                            </form>
                        </div>
                    </div>
                    <div style={{display : openModalVideo ? "block" : "none"}} className='ext-modal'>
                <div  className='modal-act-add-cat'>
                    {/* Bouton pour fermer le modal */}
                    <button className='btn-fermer-modal' onClick={closModalV}>
                        <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/> 
                    </button>
                    {/* Titre du modal */}
                    <div className='titre-h2-modal'>
                        <h2>Vidéo</h2>
                    </div>
                    {/* Formulaire pour soumettre la vidéo */}
                    <form id="" >
                        <div className="">
                            {/* Label pour le champ de fichier vidéo */}
                            <label htmlFor="video" style={{ cursor: "pointer", width: "50%",height:"250px",background:"#ffff",marginLeft:"25%" }}>
                    {inputs.videoUrl ? (
                        <video style={{width:"100%", height:"100%",position:"relative"}} controls>
                            <source src={inputs.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img style={{marginLeft:"30%",marginTop:"6%",width:"40%", height:"60%",position:"relative"}} src="https://img.icons8.com/quill/100/1A1A1A/video.png" alt="image"/>
                    )}
                    
                    <input  type="file" id="video" name="video" onChange={handleVideoChange}    />
                </label>
                            <div className='style-2-input-cat'>
                            <input type="text" id="titre" name="titre"  placeholder="Titre de Activite" value={inputs.titre} onChange={handleInputChange}  required />
                                <input type="number" id="duration" name="duration"  placeholder="durée par min" value={inputs.duration} onChange={handleInputChange}  required />
                               
                            </div>
                            
                        </div>
                        {/* Bouton de soumission du formulaire */}
                        <button class="re-button" onClick={isAddingActive ? handleSubmitvi : updateActiviteVideo}>
                                        {isAddingActive ? 'Ajouter' : 'Modifier'}
                                    </button>
                                    {isAddingActive && <div class="users-a-a">change Categorie? <a onClick={openCat}>categories</a></div>}
                    </form>
                </div>
            </div>


                    
                </div>
            </div>
            }
            {/* Register End */}

            <Newsletter
                sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80"
                titleClass="title mb-0 white-color"
            />

            <Footer
                footerClass="rs-footer home9-style main-home"
                footerLogo={footerLogo}
            />

            {/* scrolltop-start */}
            <ScrollToTop
                scrollClassName="scrollup orange-color"
            />
            {/* scrolltop-end */}

            <SearchModal />
            <ToastContainer />
        </React.Fragment>

    );
}

export default CreateActivite;
