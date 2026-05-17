import React from 'react';
import { Helmet } from 'react-helmet'
import OffWrap from '../../components/Layout/Header/OffWrap';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import HomeMain from './HomeMain';

import footerLogo from '../../assets/img/logo/lite-logo.png';

import favIcon from '../../assets/img/fav.png';

import Logo from '../../assets/img/logo/logo-dark.png';
import stickyLogo from '../../assets/img/logo/logo-dark.png';
import mobileLogo from '../../assets/img/logo/logo-dark.png';
import canvasLogo from '../../assets/img/logo/logo-dark.png';

const HomePage = () =>  {
    return (
        <React.Fragment>
                <Helmet>
                <link rel="icon" href={favIcon} />
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='home'
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
     
            <HomeMain />
            <Newsletter
                sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70"
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

export default HomePage;
