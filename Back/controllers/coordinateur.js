import { db } from "../db.js";

export const getAllCoordinateurs = (req, res) => {
  const query = "SELECT id, username, email, age, telephone, genre, created_at FROM Users WHERE role = 'coordinateur'";
  db.query(query, (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    return res.status(200).json(data);
  });
};

// ✅ Récupérer un enseignant par ID
export const getCoordinateurById = (req, res) => {
  const coordinateurId = req.params.id;
  const query = "SELECT id, username, email, role FROM Users WHERE id = ? AND role = 'coordinateur'";
  db.query(query, [coordinateurId], (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération de le coordinateur :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Coordinateur introuvable" });
    }
    return res.status(200).json(data[0]); // renvoyer un objet unique
  });
};

export const addCoordinateur = (req, res) => {
  const { username, email, password, age, telephone, genre } = req.body;
  const query = "INSERT INTO Users (username, email, password, role, age, telephone, genre) VALUES (?, ?, ?, 'coordinateur', ?, ?, ?)";
  db.query(query, [username, email, password, age, telephone, genre], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    return res.status(201).json({ message: "Coordinateur ajouté avec succès", id: result.insertId });
  });
};

export const updateCoordinateur = (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;
  const query = "UPDATE Users SET username=?, email=?, role=? WHERE id=?";
  db.query(query, [username, email, role, id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    return res.status(200).json({ message: "Coordinateur mis à jour avec succès" });
  });
};

export const deleteCoordinateur = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM Users WHERE id=? AND role='coordinateur'";
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    return res.status(200).json({ message: "Coordinateur supprimé avec succès" });
  });
};
