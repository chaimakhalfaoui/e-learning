import { db } from "../db.js";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET = "isetso-frontend-378174569462";

const storage = multerS3({
  s3,
  bucket: BUCKET,
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    cb(null, "uploads/" + uniqueSuffix + "-" + file.originalname);
  }
});

export const upload = multer({ storage });

export const getAllCategorie = (req, res) => {
  const query = "SELECT * FROM categorie";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    return res.status(200).json(results);
  });
};

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
    });
  });
};
