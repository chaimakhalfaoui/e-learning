import { db } from "../db.js";

export const getAllCoordinateurs = (req, res) => {
  // Ajout de role dans la sélection
  const query = "SELECT id, username, email, age, telephone, genre, role, created_at FROM Users WHERE role = 'coordinateur'";
  db.query(query, (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    return res.status(200).json(data);
  });
};

export const getCoordinateurById = (req, res) => {
  const coordinateurId = req.params.id;
  const query = "SELECT id, username, email, role, age, telephone, genre FROM Users WHERE id = ? AND role = 'coordinateur'";
  db.query(query, [coordinateurId], (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération du coordinateur :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Coordinateur introuvable" });
    }
    return res.status(200).json(data[0]);
  });
};

export const addCoordinateur = (req, res) => {
  const { username, email, password, age, telephone, genre } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Nom, email et mot de passe requis" });
  }
  
  const query = "INSERT INTO Users (username, email, password, role, age, telephone, genre) VALUES (?, ?, ?, 'coordinateur', ?, ?, ?)";
  db.query(query, [username, email, password, age || null, telephone || null, genre || null], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(201).json({ message: "Coordinateur ajouté avec succès", id: result.insertId });
  });
};

// ✅ CORRECTION IMPORTANTE - Mise à jour qui préserve le rôle
export const updateCoordinateur = (req, res) => {
  const { id } = req.params;
  const { username, email, age, telephone, genre } = req.body;
  
  // Récupérer le rôle actuel avant la mise à jour
  const getRoleQuery = "SELECT role FROM Users WHERE id = ?";
  db.query(getRoleQuery, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération du rôle:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Coordinateur non trouvé" });
    }
    
    const currentRole = result[0].role;
    
    // Mise à jour en conservant le rôle actuel
    const query = `UPDATE Users SET 
      username = ?, 
      email = ?, 
      age = ?, 
      telephone = ?, 
      genre = ?, 
      role = ? 
      WHERE id = ? AND role = 'coordinateur'`;
    
    db.query(query, [username, email, age || null, telephone || null, genre || null, currentRole, id], (err, updateResult) => {
      if (err) {
        console.error("Erreur lors de la mise à jour:", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Coordinateur non trouvé" });
      }
      return res.status(200).json({ message: "Coordinateur mis à jour avec succès" });
    });
  });
};

export const deleteCoordinateur = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM Users WHERE id=? AND role='coordinateur'";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Coordinateur non trouvé" });
    }
    return res.status(200).json({ message: "Coordinateur supprimé avec succès" });
  });
};