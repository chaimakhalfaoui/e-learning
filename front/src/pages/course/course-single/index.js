import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../../../components/Layout/Header/Header';
import Footer from '../../../components/Layout/Footer/Footer';
import OffWrap from '../../../components/Layout/Header/OffWrap';
import SearchModal from '../../../components/Layout/Header/SearchModal';
import Newsletter from '../../../components/Common/Newsletter';
import SiteBreadcrumb from '../../../components/Common/Breadcumb';
import CourseDetailsMain from './CourseDetailsMain';
import { useAuth } from '../../../context/authContext'; 

// Image
import Logo from '../../../assets/img/logo/dark-logo.png';
import footerLogo from '../../../assets/img/logo/lite-logo.png';

import bannerbg from '../../../assets/img/breadcrumbs/2.jpg';

const CourseSingle = () => {
    const { idUser } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await idUser(); // Récupérer l'ID de l'utilisateur à partir du contexte d'authentification
                const response = await axios.get(`process.env.REACT_APP_API_URL/auth/checkUserRole/${userId}`);
                const userRole = response.data.role;

                // Vérifier le rôle de l'utilisateur et agir en conséquence
                if (userRole !== 'user' && userRole !== 'enseignant' && userRole !== 'etudiant' ) {
                    // Rediriger l'utilisateur non administrateur vers une autre page ou afficher un message d'erreur
                    navigate('/404'); // Exemple de redirection vers la page d'accueil
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du rôle de l'utilisateur :", error);
                navigate('/404');
                // Afficher un message d'erreur ou rediriger vers une autre page en cas d'erreur
            }
        };

        fetchUserData(); // Appel de la fonction pour récupérer et vérifier le rôle de l'utilisateur
    }, [idUser, navigate]);

    return (
        <React.Fragment>
            <OffWrap />
            <Header
                parentMenu='cours'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn'
                Location='Cité Erriadh - B.P 135'
            />

            {/* breadcrumb-area-start */}
            <SiteBreadcrumb
                pageTitle="Détails du cours"
                pageName="Détails du cours"
                breadcrumbsImg={bannerbg}
            />
            {/* breadcrumb-area-start */}

            {/* Course Details Main */}
            <CourseDetailsMain />
            {/* Course Details Main */}

            <Newsletter
                sectionClass="rs-newsletter style1 gray-bg orange-color mb--90 sm-mb-0 sm-pb-70"
                titleClass="title mb-0 white-color"
            />

            <Footer
                footerClass="rs-footer home9-style main-home"
                footerLogo={footerLogo}
            />
            <SearchModal />
        </React.Fragment>
    );
}

export default CourseSingle;