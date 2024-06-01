import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

export const register = (req, res) => {
  // Vérifier si l'utilisateur existe déjà
  const checkExistingUserQuery = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(checkExistingUserQuery, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    // Hacher le mot de passe et créer un utilisateur
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const insertUserQuery = "INSERT INTO users(username, email, password, role) VALUES (?, ?, ?, ?)";
    const values = [req.body.username, req.body.email, hash, req.body.role || 'user']; 

    db.query(insertUserQuery, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

export const login = (req, res) => {
  // Vérifier si l'utilisateur existe dans la table des utilisateurs
  const checkUserQuery = "SELECT * FROM users WHERE email = ? ";

  db.query(checkUserQuery, [req.body.email], (err, userData) => {
    if (err) return res.status(500).json({ message: "Database query error", error: err });
    
    // Si l'utilisateur n'est pas trouvé dans la table des utilisateurs, rechercher dans la table des administrateurs
    if (userData.length === 0) {
      const checkAdminQuery = "SELECT * FROM admins WHERE email = ? ";
      db.query(checkAdminQuery, [req.body.email], (err, adminData) => {
        if (err) return res.status(500).json({ message: "Database query error", error: err });
        
        // Si l'administrateur n'est pas trouvé non plus, renvoyer une erreur
        if (adminData.length === 0) return res.status(404).json({ message: "Email not found!" });
        
        // Sinon, l'utilisateur est un administrateur, traiter la connexion de la même manière que pour un utilisateur normal
        processLogin(adminData[0], req, res);
      });
    } else {
      // Sinon, l'utilisateur est trouvé dans la table des utilisateurs, traiter la connexion normalement
      processLogin(userData[0], req, res);
    }
  });
};

// Fonction pour traiter la connexion une fois que l'utilisateur est trouvé
const processLogin = (userData, req, res) => {
  // Vérifier le mot de passe
  const isPasswordCorrect = bcrypt.compareSync(req.body.password, userData.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Incorrect password!" });
  }

  // Générer le token JWT avec le rôle inclus
  const token = jwt.sign(
    { id: userData.id, role: userData.role, name: userData.username },
    "jwtkey"
  );

  // Retirer le mot de passe de la réponse
  const { password, ...other } = userData;

  // Envoyer le token JWT et les informations de l'utilisateur (à l'exception du mot de passe)
  res
    .cookie("access_token", token, {
      httpOnly: true,
    })
    .status(200)
    .json({ token, ...other });
};

export const logout = (req, res) => {
  // Déconnexion de l'utilisateur et suppression du cookie du token
  res.clearCookie("access_token").status(200).json("User has been logged out.");
};

export const checkUserRole = (req, res) => {
  const userId = req.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête

  // Requête pour récupérer le rôle de l'utilisateur à partir de son ID
  const selectUserRoleQuery = "SELECT role FROM users WHERE id = ?";

  db.query(selectUserRoleQuery, userId, (err, data) => {
      if (err) {
          console.error("Erreur lors de la récupération du rôle de l'utilisateur :", err);
          return res.status(500).json("Une erreur s'est produite lors de la récupération du rôle de l'utilisateur.");
      }

      if (data.length === 0) {
          return res.status(404).json("Utilisateur non trouvé.");
      }

      const userRole = data[0].role; // Récupérer le rôle de l'utilisateur à partir des résultats de la requête

      // Retourner le rôle de l'utilisateur dans la réponse
      return res.status(200).json({ role: userRole });
  });
};

export const checkUserRoleA = (req, res) => {
  const userId = req.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête

  // Requête pour récupérer le rôle de l'utilisateur à partir de son ID
  const selectUserRoleQuery = "SELECT role FROM admins WHERE id = ?";

  db.query(selectUserRoleQuery, userId, (err, data) => {
      if (err) {
          console.error("Erreur lors de la récupération du rôle de l'admin :", err);
          return res.status(500).json("Une erreur s'est produite lors de la récupération du rôle de l'admin.");
      }

      if (data.length === 0) {
          return res.status(404).json("Utilisateur non trouvé.");
      }

      const userRole = data[0].role; // Récupérer le rôle de l'utilisateur à partir des résultats de la requête

      // Retourner le rôle de l'utilisateur dans la réponse
      return res.status(200).json({ role: userRole });
  });
};

export const countUsers = (req, res) => {
  // Requête pour compter les utilisateurs ayant le rôle 'user'
  const countUsersQuery = "SELECT COUNT(*) as userCount FROM users WHERE role = 'user'";

  db.query(countUsersQuery, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération du nombre d'utilisateurs :", err);
      return res.status(500).json("Une erreur s'est produite lors de la récupération du nombre d'utilisateurs.");
    }

    const userCount = data[0].userCount; // Récupérer le nombre d'utilisateurs à partir des résultats de la requête

    // Retourner le nombre d'utilisateurs dans la réponse
    return res.status(200).json({ userCount });
  });
};

export const getLatestTeachers = (req, res) => {
  // Requête pour obtenir les 6 derniers utilisateurs ayant le rôle 'enseignant'
  const latestTeachersQuery = "SELECT * FROM users WHERE role = 'enseignant' ORDER BY id DESC LIMIT 6";

  db.query(latestTeachersQuery, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des derniers enseignants :", err);
      return res.status(500).json("Une erreur s'est produite lors de la récupération des derniers enseignants.");
    }

    // Retourner les derniers enseignants dans la réponse
    return res.status(200).json(data);
  });
};


