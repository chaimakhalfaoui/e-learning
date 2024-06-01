import { db } from "../db.js";

export const createMessage = (req, res) => {
    const { idCours, idUser, idEns, message, sentBy } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!idCours || !idUser || !idEns || !message || !sentBy) {
        return res.status(400).json("Tous les champs sont requis.");
    }

    // Insérer le message dans la base de données
    const insertMessageQuery = "INSERT INTO QR (idCours, idUser, idEns, message, sentBy) VALUES (?, ?, ?, ?, ?)";
    const values = [idCours, idUser, idEns, message, sentBy];

    db.query(insertMessageQuery, values, (err, data) => {
        if (err) {
            console.error("Erreur lors de l'enregistrement du message :", err);
            return res.status(500).json("Une erreur s'est produite lors de l'enregistrement du message.");
        }
        return res.status(200).json("Le message a été enregistré avec succès.");
    });
};


export const getMessages = (req, res) => {
    const { idCours, idUser, idEns } = req.params; 
    
    // Sélectionner tous les messages en fonction de l'ID du cours, de l'ID de l'utilisateur et de l'ID de l'enseignant
    const selectMessagesQuery = "SELECT * FROM QR WHERE idCours = ? AND idUser = ? AND idEns = ?";

    db.query(selectMessagesQuery, [idCours, idUser, idEns], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des messages :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des messages.");
        }
        return res.status(200).json(data);
    });
};