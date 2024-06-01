import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
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

// Image
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const CreateEvt = () => {
    
    const { idUser } = useAuth();
    const [inputs, setInputs] = useState({
        titre: "",
        description: "",
        ville: "",
        categorie:"",
        datedebut: "",
        heuredebut: "",
        datefin: "",
        heurefin: "",
        image: null,
        idUse:""
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


const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    const imageUrl = URL.createObjectURL(selectedImage); // Créer une URL pour l'image sélectionnée
    setInputs(prev => ({ ...prev, image: selectedImage, imageUrl: imageUrl }));
};


    const handleSubmit = async (e) => {
        e.preventDefault();
        fetchid();
        console.log(inputs.image);
        try {
            const formData = new FormData();
            formData.append('titre', inputs.titre);
            formData.append('description', inputs.description);
            formData.append('datedebut', inputs.datedebut);
            formData.append('heuredebut', inputs.heuredebut);
            formData.append('datefin', inputs.datefin);
            formData.append('heurefin', inputs.heurefin);
            formData.append('image', inputs.image); 
            formData.append('iduser', inputs.idUse); 
            formData.append('ville', inputs.ville); 
            formData.append('categorie', inputs.categorie); 
            // Effectuer la soumission du formulaire avec FormData
            console.log(formData);
            await axios.post("http://localhost:8801/api/event/createEvent", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Événement créé avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            // Réinitialiser les champs après la soumission réussie
            setInputs({
                titre: "",
                description: "",
                ville: "",
                categorie:"",
                datedebut: "",
                heuredebut: "",
                datefin: "",
                heurefin: "",
                image: null
            });
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
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
    
    useEffect(() => {
        
    
        fetchid();
      }, []);

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='event'
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
                pageTitle=" Evenement"
                pageName="Create Evenement"
                breadcrumbsImg={bannerbg}
            />
            {/* breadcrumb-area-End */}

            {/* Register Start */}
            <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div className="register-box">
                        <div className="sec-title text-center mb-30">
                            <h2 className="title mb-10">Create New Evenement</h2>
                        </div>
                        <div className="styled-form">
                            <div id="form-messages"></div>
                            <form id="contact-form" onSubmit={handleSubmit}>
                                <div className="row clearfix">
                                    <div className="form-group col-lg-12">
                                    <label htmlFor="image" style={{ cursor: "pointer", width: "100%",height:"350px",background:"#ffff" }}>
                                        {inputs.imageUrl ? (
                                            <img style={{width:"100%", height:"100%",position:"relative"}} src={inputs.imageUrl} alt="image" />
                                        ) : (
                                            <img style={{marginLeft:"20%",marginTop:"6%",width:"60%", height:"80%",position:"relative"}} src={img} alt="image"/>
                                        )}
                                        <input  type="file" id="image" name="image" onChange={handleImageChange}   hidden />
                                    </label>
                                   
                                    </div>
                                    <div className="form-group col-lg-12 mb-25">
                                        <input type="text" id="Name" name="titre" value={inputs.titre} placeholder="Titre" onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="text" id="description" name="description" value={inputs.description} placeholder="Description" onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="text" id="ville" name="ville" value={inputs.ville} placeholder="ville" onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="text" id="categorie" name="categorie" value={inputs.categorie} placeholder="categorie" onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="date" id="datedebut" name="datedebut" value={inputs.datedebut} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="time" id="heuredebut" name="heuredebut" value={inputs.heuredebut} placeholder="Heure de début" onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="date" id="datefin" name="datefin" value={inputs.datefin} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group col-lg-12">
                                        <input type="time" id="heurefin" name="heurefin" value={inputs.heurefin} placeholder="Heure de fin" onChange={handleInputChange} required />
                                    </div>
                                    
                                    <div className="form-group col-lg-12 col-md-12 col-sm-12 text-center">
                                        <button type="submit" className="readon register-btn"><span className="txt">Create Event</span></button>
                                    </div>
                                    {err && <p>{err}</p>}
                                    <div className="form-group col-lg-12 col-md-12 col-sm-12">
                                        <div className="users">View all Events? <Link to="#">Event</Link></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
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

export default CreateEvt;
