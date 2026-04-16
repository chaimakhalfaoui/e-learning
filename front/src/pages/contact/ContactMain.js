import React from 'react';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import SectionTitle from '../../components/Common/SectionTitle';
import ContactForm from '../../components/Contact/ContactForm';
import ContactInfo from '../../components/Contact/ContactInfo';

import bannerbg from '../../assets/img/breadcrumbs/inner13.jpg';

const ContactMain = () => {
    return (
        <React.Fragment>

            {/* SiteBreadcrumb */}
            <SiteBreadcrumb
                pageTitle="Contact"
                pageName="Contact"
                breadcrumbsImg={bannerbg}
            />
            {/* SiteBreadcrumb */}

            {/* Contact Section Start */}
            <div className="rs-contact style1 event-bg pt-110 md-pt-80 pb-100 md-pb-80">
                <div className="container pb-66 md-pb-46">
                    <div className="row gutter-35">
                        <div className="col-md-4">
                            <ContactInfo
                                boxClass="sm-mb-30"
                                title="Address"
                                iconClass="flaticon-location"
                                address="Cité Erriadh - B.P 135, 4023 Sousse"
                            />
                        </div>
                        <div className="col-md-4">
                            <ContactInfo
                                boxClass="sm-mb-30"
                                title="Email Address"
                                iconClass="flaticon-email"
                                email="admin@isetso.run.tn"
                            />
                        </div>
                        <div className="col-md-4">
                            <ContactInfo
                                boxClass=""
                                title="Phone Number"
                                iconClass="flaticon-phone"
                                phone="+216 73 307 960 / 73 307 961"
                            />
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="row y-middle">
                        <div className="col-lg-6 md-mb-30">
                            <div className="map-canvas">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3235.921500152169!2d10.611773674957888!3d35.80186042333945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd8aaf32a4647f%3A0x7ae14f2d2c358385!2sInstitut%20Sup%C3%A9rieur%20des%20Etudes%20Technologiques%20de%20Sousse!5e0!3m2!1sfr!2stn!4v1774871323892!5m2!1sfr!2stn"
                                    width="600"
                                    height="450"
                                    style={{ border: 0 }}   // ✅ correction JSX
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                        <div className="col-lg-6 pl-60 md-pl-14">
                            <div className="contact-widget">
                                <SectionTitle
                                    sectionClass="sec-title3 mb-36"
                                    titleClass="title black-color mb-14"
                                    title="Get in Touch"
                                    descClass="new-desc"
                                    description="Have some suggestions or just want to say hi? Our support team are ready to help you 24/7."
                                />
                                {/* Contact Form */}
                                <ContactForm
                                    submitBtnClass="btn-send"
                                    btnText="Submit"
                                />
                                {/* Contact Form */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Contact Section End */}
        </React.Fragment>
    );
}

export default ContactMain;
