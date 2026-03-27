import React from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../../components/Common/SectionTitle';

const Cta = () => {

    return (
        <div className="rs-cta main-home">
            <div className="partition-bg-wrap">
                <div className="container">
                    <div className="row">
                        <div className="offset-lg-6 col-lg-6 pl-70 md-pl-14">
                            <SectionTitle
                                sectionClass="sec-title3 mb-40"
                                titleClass="title white-color mb-16"
                                title="Offre de 20 % en cours – Inscrivez-vous dès aujourd’hui."
                                descClass="desc white-color pr-100 md-pr-0"
                                description=""
                            />
                            <div className="btn-part">
                                <Link className="readon orange-btn transparent" to="/register">s’inscrire</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cta;