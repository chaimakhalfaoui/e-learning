import { db } from "../db.js";

// ✅ Récupérer tous les étudiants
export const getAllEtudiants = (req, res) => {
  const query = "SELECT id, username, email, age, telephone, genre, created_at FROM Users WHERE role = 'etudiant'";
  db.query(query, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des étudiants :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json(data);
  });
};

// ✅ Récupérer un enseignant par ID
export const getEtudiantById = (req, res) => {
  const etudiantId = req.params.id;
  const query = "SELECT id, username, email, role FROM Users WHERE id = ? AND role = 'etudiant'";
  db.query(query, [etudiantId], (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'etudiant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Etudiant introuvable" });
    }
    return res.status(200).json(data[0]); // renvoyer un objet unique
  });
};

// ✅ Ajouter un étudiant
export const addEtudiant = (req, res) => {
  const { username, email, password, age, telephone, genre } = req.body;
  const query = "INSERT INTO Users (username, email, password, role, age, telephone, genre) VALUES (?, ?, ?, 'etudiant', ?, ?, ?)";
  db.query(query, [username, email, password, age, telephone, genre], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de l'étudiant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(201).json({ message: "Étudiant ajouté avec succès", id: result.insertId });
  });
};

// ✅ Modifier un étudiant
export const updateEtudiant = (req, res) => {
  const etudiantId = req.params.id;
  const { username, email, role } = req.body;
  const query = "UPDATE Users SET username = ?, email = ?, role = ? WHERE id = ? ";
  db.query(query, [username, email, role, etudiantId], (err) => {
    if (err) {
      console.error("Erreur lors de la modification de l'étudiant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json({ message: "Étudiant mis à jour avec succès" });
  });
};

// ✅ Supprimer un étudiant
export const deleteEtudiant = (req, res) => {
  const etudiantId = req.params.id;
  const query = "DELETE FROM Users WHERE id = ? AND role = 'etudiant'";
  db.query(query, [etudiantId], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'étudiant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json({ message: "Étudiant supprimé avec succès" });
  });
};
