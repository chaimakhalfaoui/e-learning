import axios from 'axios';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const Q = () => {
    const { id } = useParams();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    

    const idCours = 1; // Remplacez par la valeur appropriée
    const idUser = 1; // Remplacez par la valeur appropriée
    const idEns = 1; // Remplacez par la valeur appropriée

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérification si le message est vide
        if (!message.trim()) {
            setError('Le message ne peut pas être vide.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8801/api/qr/createMessage', {
                idCours: id,
                idUser: 1,
                idEns: 1,
                message,
                sentBy: 'user' 
            });

            if (response.status === 200) {
                // Message créé avec succès, vous pouvez effectuer des actions supplémentaires ici
                setMessage(''); // Effacer le champ de message après la soumission réussie
            }
        } catch (error) {
            console.error('Erreur lors de la création du message :', error);
            setError('Une erreur s\'est produite lors de la création du message.');
        }
    };

    return (
        <div className="content pt-30 pb-30 white-bg">
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="message">Message :</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>
                {error && <p>{error}</p>}
                <button type="submit">Envoyer</button>
            </form>
        </div>
    );
};

export default Q;