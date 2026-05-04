import { createS3Upload } from "../middleware/s3upload.js";
// controllers/ressource.js
import { db } from "../db.js";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

// Créer le dossier uploads s'il n'existe pas
const uploadDir = 'uploads/ressources/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration multer pour les fichiers
const upload = createS3Upload("uploads");

// Vérification du type de fichier
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(new Error("Format de fichier non supporté. Utilisez PDF, Word, PowerPoint ou Excel."), false);
    }
};


// Récupérer toutes les ressources d'un chapitre
export const getRessourcesByChapitre = (req, res) => {
    const { id_chapitre } = req.params;
    
    const query = "SELECT * FROM ressources WHERE id_chapitre = ? ORDER BY created_at DESC";
    db.query(query, [id_chapitre], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des ressources:", err);
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
            console.error("Erreur lors de la récupération de la ressource:", err);
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
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer:", err);
            return res.status(500).json({ error: "Erreur lors du téléchargement du fichier." });
        } else if (err) {
            console.error("Erreur:", err);
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
                console.error("Erreur lors de la création de la ressource:", err);
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
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer:", err);
            return res.status(500).json({ error: "Erreur lors du téléchargement du fichier." });
        } else if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: err.message });
        }

        const { id } = req.params;
        const { titre, description, type_fichier, id_chapitre } = req.body;
        const nouveauFichier = req.file ? req.file.location : null;

        // Récupérer l'ancien fichier
        const getOldFileQuery = "SELECT fichier FROM ressources WHERE id = ?";
        db.query(getOldFileQuery, [id], (err, result) => {
            if (err) {
                console.error("Erreur:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            if (result.length === 0) {
                return res.status(404).json({ error: "Ressource non trouvée." });
            }

            const oldFile = result[0].fichier;
            let query = "UPDATE ressources SET titre = ?, description = ?, type_fichier = ?, id_chapitre = ?";
            const values = [titre, description || null, type_fichier || 'other', id_chapitre];

            if (nouveauFichier) {
                query += ", fichier = ?";
                values.push(nouveauFichier);
                
                // Supprimer l'ancien fichier
                const oldFilePath = path.join('uploads/ressources/', oldFile);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
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
    
    // Récupérer le nom du fichier avant suppression
    const getFileQuery = "SELECT fichier FROM ressources WHERE id = ?";
    db.query(getFileQuery, [id], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Ressource non trouvée." });
        }

        const fichier = result[0].fichier;
        
        // Supprimer de la base de données
        const deleteQuery = "DELETE FROM ressources WHERE id = ?";
        db.query(deleteQuery, [id], (err, deleteResult) => {
            if (err) {
                console.error("Erreur suppression:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            
            // Supprimer le fichier physique
            if (fichier) {
                const filePath = path.join('uploads/ressources/', fichier);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            
            return res.status(200).json({ message: "Ressource supprimée avec succès." });
        });
    });
};

// Télécharger un fichier
export const downloadFichier = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('uploads/ressources/', filename);
    
    if (fs.existsSync(filePath)) {
        return res.download(filePath);
        return res.status(404).json({ error: "Fichier non trouvé." });
    }
};

// Obtenir l'URL du fichier
export const getFichierUrl = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('uploads/ressources/', filename);
    
    if (fs.existsSync(filePath)) {
        return res.sendFile(path.resolve(filePath));
        return res.status(404).json({ error: "Fichier non trouvé." });
    }
};

// Statistiques des ressources par chapitre
export const getRessourcesStats = (req, res) => {
    const { id_chapitre } = req.params;
    
    const query = `
        SELECT 
            type_fichier,
            COUNT(*) as count
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