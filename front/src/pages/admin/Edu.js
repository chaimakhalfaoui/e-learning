import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link , useNavigate } from 'react-router-dom';
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
import SingleTeam from '../../components/Team/SingleTeam';
import SectionTitle from '../../components/Common/SectionTitle';
// Image
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import teamimg1 from '../../assets/img/team/1.jpg';
import teamimg2 from '../../assets/img/team/2.jpg';
import teamimg3 from '../../assets/img/team/3.jpg';
import teamimg4 from '../../assets/img/team/4.jpg';
import teamimg5 from '../../assets/img/team/5.jpg';
import teamimg6 from '../../assets/img/team/6.jpg';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const Edu = () => {
    const [Students, setStudents] = useState([]);
    const { idUser } = useAuth();
   
    const [err, setErr] = useState(null); 
    const fetchAllStudents = async () => {
        try {
            const response = await axios.get('http://localhost:8801/api/auth/getAllStudents');
            setStudents(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des derniers enseignants :", error);
        }
    };
    useEffect(() => {
        fetchAllStudents();
    }, []);


    const teamImages = [teamimg1, teamimg2, teamimg3, teamimg4, teamimg5, teamimg6];

    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * teamImages.length);
        return teamImages[randomIndex];
    };
   

    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await idUser(); // Récupérer l'ID de l'utilisateur à partir du contexte d'authentification
                const response = await axios.get(`http://localhost:8801/api/auth/checkUserRoleA/${userId}`);
                const userRole = response.data.role;

                // Vérifier le rôle de l'utilisateur et agir en conséquence
                if (userRole !== 'admin') {
                    // Rediriger l'utilisateur non administrateur vers une autre page ou afficher un message d'erreur
                    navigate('/404'); // Exemple de redirection vers la page d'accueil
                }
            } catch (error) {
                navigate('/404');
                console.error("Erreur lors de la récupération du rôle de l'utilisateur :", error);
                // Afficher un message d'erreur ou rediriger vers une autre page en cas d'erreur
            }
        };

        fetchUserData(); // Appel de la fonction pour récupérer et vérifier le rôle de l'utilisateur
    }, [idUser, navigate]);

    const handleDeleteUser = async (userId) => {
        
        try {
            await axios.delete(`http://localhost:8801/api/auth/deleteUser/${userId}`);
            fetchAllStudents();
            toast.success("Utilisateur supprimé avec succès !");
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur :", error);
            toast.error("Une erreur s'est produite lors de la suppression de l'utilisateur.");
        }
    };
    
    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='pages'
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
                pageTitle="Students"
                pageName="Students"
                breadcrumbsImg={bannerbg}
            />
            {/* breadcrumb-area-End */}

            {/* Register Start */}
            <div id="rs-team" className="rs-team style1 inner-style orange-style pt-102 pb-110 md-pt-64 md-pb-70 gray-bg">
                <div className="container">
                    <SectionTitle
                        sectionClass="sec-title mb-50 md-mb-30 text-center"
                        subtitleClass="sub-title orange"
                        subtitle="Team"
                        titleClass="title mb-0"
                        title="Students"
                    />
                    <div className="row">
                    {Students.map((Student, index) => (
                        <div key={index} className="col-lg-4 col-md-6 mb-30">
                        <SingleTeam
                            itemClass="team-item"
                            Image={Student.image ? `http://localhost:8801/api/image/${Student.image}` : getRandomImage()}
                            Title={Student.username}
                            Designation="Student"
                            email={Student.email}
                            age={Student.age}
                            tel={Student.tel}
                            genre={Student.genre}
                            delet={() => handleDeleteUser(Student.id)}
                        />
                    </div>
                         ))}
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


export default Edu;