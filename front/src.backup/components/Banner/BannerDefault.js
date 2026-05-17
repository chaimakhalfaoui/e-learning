import React from 'react';
import { Link } from 'react-router-dom';

import bgImg from '../../assets/img/bg/home1.jpg';

const bgStyle = {
    backgroundImage:`url(${bgImg})`
}

const BannerDefault = () => {
    return (
        <React.Fragment>
            {/* <!-- banner section start --> */}
            <div id="rs-banner" className="rs-banner style1" style={bgStyle}>
                <div className="container">
                    <div className="banner-content text-center">
                        <h1 className="banner-title capitalize">Bienvenue sur E-Learning ISET SOUSSE</h1>
                        <div className="desc mb-34">Votre plateforme d'apprentissage en ligne</div>
                        <div className="banner-btn">
                            <Link className="readon orange-btn" to="/course">Trouvez un cours</Link>
                        </div>
                    </div>
                </div>
            </div>            
            {/* <!-- banner section end --> */}            
        </React.Fragment>
    );
}

export default BannerDefault;