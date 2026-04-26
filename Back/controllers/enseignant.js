import { db } from "../db.js";

// ✅ Récupérer tous les enseignants
export const getAllEnseignants = (req, res) => {
  // AJOUT: inclure role dans la sélection
  const query = "SELECT id, username, email, age, telephone, genre, role, created_at FROM Users WHERE role = 'enseignant' ORDER BY created_at DESC";
  db.query(query, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des enseignants :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json(data);
  });
};

// ✅ Récupérer un enseignant par ID
export const getEnseignantById = (req, res) => {
  const enseignantId = req.params.id;
  // AJOUT: inclure age, telephone, genre
  const query = "SELECT id, username, email, role, age, telephone, genre FROM Users WHERE id = ? AND role = 'enseignant'";
  db.query(query, [enseignantId], (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'enseignant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Enseignant introuvable" });
    }
    return res.status(200).json(data[0]);
  });
};

// ✅ Ajouter un enseignant
export const addEnseignant = (req, res) => {
  const { username, email, password, age, telephone, genre } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Nom, email et mot de passe requis" });
  }
  
  const query = "INSERT INTO Users (username, email, password, role, age, telephone, genre) VALUES (?, ?, ?, 'enseignant', ?, ?, ?)";
  db.query(query, [username, email, password, age || null, telephone || null, genre || null], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de l'enseignant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(201).json({ message: "Enseignant ajouté avec succès", id: result.insertId });
  });
};

// ✅ CORRIGÉ: Modifier un enseignant en préservant le rôle
export const updateEnseignant = (req, res) => {
  const enseignantId = req.params.id;
  const { username, email, age, telephone, genre } = req.body;
  
  // D'abord, récupérer le rôle actuel de l'enseignant
  const getRoleQuery = "SELECT role FROM Users WHERE id = ?";
  db.query(getRoleQuery, [enseignantId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération du rôle:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Enseignant non trouvé" });
    }
    
    const currentRole = result[0].role;
    
    // Mise à jour en conservant le rôle actuel et tous les champs
    const query = `UPDATE Users SET 
      username = ?, 
      email = ?, 
      age = ?, 
      telephone = ?, 
      genre = ?, 
      role = ? 
      WHERE id = ? AND role = 'enseignant'`;
    
    db.query(query, [username, email, age || null, telephone || null, genre || null, currentRole, enseignantId], (err, updateResult) => {
      if (err) {
        console.error("Erreur lors de la modification de l'enseignant :", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Enseignant non trouvé" });
      }
      return res.status(200).json({ message: "Enseignant mis à jour avec succès" });
    });
  });
};

// ✅ Supprimer un enseignant
export const deleteEnseignant = (req, res) => {
  const enseignantId = req.params.id;
  const query = "DELETE FROM Users WHERE id = ? AND role = 'enseignant'";
  db.query(query, [enseignantId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'enseignant :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Enseignant non trouvé" });
    }
    return res.status(200).json({ message: "Enseignant supprimé avec succès" });
  });
};