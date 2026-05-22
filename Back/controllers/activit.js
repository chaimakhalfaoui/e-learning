// controllers/activit.js - Version complète et corrigée
import { createS3Upload } from "../middleware/s3upload.js";
import { db } from "../db.js";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import multer from "multer";

// Créer les dossiers s'ils n'existent pas
const uploadDir = 'uploads/';
const uploadVideoDir = 'uploads/videos/';
const uploadDevoirDir = 'uploads/devoirs/';

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(uploadVideoDir)) fs.mkdirSync(uploadVideoDir, { recursive: true });
if (!fs.existsSync(uploadDevoirDir)) fs.mkdirSync(uploadDevoirDir, { recursive: true });

// Utiliser S3 pour le stockage
const upload = createS3Upload("uploads");
const uploadDevoir = createS3Upload("uploads/devoirs", { fileSize: 50 * 1024 * 1024 });
const uploadv = createS3Upload("uploads/videos", { fileSize: 500 * 1024 * 1024 });

// ==================== CRÉATION ====================

export const createActivite = (req, res) => {
    const { titre, categorie, contenu, duration, id_chapitre } = req.body;
    if (!titre || !categorie || !contenu || !duration || !id_chapitre) {
        return res.status(400).json("Tous les champs sont requis.");
    }
    const query = "INSERT INTO activite (titre, categorie, contenu, duration, id_chapitre) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [titre, categorie, contenu, duration, id_chapitre], (err, data) => {
        if (err) return res.status(500).json("Erreur création activité.");
        res.status(200).json({ message: "Activité créée", id: data.insertId });
    });
};

export const createActivitei = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(500).json("Erreur upload image.");
        const { titre, categorie, id_chapitre, duration } = req.body;
        const imageName = req.file?.filename;
        if (!titre || !categorie || !id_chapitre || !imageName || !duration) {
            return res.status(400).json("Tous les champs sont requis.");
        }
        db.query("INSERT INTO activite (titre, categorie, contenu, duration, id_chapitre) VALUES (?, ?, ?, ?, ?)",
            [titre, categorie, imageName, duration, id_chapitre], (err) => {
                if (err) return res.status(500).json("Erreur création.");
                res.status(200).json({ message: "Activité image créée" });
            });
    });
};

export const createActivitev = (req, res) => {
    uploadv.single('video')(req, res, (err) => {
        if (err) return res.status(500).json("Erreur upload vidéo.");
        const { titre, categorie, id_chapitre, duration } = req.body;
        const videoName = req.file?.filename;
        if (!titre || !categorie || !id_chapitre || !videoName || !duration) {
            return res.status(400).json("Tous les champs sont requis.");
        }
        db.query("INSERT INTO activite (titre, categorie, contenu, duration, id_chapitre) VALUES (?, ?, ?, ?, ?)",
            [titre, categorie, videoName, duration, id_chapitre], (err) => {
                if (err) return res.status(500).json("Erreur création.");
                res.status(200).json({ message: "Activité vidéo créée" });
            });
    });
};

export const createQuestionnaire = (req, res) => {
    const { titre, questions, id_chapitre } = req.body;
    if (!titre || !id_chapitre || !questions) return res.status(400).json("Champs requis.");
    db.query("INSERT INTO activite (titre, categorie, contenu, id_chapitre) VALUES (?, 'questionnaire', ?, ?)",
        [titre, JSON.stringify(questions), id_chapitre], (err, data) => {
            if (err) return res.status(500).json("Erreur création questionnaire.");
            res.status(200).json({ message: "Questionnaire créé", id: data.insertId });
        });
};

export const createDevoir = (req, res) => {
    uploadDevoir.single('fichier')(req, res, (err) => {
        if (err) return res.status(500).json("Erreur upload fichier.");
        const { titre, date_limite, id_chapitre } = req.body;
        const fichier = req.file?.location;
        if (!titre || !id_chapitre || !fichier) return res.status(400).json("Titre, fichier et chapitre requis.");
        const devoirData = JSON.stringify({ fichier, type_fichier: req.body.type_fichier || 'other', date_limite: date_limite || null });
        db.query("INSERT INTO activite (titre, categorie, contenu, id_chapitre) VALUES (?, 'devoir', ?, ?)",
            [titre, devoirData, id_chapitre], (err, data) => {
                if (err) return res.status(500).json("Erreur création devoir.");
                res.status(200).json({ message: "Devoir créé", id: data.insertId });
            });
    });
};

