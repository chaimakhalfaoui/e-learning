import { db } from "../db.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// Définir le stockage pour multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Répertoire où enregistrer les fichiers
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

// Vérifier le type de fichier
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images JPEG, PNG et WEBP sont autorisées."), false);
  }
};

// Configurer multer
export const upload = multer({ storage, fileFilter });

// Récupérer toutes les catégories
export const getAllCategorie = (req, res) => {
  const query = "SELECT * FROM categorie";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des catégories :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    return res.status(200).json(results);
  });
};

export const createCategorie = (req, res) => {
  const { title } = req.body;
  const imageName = req.file ? req.file.filename : null;

  if (!title || !imageName) {
    return res.status(400).json({ error: "Title et image sont requis." });
  }

  const query = "INSERT INTO categorie (title, image) VALUES (?, ?)";
  db.query(query, [title, imageName], (err, result) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    res.status(201).json({ message: "Catégorie ajoutée avec succès", id: result.insertId });
  });
};

// Supprimer une catégorie
export const deleteCategorie = (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM categorie WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de la catégorie :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Catégorie non trouvée." });
    }
    return res.status(200).json({ message: "Catégorie supprimée avec succès." });
  });
};

// Mettre à jour une catégorie
export const updateCategorie = (req, res) => {
  upload.single("image")(req, res, function (err) {
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

    let query = "UPDATE categorie SET title = ?";
    const values = [title];

    if (imageName) {
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
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Catégorie non trouvée." });
      }
      return res.status(200).json({ message: "Catégorie mise à jour avec succès." });
    });
  });
};
