import {db} from "../db.js";

// ✅ Récupérer tous les enseignants
export const getAllEnseignants = (req, res) => {
  const query = "SELECT id, username, email, age, telephone, genre, created_at FROM Users WHERE role = 'enseignant'";
  db.query(query, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des enseignants :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json(data);
  });
};

// ✅ Ajouter un enseignant
export const addEnseignant = (req, res) => {
  const { username, email, password, age, telephone, genre } = req.body;
  const query = "INSERT INTO Users (username, email, password, role, age, telephone, genre) VALUES (?, ?, ?, 'enseignant', ?, ?, ?)";
  db.query(query, [username, email, password, age, telephone, genre], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de l'enseignant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(201).json({ message: "Enseignant ajouté avec succès", id: result.insertId });
  });
};

// ✅ Supprimer un enseignant
export const deleteEnseignant = (req, res) => {
  const enseignantId = req.params.id;
  const query = "DELETE FROM Users WHERE id = ? AND role = 'enseignant'";
  db.query(query, [enseignantId], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'enseignant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json({ message: "Enseignant supprimé avec succès" });
  });
};

// ✅ Récupérer un enseignant par ID
export const getEnseignantById = (req, res) => {
  const enseignantId = req.params.id;
  const query = "SELECT id, username, email, role FROM Users WHERE id = ? AND role = 'enseignant'";
  db.query(query, [enseignantId], (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'enseignant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Enseignant introuvable" });
    }
    return res.status(200).json(data[0]); // renvoyer un objet unique
  });
};

// ✅ Modifier un enseignant
export const updateEnseignant = (req, res) => {
  const enseignantId = req.params.id;
  const { username, email, role } = req.body; // inclure role
  const query = "UPDATE Users SET username = ?, email = ?, role = ? WHERE id = ?";
  db.query(query, [username, email, role, enseignantId], (err) => {
    if (err) {
      console.error("Erreur lors de la modification de l'enseignant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json({ message: "Enseignant mis à jour avec succès" });
  });
};
