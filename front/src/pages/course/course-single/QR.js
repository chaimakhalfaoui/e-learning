import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/authContext';

const Q = () => {
    const { id } = useParams();
    const { idUser } = useAuth();
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [enseignantId, setEnseignantId] = useState(null);

    useEffect(() => {
        const fetchEnseignantId = async () => {
            try {
                const response = await axios.get(`process.env.REACT_APP_API_URL/cours/getUserIdByCourseId/${id}`);
                setEnseignantId(response.data);
            } catch (error) {
                console.error("Erreur:", error);
            }
        };
        fetchEnseignantId();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!message.trim()) {
            setError('Veuillez saisir un message.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setLoading(true);
        try {
            const userid = await idUser();
            await axios.post('process.env.REACT_APP_API_URL/qr/createMessage', {
                idCours: id,
                idUser: userid,
                idEns: enseignantId,
                message: message,
                sentBy: 'user'
            });
            
            setSuccess('Message envoyé avec succès !');
            setMessage('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Erreur lors de l\'envoi.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content pt-30 pb-30 white-bg">
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
                    💬 Contacter l'enseignant
                </h3>
                
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Votre message..."
                        rows="5"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            fontSize: '14px'
                        }}
                        disabled={loading}
                    />
                    
                    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                    {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            backgroundColor: '#ff5421',
                            color: 'white',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? 'Envoi...' : 'Envoyer'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Q;