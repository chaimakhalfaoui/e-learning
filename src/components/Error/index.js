import { Link } from 'react-router-dom';

const ErrorContent = () => {
    return (
        <div id="rs-page-error" className="rs-page-error">
            <div className="error-text">
                <h1 className="error-code">404</h1>
                <h3 className="error-message">Page introuvable</h3>
                <Link className="readon orange-btn" to="/" title="HOME">Retour à la page d'accueil</Link>
            </div>
        </div>
    );
}

export default ErrorContent;