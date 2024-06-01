import { Link } from 'react-router-dom';

const ErrorContent = () => {
    return (
        <div id="rs-page-error" className="rs-page-error">
            <div className="error-text">
                <h1 className="error-code">404</h1>
                <h3 className="error-message">Page Not Found</h3>
                <Link className="readon orange-btn" to="/" title="HOME">Back to Homepage</Link>
            </div>
        </div>
    );
}

export default ErrorContent;