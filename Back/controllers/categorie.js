// controllers/categorie.js
import { db } from "../db.js";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S'assurer que le dossier uploads existe
const uploadDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration S3
const s3 = new S3Client({ region: "us-east-1" });
const BUCKET = "isetso-uploads-378174569462";

const s3Storage = multerS3({
    s3,
    bucket: BUCKET,
    key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + uuidv4();
        cb(null, "uploads/" + uniqueSuffix + "-" + file.originalname);
    }
});

// Stockage local comme fallback
const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + uuidv4();
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});

// Vérifier le type de fichier
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Seules les images JPEG, PNG, JPG et WEBP sont autorisées."), false);
    }
};

// Utiliser S3 ou stockage local
const useS3 = process.env.USE_S3 === 'true';
const storage = useS3 ? s3Storage : localStorage;

// Configurer multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Middleware pour l'upload d'image
export const uploadMiddleware = upload.single("image");

// ==================== CRUD CATÉGORIES ====================

// Récupérer toutes les catégories
export const getAllCategorie = (req, res) => {
    const query = "SELECT * FROM categorie ORDER BY id DESC";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        return res.status(200).json(results);
    });
};

// Récupérer une catégorie par ID
export const getCategorieById = (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM categorie WHERE id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Erreur récupération catégorie:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Catégorie non trouvée" });
        }
        return res.status(200).json(results[0]);
    });
};

// Créer une catégorie
export const createCategorie = (req, res) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        const { title } = req.body;
        const imageUrl = req.file ? (useS3 ? req.file.location : req.file.filename) : null;
        
        if (!title || !imageUrl) {
            return res.status(400).json({ error: "Title et image sont requis." });
        }
        
        const query = "INSERT INTO categorie (title, image) VALUES (?, ?)";
        db.query(query, [title, imageUrl], (err, result) => {
            if (err) {
                console.error("Erreur création catégorie:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            res.status(201).json({ message: "Catégorie ajoutée avec succès", id: result.insertId });
        });
    });
};

// Mettre à jour une catégorie
export const updateCategorie = (req, res) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        const { id } = req.params;
        const { title } = req.body;
        const imageUrl = req.file ? (useS3 ? req.file.location : req.file.filename) : null;
        
        if (!title) {
            return res.status(400).json({ error: "Le champ title est requis." });
        }
        
        // Vérifier si la catégorie existe
        db.query("SELECT * FROM categorie WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json({ error: "Erreur serveur" });
            if (results.length === 0) return res.status(404).json({ error: "Catégorie non trouvée" });
            
            let query = "UPDATE categorie SET title = ?";
            const values = [title];
            
            if (imageUrl) {
                query += ", image = ?";
                values.push(imageUrl);
            }
            
            query += " WHERE id = ?";
            values.push(id);
            
            db.query(query, values, (err) => {
                if (err) return res.status(500).json({ error: "Erreur serveur." });
                return res.status(200).json({ message: "Catégorie mise à jour avec succès." });
            });
        });
    });
};

// Supprimer une catégorie
export const deleteCategorie = (req, res) => {
    const { id } = req.params;
    
    db.query("SELECT image FROM categorie WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur serveur." });
        if (results.length === 0) return res.status(404).json({ error: "Catégorie non trouvée." });
        
        // Supprimer l'image du dossier uploads (si stockage local)
        if (!useS3 && results[0].image) {
            const imagePath = path.join(uploadDir, results[0].image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        db.query("DELETE FROM categorie WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: "Erreur serveur." });
            return res.status(200).json({ message: "Catégorie supprimée avec succès." });
        });
    });
};

export default upload;
