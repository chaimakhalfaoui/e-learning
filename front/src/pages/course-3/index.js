import React from 'react';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import CourseMain from './CourseMain';

// Image
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';

import bannerbg from '../../assets/img/breadcrumbs/2.jpg';

const CourseThree = () => {

    return (
        <React.Fragment>
            <OffWrap />
            <Header
                parentMenu='course'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn'
                Location='Cité Erriadh - B.P 135 '
            />

            {/* breadcrumb-area-start */}
            <SiteBreadcrumb
                pageTitle="Mes Cours "
                pageName="Mes Cours"
                breadcrumbsImg={bannerbg}
            />
            {/* breadcrumb-area-start */}

            {/* Course Main */}
            <CourseMain />
            {/* Course Main */}

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

export default CourseThree;