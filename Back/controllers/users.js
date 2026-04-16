import {db} from "../db.js";

export const getAllUsers = (req, res) => {
  const query = "SELECT id, username, email, role, image, age, telephone, genre, created_at FROM Users WHERE role = 'user' ";
  db.query(query, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    return res.status(200).json(data);
  });
};

export const getUserById = (req, res) => {
  const userId = req.params.id;
  const query = "SELECT id, username, email, role, image, age, telephone, genre, created_at FROM Users WHERE id = ?";
  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    if (data.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé." });
    return res.status(200).json(data[0]);
  });
};

export const addUser = (req, res) => {
  const { username, email, password, role, image, age, telephone, genre } = req.body;
  const query = "INSERT INTO Users (username, email, password, role, image, age, telephone, genre) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [username, email, password, role, image, age, telephone, genre], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    return res.status(201).json({ message: "Utilisateur ajouté avec succès", id: result.insertId });
  });
};

export const updateUser = (req, res) => {
  const userId = req.params.id;
  const { username, email, role, image, age, telephone, genre } = req.body;
  const query = "UPDATE Users SET username = ?, email = ?, role = ?, image = ?, age = ?, telephone = ?, genre = ? WHERE id = ?";
  db.query(query, [username, email, role, image, age, telephone, genre, userId], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    return res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
  });
};

export const deleteUser = (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM Users WHERE id = ?";
  db.query(query, [userId], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    return res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  });
};
