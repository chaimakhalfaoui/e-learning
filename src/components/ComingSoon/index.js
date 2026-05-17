import { Link } from 'react-router-dom';

const ComingSoon = () => {
    return (
        <div id="rs-page-error" className="rs-page-error coming-soon">
            <div className="error-text">
                <h1 className="error-code">À venir</h1>
                <h3 className="error-message">Restez connecté</h3>
                <Link className="readon orange-btn" to="/" title="HOME">Retour à la page d'accueil</Link>
            </div>
        </div>
    );
}

export default ComingSoon;