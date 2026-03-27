import React from 'react';
import Slider from "react-slick";
import SectionTitle from '../../components/Common/SectionTitle';
import SingleTestimonial from '../../components/Testimonial/SingleTestimonial';


import quote from '../../assets/img/testimonial/main-home/test-2.png';
import author1 from '../../assets/img/testimonial/style5/1.png';
import author2 from '../../assets/img/testimonial/style5/2.png';
import author3 from '../../assets/img/testimonial/style5/3.png';

const Testimonial = () => {

    const testimonialSettings = {
        dots: true,
        centerMode: false,
        infinite: true,
        arrows: false,
        slidesToShow: 2,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 1,
                    dots: false,
                }
            }
        ]
    };

    return (
        <React.Fragment>
            <div className="rs-testimonial main-home pt-100 pb-100 md-pt-70 md-pb-70">
                <div className="container">
                    <SectionTitle
                        sectionClass="sec-title3 mb-50 md-mb-30 text-center"
                        subtitleClass="sub-title primary"
                        subtitle=""
                        titleClass="title white-color"
                        title="Avis des étudiants"
                        effectClass="heading-line"
                    />
                    <Slider {...testimonialSettings}>
                        <SingleTestimonial
                            itemClass="testi-item"
                            quoteImage={quote}
                            authorImage={author1}
                            Title="Amin W."
                            Designation="Web Developer"
                            Description="Cette plateforme a complètement transformé ma façon d'apprendre. Les cours sont clairs, bien structurés et accessibles à tout moment. Je recommande vivement à tous ceux qui souhaitent évoluer professionnellement."
                        />
                        <SingleTestimonial
                            itemClass="testi-item"
                            quoteImage={quote}
                            authorImage={author2}
                            Title="Mohamed S. "
                            Designation="App Developer"
                            Description="J'ai suivi plusieurs formations en ligne, mais celle-ci se démarque vraiment. Les instructeurs sont compétents et toujours disponibles pour répondre aux questions. Une expérience d'apprentissage exceptionnelle !"
                        />
                        <SingleTestimonial
                            itemClass="testi-item"
                            quoteImage={quote}
                            authorImage={author3}
                            Title="Karim T."
                            Designation="Web Designer"
                            Description="Grâce à cette plateforme, j'ai pu acquérir de nouvelles compétences tout en travaillant à plein temps. Les cours sont flexibles et parfaitement adaptés à mon emploi du temps chargé."
                        />
                    </Slider>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Testimonial