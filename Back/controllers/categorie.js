// controllers/categorie.js
import { db } from "../db.js";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

<<<<<<< HEAD
// S'assurer que le dossier uploads existe
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Définir le stockage pour multer (identique à la création)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
=======
const s3 = new S3Client({ region: "us-east-1" });
const BUCKET = "isetso-uploads-378174569462";

const storage = multerS3({
  s3,
  bucket: BUCKET,
  key: function (req, file, cb) {
>>>>>>> 08659bf02d98d91ae50074d86f666aa0ce63aeb7
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    cb(null, "uploads/" + uniqueSuffix + "-" + file.originalname);
  }
});

<<<<<<< HEAD
// Vérifier le type de fichier
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images JPEG, PNG, JPG et WEBP sont autorisées."), false);
  }
};

// Configurer multer
const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadMiddleware = upload.single("image");

// Récupérer toutes les catégories
=======
export const upload = multer({ storage });

>>>>>>> 08659bf02d98d91ae50074d86f666aa0ce63aeb7
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
      console.error("Erreur lors de la récupération de la catégorie :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    return res.status(200).json(results[0]);
  });
};

// Créer une catégorie (inchangé)
export const createCategorie = (req, res) => {
  const { title } = req.body;
  const imageUrl = req.file ? req.file.location : null;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: "Title et image sont requis." });
  }
  const query = "INSERT INTO categorie (title, image) VALUES (?, ?)";
  db.query(query, [title, imageUrl], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    res.status(201).json({ message: "Catégorie ajoutée avec succès", id: result.insertId });
  });
};

<<<<<<< HEAD
// Mettre à jour une catégorie (CORRIGÉ - même logique que création)
export const updateCategorie = (req, res) => {
  // Utiliser le middleware multer de la même manière que createCategorie
  upload.single("image")(req, res, function(err) {
    if (err) {
      console.error("Erreur upload :", err);
      return res.status(400).json({ error: err.message });
    }

    const { id } = req.params;
    const { title } = req.body;
    const imageName = req.file ? req.file.filename : null;

    if (!title) {
      return res.status(400).json({ error: "Le champ title est requis." });
    }

    // Vérifier si la catégorie existe
    const checkQuery = "SELECT * FROM categorie WHERE id = ?";
    db.query(checkQuery, [id], (err, results) => {
      if (err) {
        console.error("Erreur lors de la vérification :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Catégorie non trouvée" });
      }

      // Construire la requête de mise à jour
      let query = "UPDATE categorie SET title = ?";
      const values = [title];

      // Si nouvelle image, l'ajouter (comme dans la création)
      if (imageName) {
        // Supprimer l'ancienne image si elle existe
        if (results[0].image) {
          const oldImagePath = path.join(uploadDir, results[0].image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        query += ", image = ?";
        values.push(imageName);
      }

      query += " WHERE id = ?";
      values.push(id);

      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour :", err);
          return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json({ 
          message: imageName ? "Catégorie mise à jour avec succès (image changée)" : "Catégorie mise à jour avec succès" 
        });
      });
=======
export const deleteCategorie = (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM categorie WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Catégorie non trouvée." });
    return res.status(200).json({ message: "Catégorie supprimée avec succès." });
  });
};

export const updateCategorie = (req, res) => {
  upload.single("image")(req, res, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    const { id } = req.params;
    const { title } = req.body;
    const imageUrl = req.file ? req.file.location : null;
    if (!title) return res.status(400).json({ error: "Le champ title est requis." });
    let query = "UPDATE categorie SET title = ?";
    const values = [title];
    if (imageUrl) { query += ", image = ?"; values.push(imageUrl); }
    query += " WHERE id = ?";
    values.push(id);
    db.query(query, values, (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur serveur." });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Catégorie non trouvée." });
      return res.status(200).json({ message: "Catégorie mise à jour avec succès." });
>>>>>>> 08659bf02d98d91ae50074d86f666aa0ce63aeb7
    });
  });
};

// Supprimer une catégorie
export const deleteCategorie = (req, res) => {
  const { id } = req.params;
  
  const getImageQuery = "SELECT image FROM categorie WHERE id = ?";
  db.query(getImageQuery, [id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'image :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Catégorie non trouvée." });
    }
    
    // Supprimer l'image du dossier uploads
    if (results[0].image) {
      const imagePath = path.join(uploadDir, results[0].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const deleteQuery = "DELETE FROM categorie WHERE id = ?";
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression :", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }
      return res.status(200).json({ message: "Catégorie supprimée avec succès." });
    });
  });
};