export const getUserById = (req, res) => {
  const userId = req.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête

  // Requête pour récupérer les informations de l'utilisateur à partir de son ID
  const selectUserQuery = "SELECT id, username, email, image, age, telephone, genre FROM users WHERE id = ?";

  db.query(selectUserQuery, userId, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des informations de l'utilisateur :", err);
      return res.status(500).json("Une erreur s'est produite lors de la récupération des informations de l'utilisateur.");
    }

    if (data.length === 0) {
      return res.status(404).json("Utilisateur non trouvé.");
    }

    const userData = data[0]; // Récupérer les informations de l'utilisateur à partir des résultats de la requête

    // Retourner les informations de l'utilisateur dans la réponse
    return res.status(200).json(userData);
  });
};

export const getAdminById = (req, res) => {
  const userId = req.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête

  // Requête pour récupérer les informations de l'utilisateur à partir de son ID
  const selectUserQuery = "SELECT id, username, email  FROM admins WHERE id = ?";

  db.query(selectUserQuery, userId, (err, data) => {
    if (err) {
      console.error("Erreur lors de la récupération des informations de l'utilisateur :", err);
      return res.status(500).json("Une erreur s'est produite lors de la récupération des informations de l'utilisateur.");
    }

    if (data.length === 0) {
      return res.status(404).json("Utilisateur non trouvé.");
    }

    const userData = data[0]; // Récupérer les informations de l'utilisateur à partir des résultats de la requête

    // Retourner les informations de l'utilisateur dans la réponse
    return res.status(200).json(userData);
  });
};

export const updateAdminById = (req, res) => {
  const userId = req.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête
  const { username, email } = req.body; // Récupérer les nouvelles valeurs de l'utilisateur à partir du corps de la requête

  // Requête pour mettre à jour les informations de l'utilisateur
  const updateUserQuery = "UPDATE admins SET username = ?, email = ? WHERE id = ?";

  db.query(updateUserQuery, [username, email, userId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour des informations de l'utilisateur :", err);
      return res.status(500).json("Une erreur s'est produite lors de la mise à jour des informations de l'utilisateur.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json("Utilisateur non trouvé.");
    }

    // Retourner un message de succès dans la réponse
    return res.status(200).json("Informations de l'utilisateur mises à jour avec succès.");
  });
};

// Définir le stockage pour multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Répertoire où enregistrer les fichiers
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4(); // Générer un UUID unique
    cb(null, uniqueSuffix + '-' + file.originalname); // Nom du fichier unique
  }
});

// Vérifier le type de fichier pour l'image
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Configurer multer avec le stockage et le filtre
const upload = multer({ storage: storage, fileFilter: fileFilter });

export const updateprofil = (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Erreur Multer :", err);
      return res.status(500).json("Une erreur s'est produite lors du téléchargement de l'image.");
    } else if (err) {
      console.error("Erreur inattendue lors du téléchargement de l'image :", err);
      return res.status(500).json("Une erreur inattendue s'est produite lors du téléchargement de l'image.");
    }

    const id = req.params.id;
    const { username, age, genre, email, telephone } = req.body;

    if (!id || !username || !age || !genre || !email || !telephone) {
      return res.status(400).json("Tous les champs sont requis.");
    }

    let updateUserQuery;
    let values;

    if (req.file) {
      const imageName = req.file.filename;
      updateUserQuery = "UPDATE users SET username = ?, age = ?, genre = ?, email = ?, telephone = ?, image = ? WHERE id = ?";
      values = [username, age, genre, email, telephone, imageName, id];
    } else {
      updateUserQuery = "UPDATE users SET username = ?, age = ?, genre = ?, email = ?, telephone = ? WHERE id = ?";
      values = [username, age, genre, email, telephone, id];
    }

    db.query(updateUserQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du profil utilisateur :", err);
        return res.status(500).json("Une erreur s'est produite lors de la mise à jour du profil utilisateur.");
      }

      if (data.affectedRows === 0) {
        return res.status(404).json("L'utilisateur n'existe pas.");
      }

      return res.status(200).json("Profil utilisateur mis à jour avec succès.");
    });
  });
};



export const getStatistics = (req, res) => {
  const userCountQuery = "SELECT COUNT(*) as count FROM users WHERE role = ?";
  const courseCountQuery = "SELECT COUNT(*) as count FROM cours";

  let stats = {
    userCount: 0,
    teacherCount: 0,
    courseCount: 0,
  };

  db.query(userCountQuery, ['user'], (err, userResult) => {
    if (err) {
      console.error("Erreur lors de la récupération du nombre d'utilisateurs :", err);
      return res.status(500).json("Une erreur s'est produite lors de la récupération du nombre d'utilisateurs.");
    }
    stats.userCount = userResult[0].count;

    db.query(userCountQuery, ['enseignant'], (err, teacherResult) => {
      if (err) {
        console.error("Erreur lors de la récupération du nombre d'enseignants :", err);
        return res.status(500).json("Une erreur s'est produite lors de la récupération du nombre d'enseignants.");
      }
      stats.teacherCount = teacherResult[0].count;

      db.query(courseCountQuery, (err, courseResult) => {
        if (err) {
          console.error("Erreur lors de la récupération du nombre de cours :", err);
          return res.status(500).json("Une erreur s'est produite lors de la récupération du nombre de cours.");
        }
        stats.courseCount = courseResult[0].count;

        return res.status(200).json(stats);
      });
    });
  });
};