// controllers/ressource.js - Version sans type_ressource

import { db } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

// Créer le dossier uploads s'il n'existe pas
const uploadDir = 'uploads/ressources/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration multer pour les fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Vérification du type de fichier
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'video/x-msvideo'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format de fichier non supporté."), false);
    }
};

export const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 }
});

// Configuration pour les vidéos
const videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const videoFilter = (req, file, cb) => {
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
    if (allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format vidéo non supporté."), false);
    }
};

export const uploadVideo = multer({ 
    storage: videoStorage, 
    fileFilter: videoFilter,
    limits: { fileSize: 500 * 1024 * 1024 }
});

// Récupérer toutes les ressources d'un chapitre
export const getRessourcesByChapitre = (req, res) => {
    const { id_chapitre } = req.params;
    
    const query = "SELECT *, CASE WHEN fichier LIKE '%.mp4%' OR fichier LIKE '%.avi%' OR fichier LIKE '%.mov%' THEN 'video' ELSE 'fichier' END as type_ressource FROM ressources WHERE id_chapitre = ? ORDER BY created_at DESC";
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
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer:", err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(500).json({ error: "Le fichier est trop volumineux. Maximum 500MB." });
            }
            return res.status(500).json({ error: "Erreur lors du téléchargement." });
        } else if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: err.message });
        }

        const { titre, description, type_fichier, id_chapitre } = req.body;
        const fichier = req.file ? req.file.filename : null;

        if (!titre || !fichier || !id_chapitre) {
            return res.status(400).json({ error: "Titre, fichier et chapitre sont requis." });
        }

        // Version sans type_ressource
        const query = `INSERT INTO ressources (titre, description, fichier, type_fichier, id_chapitre) 
                       VALUES (?, ?, ?, ?, ?)`;
        
        db.query(query, [titre, description || null, fichier, type_fichier || 'other', id_chapitre], (err, result) => {
            if (err) {
                console.error("Erreur:", err);
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

// Créer une ressource vidéo (détectée automatiquement par l'extension)
export const createRessourceVideo = (req, res) => {
    uploadVideo.single('video')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer:", err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(500).json({ error: "La vidéo est trop volumineuse. Maximum 500MB." });
            }
            return res.status(500).json({ error: "Erreur lors du téléchargement." });
        } else if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: err.message });
        }

        const { titre, description, id_chapitre } = req.body;
        const video = req.file ? req.file.filename : null;

        if (!titre || !video || !id_chapitre) {
            return res.status(400).json({ error: "Titre, vidéo et chapitre sont requis." });
        }

        // Version sans type_ressource - on utilise type_fichier = 'video'
        const query = `INSERT INTO ressources (titre, description, fichier, type_fichier, id_chapitre) 
                       VALUES (?, ?, ?, ?, ?)`;
        
        db.query(query, [titre, description || null, video, 'video', id_chapitre], (err, result) => {
            if (err) {
                console.error("Erreur:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            return res.status(201).json({ 
                message: "Vidéo ajoutée avec succès.", 
                id: result.insertId,
                video: video
            });
        });
    });
};

// Mettre à jour une ressource
export const updateRessource = (req, res) => {
    upload.single('fichier')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer:", err);
            return res.status(500).json({ error: "Erreur lors du téléchargement." });
        } else if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: err.message });
        }

        const { id } = req.params;
        const { titre, description, type_fichier, id_chapitre } = req.body;
        const nouveauFichier = req.file ? req.file.filename : null;

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
                
                const oldFilePath = path.join('uploads/ressources/', oldFile);
                if (fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                    } catch (unlinkErr) {
                        console.error("Erreur suppression ancien fichier:", unlinkErr);
                    }
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
        
        const deleteQuery = "DELETE FROM ressources WHERE id = ?";
        db.query(deleteQuery, [id], (err, deleteResult) => {
            if (err) {
                console.error("Erreur suppression:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            
            if (fichier) {
                const filePath = path.join('uploads/ressources/', fichier);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (unlinkErr) {
                        console.error("Erreur suppression fichier:", unlinkErr);
                    }
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
        return res.download(filePath, (err) => {
            if (err) {
                console.error("Erreur téléchargement:", err);
                return res.status(500).json({ error: "Erreur lors du téléchargement." });
            }
        });
    } else {
        return res.status(404).json({ error: "Fichier non trouvé." });
    }
};

// Lire une vidéo (streaming)
export const getVideo = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('uploads/ressources/', filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Vidéo non trouvée." });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
};

// Obtenir l'URL du fichier
export const getFichierUrl = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('uploads/ressources/', filename);
    
    if (fs.existsSync(filePath)) {
        return res.sendFile(path.resolve(filePath));
    } else {
        return res.status(404).json({ error: "Fichier non trouvé." });
    }
};

// Statistiques
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