export const createVideoInteractive = (req, res) => {
    uploadv.single('video')(req, res, (err) => {
        if (err) return res.status(500).json("Erreur upload vidéo.");
        const { titre, id_chapitre, questions_interactives } = req.body;
        const videoName = req.file?.location;
        if (!titre || !id_chapitre || !videoName) return res.status(400).json("Titre, vidéo et chapitre requis.");
        const videoData = JSON.stringify({ video: videoName, questions: questions_interactives ? JSON.parse(questions_interactives) : [] });
        db.query("INSERT INTO activite (titre, categorie, contenu, id_chapitre) VALUES (?, 'video_interactive', ?, ?)",
            [titre, videoData, id_chapitre], (err, data) => {
                if (err) return res.status(500).json("Erreur création.");
                res.status(200).json({ message: "Vidéo interactive créée", id: data.insertId });
            });
    });
};

// ==================== RÉCUPÉRATION ====================

export const getAllActiviteId = (req, res) => {
    db.query("SELECT * FROM activite WHERE id_chapitre = ? ORDER BY id ASC", [req.params.id], (err, data) => {
        if (err) return res.status(500).json("Erreur.");
        res.status(200).json(data);
    });
};

export const getActivite = (req, res) => {
    db.query("SELECT * FROM activite WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur serveur." });
        if (result.length === 0) return res.status(404).json({ error: "Activité non trouvée." });
        const activite = result[0];
        if (['questionnaire', 'devoir', 'video_interactive'].includes(activite.categorie)) {
            try { activite.contenu_parsed = JSON.parse(activite.contenu); } catch (e) { activite.contenu_parsed = activite.contenu; }
        }
        res.status(200).json(activite);
    });
};

export const getActivitesByChapitre = (req, res) => {
    const id_chapitre = req.params.id || req.params.chapitreId;
    if (!id_chapitre) return res.status(400).json({ error: "L'ID du chapitre est requis." });
    db.query("SELECT * FROM activite WHERE id_chapitre = ? ORDER BY id ASC", [id_chapitre], (err, data) => {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        res.status(200).json(data);
    });
};

export const getActiviteByChapitre = getActivitesByChapitre;

// ==================== TÉLÉCHARGEMENT CORRIGÉ POUR S3 ====================

export const getDevoirFichier = (req, res) => {
    const { filename } = req.params;
    
    // Si c'est une URL S3 complète
    if (filename && filename.startsWith('http')) {
        // Rediriger vers l'URL S3
        return res.redirect(filename);
    }
    
    // Fallback pour les fichiers locaux (si besoin)
    const filePath = path.join('uploads/devoirs/', filename);
    if (fs.existsSync(filePath)) {
        return res.download(filePath);
    }
    
    res.status(404).json({ error: "Fichier non trouvé." });
};

// ==================== SUPPRESSION ====================

export const deleteActivite = (req, res) => {
    db.query("DELETE FROM activite WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json("Erreur suppression.");
        if (result.affectedRows === 0) return res.status(404).json("Non trouvée.");
        res.status(200).json({ message: "Activité supprimée" });
    });
};

// ==================== MISES À JOUR ====================

export const updateActiviteText = (req, res) => {
    const { titre, categorie, contenu, duration, id_chapitre } = req.body;
    db.query("UPDATE activite SET titre=?, categorie=?, contenu=?, duration=?, id_chapitre=? WHERE id=?",
        [titre, categorie, contenu, duration, id_chapitre, req.params.id], (err) => {
            if (err) return res.status(500).json("Erreur mise à jour.");
            res.status(200).json({ message: "Activité mise à jour" });
        });
};

export const updateActiviteImage = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(500).json({ error: "Erreur upload" });
        const { titre, categorie, duration, id_chapitre } = req.body;
        const imageName = req.file?.filename;
        let query = "UPDATE activite SET titre=?, categorie=?, duration=?, id_chapitre=?";
        const values = [titre, categorie, duration, id_chapitre];
        if (imageName) {
            query += ", contenu=?";
            values.push(imageName);
        }
        query += " WHERE id=?";
        values.push(req.params.id);
        db.query(query, values, (err) => {
            if (err) return res.status(500).json({ error: "Erreur mise à jour" });
            res.status(200).json({ message: "Activité mise à jour" });
        });
    });
};

export const updateActiviteVideo = (req, res) => {
    uploadv.single('video')(req, res, (err) => {
        if (err) return res.status(500).json({ error: "Erreur upload" });
        const { titre, categorie, duration, id_chapitre } = req.body;
        const videoName = req.file?.filename;
        let query = "UPDATE activite SET titre=?, categorie=?, duration=?, id_chapitre=?";
        const values = [titre, categorie, duration, id_chapitre];
        if (videoName) {
            query += ", contenu=?";
            values.push(videoName);
        }
        query += " WHERE id=?";
        values.push(req.params.id);
        db.query(query, values, (err) => {
            if (err) return res.status(500).json({ error: "Erreur mise à jour" });
            res.status(200).json({ message: "Activité mise à jour" });
        });
    });
};

export const updateActiviteI = updateActiviteImage;

export default { upload, uploadDevoir, uploadv };
