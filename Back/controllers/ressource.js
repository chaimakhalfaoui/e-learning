import { createS3Upload } from "../middleware/s3upload.js";
import { db } from "../db.js";

const upload = createS3Upload("uploads");

// Récupérer toutes les ressources d'un chapitre
export const getRessourcesByChapitre = (req, res) => {
    const { id_chapitre } = req.params;
    const query = "SELECT * FROM ressources WHERE id_chapitre = ? ORDER BY created_at DESC";
    db.query(query, [id_chapitre], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json(data);
    });
};

// Récupérer une ressource par ID
export const getRessourceById = (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM ressources WHERE id = ?";
    db.query(query, [id], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: "Ressource non trouvée." });
        }
        return res.status(200).json(data[0]);
    });
};

// Créer une ressource avec fichier
export const createRessource = (req, res) => {
    upload.single('fichier')(req, res, function (err) {
        if (err) {
            console.error("Erreur upload:", err);
            return res.status(500).json({ error: err.message });
        }

        const { titre, description, type_fichier, id_chapitre } = req.body;
        const fichier = req.file ? req.file.location : null;

        if (!titre || !fichier || !id_chapitre) {
            return res.status(400).json({ error: "Titre, fichier et chapitre sont requis." });
        }

        const query = `INSERT INTO ressources (titre, description, fichier, type_fichier, id_chapitre)
                       VALUES (?, ?, ?, ?, ?)`;

        db.query(query, [titre, description || null, fichier, type_fichier || 'other', id_chapitre], (err, result) => {
            if (err) {
                console.error("Erreur SQL:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            return res.status(201).json({
                message: "Ressource créée avec succès.",
                id: result.insertId,
                fichier: fichier
            });
        });
    });
};

// Mettre à jour une ressource
export const updateRessource = (req, res) => {
    upload.single('fichier')(req, res, function (err) {
        if (err) {
            console.error("Erreur upload:", err);
            return res.status(500).json({ error: err.message });
        }

        const { id } = req.params;
        const { titre, description, type_fichier, id_chapitre } = req.body;
        const nouveauFichier = req.file ? req.file.location : null;

        const getOldFileQuery = "SELECT fichier FROM ressources WHERE id = ?";
        db.query(getOldFileQuery, [id], (err, result) => {
            if (err) {
                console.error("Erreur:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            if (result.length === 0) {
                return res.status(404).json({ error: "Ressource non trouvée." });
            }

            let query = "UPDATE ressources SET titre = ?, description = ?, type_fichier = ?, id_chapitre = ?";
            const values = [titre, description || null, type_fichier || 'other', id_chapitre];

            if (nouveauFichier) {
                query += ", fichier = ?";
                values.push(nouveauFichier);
            }

            query += " WHERE id = ?";
            values.push(id);

            db.query(query, values, (err, updateResult) => {
                if (err) {
                    console.error("Erreur mise à jour:", err);
                    return res.status(500).json({ error: "Erreur serveur." });
                }
                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({ error: "Ressource non trouvée." });
                }
                return res.status(200).json({ message: "Ressource mise à jour avec succès." });
            });
        });
    });
};

// Supprimer une ressource
export const deleteRessource = (req, res) => {
    const { id } = req.params;
    const getFileQuery = "SELECT fichier FROM ressources WHERE id = ?";
    db.query(getFileQuery, [id], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Ressource non trouvée." });
        }

        const deleteQuery = "DELETE FROM ressources WHERE id = ?";
        db.query(deleteQuery, [id], (err, deleteResult) => {
            if (err) {
                console.error("Erreur suppression:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            return res.status(200).json({ message: "Ressource supprimée avec succès." });
        });
    });
};

// Obtenir l'URL du fichier
export const getFichierUrl = (req, res) => {
    const { filename } = req.params;
    // Retourner l'URL S3
    const fileUrl = `https://isetso-uploads-378174569462.s3.us-east-1.amazonaws.com/uploads/${filename}`;
    return res.json({ url: fileUrl });
};

// Statistiques des ressources par chapitre
export const getRessourcesStats = (req, res) => {
    const { id_chapitre } = req.params;
    const query = `
        SELECT type_fichier, COUNT(*) as count
        FROM ressources
        WHERE id_chapitre = ?
        GROUP BY type_fichier
    `;
    db.query(query, [id_chapitre], (err, data) => {
        if (err) {
            console.error("Erreur statistiques:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json(data);
    });
};
