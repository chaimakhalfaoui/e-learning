// controllers/ressource.js - Version complète et corrigée
import { createS3Upload } from "../middleware/s3upload.js";
import { db } from "../db.js";
import path from "path";
import fs from 'fs';
import multer from "multer";
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
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Format de fichier non supporté."), false);
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
    allowedVideoTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Format vidéo non supporté."), false);
};

export const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFilter,
    limits: { fileSize: 500 * 1024 * 1024 }
});

// ==================== CRUD RESSOURCES ====================

// Récupérer toutes les ressources d'un chapitre
export const getRessourcesByChapitre = (req, res) => {
    const id_chapitre = req.params.id_chapitre;
    const query = "SELECT *, id as ressource_id FROM ressources WHERE id_chapitre = ? ORDER BY id DESC";
    db.query(query, [id_chapitre], (err, data) => {
        if (err) return res.status(500).json({ error: "Erreur serveur." });
        res.status(200).json(data);
    });
};

// Alias pour getAllRessourceId
export const getAllRessourceId = getRessourcesByChapitre;

// Récupérer une ressource par ID
export const getRessourceById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM ressources WHERE id = ?", [id], (err, data) => {
        if (err) return res.status(500).json({ error: "Erreur serveur." });
        if (data.length === 0) return res.status(404).json({ error: "Ressource non trouvée." });
        res.status(200).json(data[0]);
    });
};

// Créer une ressource fichier
export const createRessource = (req, res) => {
    upload.single('fichier')(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message || "Erreur upload" });

        const { titre, description, type_fichier, id_chapitre } = req.body;
        const fichier = req.file ? req.file.filename : null;

        if (!titre || !fichier || !id_chapitre) {
            return res.status(400).json({ error: "Titre, fichier et chapitre sont requis." });
        }

        const query = "INSERT INTO ressources (titre, description, fichier, type_fichier, id_chapitre) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [titre, description || null, fichier, type_fichier || 'other', id_chapitre], (err, result) => {
            if (err) return res.status(500).json({ error: "Erreur serveur." });
            res.status(201).json({ message: "Ressource créée", id: result.insertId, fichier });
        });
    });
};

// Créer une ressource vidéo
export const createRessourceVideo = (req, res) => {
    uploadVideo.single('video')(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message || "Erreur upload vidéo" });

        const { titre, description, id_chapitre } = req.body;
        const video = req.file ? req.file.filename : null;

        if (!titre || !video || !id_chapitre) {
            return res.status(400).json({ error: "Titre, vidéo et chapitre sont requis." });
        }

        const query = "INSERT INTO ressources (titre, description, fichier, type_fichier, id_chapitre) VALUES (?, ?, ?, 'video', ?)";
        db.query(query, [titre, description || null, video, id_chapitre], (err, result) => {
            if (err) return res.status(500).json({ error: "Erreur serveur." });
            res.status(201).json({ message: "Vidéo ajoutée", id: result.insertId, video });
        });
    });
};

// Mettre à jour une ressource
export const updateRessource = (req, res) => {
    upload.single('fichier')(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message || "Erreur upload" });

        const { id } = req.params;
        const { titre, description, type_fichier, id_chapitre } = req.body;
        const nouveauFichier = req.file ? req.file.filename : null;

        db.query("SELECT fichier FROM ressources WHERE id = ?", [id], (err, result) => {
            if (err) return res.status(500).json({ error: "Erreur serveur" });
            if (result.length === 0) return res.status(404).json({ error: "Ressource non trouvée" });

            let query = "UPDATE ressources SET titre = ?, description = ?, type_fichier = ?, id_chapitre = ?";
            const values = [titre, description || null, type_fichier || 'other', id_chapitre];

            if (nouveauFichier) {
                query += ", fichier = ?";
                values.push(nouveauFichier);
            }

            query += " WHERE id = ?";
            values.push(id);

            db.query(query, values, (err) => {
                if (err) return res.status(500).json({ error: "Erreur mise à jour" });
                res.status(200).json({ message: "Ressource mise à jour" });
            });
        });
    });
};

// Supprimer une ressource
export const deleteRessource = (req, res) => {
    const { id } = req.params;

    db.query("SELECT fichier FROM ressources WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        if (result.length === 0) return res.status(404).json({ error: "Ressource non trouvée" });

        const fichier = result[0].fichier;

        db.query("DELETE FROM ressources WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: "Erreur suppression" });

            if (fichier) {
                const filePath = path.join(uploadDir, fichier);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            res.status(200).json({ message: "Ressource supprimée" });
        });
    });
};

// Télécharger un fichier
export const downloadFichier = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);
    fs.existsSync(filePath) ? res.download(filePath) : res.status(404).json({ error: "Fichier non trouvé" });
};

// Lire une vidéo (streaming)
export const getVideo = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Vidéo non trouvée" });

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const stream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        });
        stream.pipe(res);
    } else {
        res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' });
        fs.createReadStream(filePath).pipe(res);
    }
};

// Obtenir l'URL du fichier (S3)
export const getFichierUrl = (req, res) => {
    const { filename } = req.params;
    const fileUrl = `https://isetso-uploads-378174569462.s3.us-east-1.amazonaws.com/uploads/${filename}`;
    res.json({ url: fileUrl });
};

// Statistiques
export const getRessourcesStats = (req, res) => {
    const { id_chapitre } = req.params;
    db.query("SELECT type_fichier, COUNT(*) as count FROM ressources WHERE id_chapitre = ? GROUP BY type_fichier", [id_chapitre], (err, data) => {
        if (err) return res.status(500).json({ error: "Erreur serveur." });
        res.status(200).json(data);
    });
};
