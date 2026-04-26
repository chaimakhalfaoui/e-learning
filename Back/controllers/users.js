import { db } from "../db.js";

// ✅ Récupérer tous les utilisateurs (sans filtre)
export const getAllUsers = (req, res) => {
  const query = "SELECT id, username, email, role, image, age, telephone, genre, created_at FROM Users ORDER BY created_at DESC";
  db.query(query, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json(data);
  });
};

// ✅ Récupérer un utilisateur par ID
export const getUserById = (req, res) => {
  const userId = req.params.id;
  const query = "SELECT id, username, email, role, image, age, telephone, genre, created_at FROM Users WHERE id = ?";
  db.query(query, [userId], (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'utilisateur :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }
    return res.status(200).json(data[0]);
  });
};

// ✅ Récupérer les utilisateurs par rôle
export const getUsersByRole = (req, res) => {
  const { role } = req.params;
  const validRoles = ['coordinateur', 'etudiant', 'enseignant'];
  
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Rôle invalide. Les rôles acceptés sont: coordinateur, etudiant, enseignant" });
  }
  
  const query = "SELECT id, username, email, role, image, age, telephone, genre, created_at FROM Users WHERE role = ? ORDER BY created_at DESC";
  db.query(query, [role], (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json(data);
  });
};

// ✅ Ajouter un utilisateur
export const addUser = (req, res) => {
  const { username, email, password, role, image, age, telephone, genre } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Nom d'utilisateur, email et mot de passe sont requis" });
  }
  
  const validRoles = ['coordinateur', 'etudiant', 'enseignant'];
  const userRole = validRoles.includes(role) ? role : 'etudiant';
  
  const query = "INSERT INTO Users (username, email, password, role, image, age, telephone, genre) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [username, email, password, userRole, image || null, age || null, telephone || null, genre || null], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de l'utilisateur :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(201).json({ message: "Utilisateur ajouté avec succès", id: result.insertId });
  });
};

// ✅ CORRIGÉ: Mettre à jour un utilisateur en préservant le rôle
export const updateUser = (req, res) => {
  const userId = req.params.id;
  const { username, email, role, image, age, telephone, genre } = req.body;
  
  // Si un rôle est fourni, le valider
  if (role) {
    const validRoles = ['coordinateur', 'etudiant', 'enseignant'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Rôle invalide" });
    }
  }
  
  // Récupérer le rôle actuel si non fourni
  if (!role) {
    const getRoleQuery = "SELECT role FROM Users WHERE id = ?";
    db.query(getRoleQuery, [userId], (err, roleData) => {
      if (err) {
        console.error("Erreur lors de la récupération du rôle:", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }
      
      if (roleData.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      const currentRole = roleData[0].role;
      
      const query = `UPDATE Users SET 
        username = ?, 
        email = ?, 
        role = ?, 
        image = ?, 
        age = ?, 
        telephone = ?, 
        genre = ? 
        WHERE id = ?`;
      
      db.query(query, [username, email, currentRole, image || null, age || null, telephone || null, genre || null, userId], (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
          return res.status(500).json({ error: "Erreur serveur." });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        return res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
      });
    });
  } else {
    // Un rôle a été fourni, on l'utilise
    const query = `UPDATE Users SET 
      username = ?, 
      email = ?, 
      role = ?, 
      image = ?, 
      age = ?, 
      telephone = ?, 
      genre = ? 
      WHERE id = ?`;
    
    db.query(query, [username, email, role, image || null, age || null, telephone || null, genre || null, userId], (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      return res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
    });
  }
};

// ✅ Version simplifiée de updateUser (alternative plus propre)
export const updateUserSimple = (req, res) => {
  const userId = req.params.id;
  const { username, email, role, image, age, telephone, genre } = req.body;
  
  // Récupérer d'abord le rôle actuel
  const getCurrentQuery = "SELECT role FROM Users WHERE id = ?";
  db.query(getCurrentQuery, [userId], (err, currentData) => {
    if (err) {
      console.error("Erreur lors de la récupération:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    
    if (currentData.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    
    // Utiliser le rôle existant si non fourni
    const finalRole = role || currentData[0].role;
    
    // Valider le rôle s'il a été fourni
    if (role) {
      const validRoles = ['coordinateur', 'etudiant', 'enseignant'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Rôle invalide" });
      }
    }
    
    const query = `UPDATE Users SET 
      username = ?, 
      email = ?, 
      role = ?, 
      image = ?, 
      age = ?, 
      telephone = ?, 
      genre = ? 
      WHERE id = ?`;
    
    db.query(query, [username, email, finalRole, image || null, age || null, telephone || null, genre || null, userId], (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour:", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      return res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
    });
  });
};

// ✅ Mettre à jour uniquement le rôle
export const updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const validRoles = ['coordinateur', 'etudiant', 'enseignant'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Rôle invalide" });
  }
  
  const checkQuery = "SELECT id, username, role FROM Users WHERE id = ?";
  db.query(checkQuery, [id], (checkErr, checkData) => {
    if (checkErr) {
      console.error("Erreur lors de la vérification :", checkErr);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    
    if (checkData.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    
    const updateQuery = "UPDATE Users SET role = ? WHERE id = ?";
    db.query(updateQuery, [role, id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Erreur lors de la mise à jour du rôle :", updateErr);
        return res.status(500).json({ error: "Erreur serveur." });
      }
      
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      return res.status(200).json({ 
        message: "Rôle mis à jour avec succès",
        userId: id,
        username: checkData[0].username,
        ancienRole: checkData[0].role,
        nouveauRole: role
      });
    });
  });
};

// ✅ Supprimer un utilisateur
export const deleteUser = (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM Users WHERE id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'utilisateur :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    return res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  });
};