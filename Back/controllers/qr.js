// controllers/qr.js
import { db } from "../db.js";

// Créer un message
export const createMessage = (req, res) => {
    const { idCours, idUser, idEns, message, sentBy, parentId } = req.body;
    
    // Récupérer le nom de l'utilisateur
    const getUserNameQuery = "SELECT username FROM users WHERE id = ?";
    
    db.query(getUserNameQuery, [idUser], (err, userResult) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        
        const userName = userResult[0]?.username || `Étudiant ${idUser}`;
        
        const insertQuery = `
            INSERT INTO qr (idCours, idUser, idEns, message, sentBy, parentId, userName, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        db.query(insertQuery, [idCours, idUser, idEns, message, sentBy || 'etudiant', parentId || null, userName], (err, result) => {
            if (err) {
                console.error("Erreur:", err);
                return res.status(500).json({ error: "Erreur lors de la création du message" });
            }
            res.status(201).json({ message: "Message créé avec succès", id: result.insertId });
        });
    });
};

// Récupérer tous les messages d'un cours
export const getMessagesByCours = (req, res) => {
    const { idCours } = req.params;
    
    const query = `
        SELECT * FROM qr 
        WHERE idCours = ? 
        ORDER BY createdAt ASC
    `;
    
    db.query(query, [idCours], (err, results) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
};

// Supprimer un message
export const deleteMessage = (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    
    const query = "DELETE FROM qr WHERE id = ? AND idUser = ?";
    
    db.query(query, [id, userId], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Message non trouvé ou vous n'êtes pas l'auteur" });
        }
        res.status(200).json({ message: "Message supprimé avec succès" });
    });
};
