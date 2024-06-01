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

const CreateChaCours = () => {
    const [openModal,setOpenModal]=useState(false);
    const [openModalq,setOpenModalq]=useState(false);
    const [course, setCourse] = useState(null);
    const [chapitre, setChapitre] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const { id } = useParams();
    const { idUser } = useAuth();
    const [isAddingChapitre, setIsAddingChapitre] = useState(true);
const [isAddingQuiz, setIsAddingQuiz] = useState(true);
    const [inputs, setInputs] = useState({

        id_chapitre:"",
        titre: "",
        idQuiz:"",
        titreQuiz:"",
        dureeQuiz:"",
    });
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

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

    // Gestionnaire d'événements pour les champs de texte
const handleInputChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
};




    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
           
            await axios.post("http://localhost:8801/api/chapitre/createChapitre", {
                nom_chapitre : inputs.titre,
                id_cours : course[0].id
            });
            toast.success('chapitre créé avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            fetchChapitre();
            setInputs({
                id_chapitre:"",
                titre : "",
            });
            setOpenModal(false);
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
            }
        }
    };
    const handleSubmitq = async (e) => {
        e.preventDefault();
        try {
           
            await axios.post("http://localhost:8801/api/quiz/createQuiz", {
                titre : inputs.titreQuiz,
                duree: inputs.dureeQuiz,
                id_cours : course[0].id
            });
            toast.success('quiz créé avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            fetchChapitre();
            setInputs({
                idQuiz:"",
                titreQuiz : "",
                dureeQuiz:""
            });
            fetchQuiz();
            setOpenModalq(false);
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la création de quiz.');
            }
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

      const fetchCourse = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/cours/getCourse/${id}`);
            setCourse(response.data);
           console.log(response.data)
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };
    const fetchChapitre = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/chapitre/getChapitre/${id}`);
            setChapitre(response.data);
           console.log(response.data)
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const fetchQuiz = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/quiz/getQuiz/${id}`);
            setQuiz(response.data[0]);
           console.log(response.data)
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };
    
    useEffect(() => {
        fetchChapitre();
        fetchCourse();
        fetchQuiz();
        fetchid();
       
      }, [id]);

      const handleDeleteChapitre = async (chapitreId) => {
        try {
            await axios.delete(`http://localhost:8801/api/chapitre/deleteChapitre/${chapitreId}`);
            toast.success('Chapitre supprimé avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            fetchChapitre(); // Met à jour la liste des chapitres
        } catch (error) {
            console.error("Erreur lors de la suppression du chapitre :", error);
            toast.error('Une erreur est survenue lors de la suppression du chapitre.');
        }
    };
    
    const handleDeleteQuiz = async (quizId) => {
        try {
            await axios.delete(`http://localhost:8801/api/quiz/deleteQuiz/${quizId}`);
            toast.success('Quiz supprimé avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            fetchQuiz(); // Met à jour la liste des quiz
        } catch (error) {
            console.error("Erreur lors de la suppression du quiz :", error);
            toast.error('Une erreur est survenue lors de la suppression du quiz.');
        }
    };


    const handleUpdateChapitreModal = (id_chapitre, titre) => {
        setInputs(prev => ({ ...prev, titre: titre,id_chapitre:id_chapitre }));
        setOpenModal(true);
        setIsAddingChapitre(false);
    };
    
    // Ajout de la fonction pour ouvrir le modal de mise à jour du quiz
    const handleUpdateQuizModal = (idQuiz, titreQuiz,dureeQuiz) => {
        setInputs(prev => ({ ...prev, idQuiz:idQuiz,titreQuiz: titreQuiz,dureeQuiz:dureeQuiz }));
        setOpenModalq(true);
        setIsAddingQuiz(false);
    };
    
    // Fonction de mise à jour du chapitre
const handleUpdateChapitre = async (e) => {
    e.preventDefault();
    try {
        await axios.put(`http://localhost:8801/api/chapitre/updateChapitre/${inputs.id_chapitre}`, {
            nom_chapitre: inputs.titre
        });
        toast.success('Chapitre mis à jour avec succès', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        setInputs({
            id_chapitre : "",
            titre:""
        });
        // Met à jour la liste des chapitres
        fetchChapitre();
        // Ferme le modal
        setOpenModal(false);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du chapitre :", error);
        toast.error('Une erreur est survenue lors de la mise à jour du chapitre.');
    }
};

// Fonction de mise à jour du quiz
const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
        await axios.put(`http://localhost:8801/api/quiz/updateQuiz/${inputs.idQuiz}`, {
            titre: inputs.titreQuiz,
            duree: inputs.dureeQuiz
        });
        toast.success('Quiz mis à jour avec succès', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        setInputs({
            idQuiz : "",
            titreQuiz:"",
            dureeQuiz:""
        });
        // Met à jour la liste des quiz
        fetchQuiz();
        // Ferme le modal
        setOpenModalq(false);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du quiz :", error);
        toast.error('Une erreur est survenue lors de la mise à jour du quiz.');
    }
};
       const closmodalchap=()=>{
        setIsAddingChapitre(true);
        setOpenModal(false);
        setInputs({
            titre : "",
        });
       }
       const closmodalquiz=()=>{
        setIsAddingQuiz(true);
        setOpenModalq(false);
        setInputs({
            titreQuiz : "",
            dureeQuiz:""
        });
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
                pageTitle=" Chapitre"
                pageName="Create Chapitre"
                breadcrumbsImg={bannerbg}
            />
            {/* breadcrumb-area-End */}
            { !course || !chapitre ?
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
                            <h4 class="title">les Chapitre  de Cours : <span style={{color:"black" , fontSize:"16px" , marginLeft:"10px"}}>{course && course[0].titre}</span></h4>
                        </div>
                        <div className='chap-f-b'>

                        <div className='ul-chap'>
                            <ul>
                            {chapitre.map((chapitre, index) => (
                                <li>
                                    <div className='li-' style={{display:"flex"}}>
                                        <div class="date">
                                            <span>{index +1}</span>
                                        </div>
                                            <div class="desc"><a href={`/admin/createactivite/${chapitre.id_chapitre}`}>{chapitre.nom_chapitre}</a></div>
                                        <div className='ul-img-chap'>
                                        <button onClick={() => handleUpdateChapitreModal(chapitre.id_chapitre, chapitre.nom_chapitre)}>
                                            <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/64/1A1A1A/create-new--v2.png" alt="update"/>
                                        </button>
                                            <button onClick={() => handleDeleteChapitre(chapitre.id_chapitre)}>
                                                <img width="20" height="20" src="https://img.icons8.com/wired/64/f00000/filled-trash.png" alt="delete"/>
                                            </button>
                                       
                                        </div>
                                    </div>
                                </li>
                                 ))}
                            </ul>
                        </div>
                        {quiz && <>
                            <div>
                            <h4 class="title">Quiz  de Cours : <span style={{color:"black" , fontSize:"16px" , marginLeft:"10px"}}>{course && course[0].titre}</span></h4>
                        </div>
                        
                                    <div className='li-' style={{display:"flex"}}>
                                        <div class="date">
                                            <span>1</span>
                                        </div>
                                            <div class="desc"><a href={`/admin/createquestionq/${quiz.id}`}>{quiz.titre}</a></div>
                                        <div className='ul-img-chap'>
                                            <button onClick={() => handleUpdateQuizModal(quiz.id, quiz.titre,quiz.duree)}>
                                                <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/64/1A1A1A/create-new--v2.png" alt="update"/>
                                            </button>
                                            <button onClick={() => handleDeleteQuiz(quiz.id)}>
                                                <img width="20" height="20" src="https://img.icons8.com/wired/64/f00000/filled-trash.png" alt="delete"/>
                                            </button>
                                        </div>
                                    </div>
                                
                        </>}
                        
                        <div class="form-group mb-0">
                            <button class="re-button" onClick={()=>setOpenModal(true)}>Ajouter Chapitre</button>
                            {!quiz && <button class="re2-button" onClick={()=>setOpenModalq(true)}>Ajouter Quiz</button>}
                        </div>
                    </div>
                    </div>
                </div>
                    
                    
                    <div style={{display : openModal ? "block" : "none"}} className='ext-modal'>   
                        <div className='modal-add-chap'>
                            <button className='btn-fermer-modal' onClick={closmodalchap} >
                                <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/> 
                            </button>
                            <div className='titre-h2-modal'>
                                <h2>Create Chapitre</h2>
                            </div>
                            <div className='name-cours-chap'>
                                <h5>Course : </h5><span>{course && course[0].titre}</span> 
                            </div>
                            <form id="" >
                                    <div className="">
                                        <input type="text" id="chapitre" name="titre"  placeholder="Titre de Chapitre" value={inputs.titre} onChange={handleInputChange}  required />
                                    </div>
                                    <button class="re-button" onClick={isAddingChapitre ? handleSubmit : handleUpdateChapitre}>
                                        {isAddingChapitre ? 'Ajouter' : 'Modifier'}
                                    </button>
                            </form>
                        </div>
                    </div>

                    <div style={{display : openModalq ? "block" : "none"}} className='ext-modal'>   
                        <div className='modal-add-chap'>
                            <button className='btn-fermer-modal' onClick={closmodalquiz} >
                                <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/> 
                            </button>
                            <div className='titre-h2-modal'>
                                <h2>Create Quiz</h2>
                            </div>
                            <div className='name-cours-chap'>
                                <h5>Course : </h5><span>{course && course[0].titre}</span> 
                            </div>
                            <form id="" >
                                    <div className="">
                                        <input type="text" id="titreQuiz" name="titreQuiz"  placeholder="Titre de Quiz" value={inputs.titreQuiz} onChange={handleInputChange}  required />
                                        <input type="text" id="quiz" name="dureeQuiz"  placeholder="durée de Quiz" value={inputs.dureeQuiz} onChange={handleInputChange}  required />
                                    </div>
                                    <button class="re-button" onClick={isAddingQuiz ? handleSubmitq : handleUpdateQuiz}>
                                        {isAddingQuiz ? 'Ajouter' : 'Modifier'}
                                    </button>
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

export default CreateChaCours;
