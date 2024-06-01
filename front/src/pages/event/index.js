import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import SingleEvent from '../../components/Events/SingleEvent';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import { useAuth } from '../../context/authContext'; 

// Image
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';

import bannerbg from '../../assets/img/breadcrumbs/2.jpg';

// Event Images
import eventImg1 from '../../assets/img/event/home12/1.jpg';
import eventImg2 from '../../assets/img/event/home12/2.jpg';
import eventImg3 from '../../assets/img/event/home12/3.jpg';
import eventImg4 from '../../assets/img/event/home12/4.jpg';
import { useNavigate } from 'react-router-dom';

const Event = () => {
    const { idUser } = useAuth();
    const [events, setEvents] = useState([]);
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

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const id_user = await idUser();
        try {
            const response = await axios.get(`http://localhost:8801/api/event/getAllEventsId/${id_user}`);
            setEvents(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='event'
                secondParentMenu='event'
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
                pageTitle="My Event "
                pageName="My Event"
                breadcrumbsImg={bannerbg}
            />
            {/* breadcrumb-area-End */}

            <div className="rs-event orange-style pt-100 pb-100 md-pt-80 md-pb-80">
                <div className="container">
                    <div className="row">
                    {events.map((event, index) => (
                        
                        <div key={index} className="col-lg-4 col-md-6 mb-60">
                            <SingleEvent
                                eventClass='event-item'
                                eventImg={`http://localhost:8801/api/image/${event.image}`} // Assurez-vous que le nom de la propriété correspond à celle de votre objet événement
                                eventLocation={event.ville} // Assurez-vous que le nom de la propriété correspond à celle de votre objet événement
                                eventDate={event.datedebut} // Assurez-vous que le nom de la propriété correspond à celle de votre objet événement
                                eventCategory={event.categorie} // Assurez-vous que le nom de la propriété correspond à celle de votre objet événement
                                eventTitle={event.titre} // Assurez-vous que le nom de la propriété correspond à celle de votre objet événement
                                eventDesc={event.description} // Assurez-vous que le nom de la propriété correspond à celle de votre objet événement
                                eventId={event.id}
                                fetchEvents={fetchEvents}
                            />
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            <Newsletter
                sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70"
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
        </React.Fragment>
    );
}

export default Event