// controllers/activit.js
import { db } from "../db.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Créer les dossiers s'ils n'existent pas
const uploadDir = 'uploads/';
const uploadVideoDir = 'uploads/videos/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(uploadVideoDir)) {
    fs.mkdirSync(uploadVideoDir, { recursive: true });
}

// Définir le stockage pour multer (fichiers)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    cb(null, uniqueSuffix + '-' + file.originalname);
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

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Stockage pour les fichiers de devoir (PDF, Word, PowerPoint)
const devoirStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/devoirs/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const devoirFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format de fichier non supporté. Utilisez PDF, Word ou PowerPoint."), false);
  }
};

const uploadDevoir = multer({ 
  storage: devoirStorage, 
  fileFilter: devoirFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// Stockage pour vidéos
const storagev = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilterv = (req, file, cb) => {
  if (file.mimetype === 'video/mp4' || file.mimetype === 'video/mpeg' || file.mimetype === 'video/quicktime') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadv = multer({ storage: storagev, fileFilter: fileFilterv, limits: { fileSize: 500 * 1024 * 1024 } });

// ==================== CRÉATION DES ACTIVITÉS ====================

// Créer une activité de type TEXTE
export const createActivite = (req, res) => {
  const { titre, categorie, contenu, duration, id_chapitre } = req.body;

  if (!titre || !categorie || !contenu || !duration || !id_chapitre) {
    return res.status(400).json("Tous les champs sont requis.");
  }

  const insertActiviteQuery = "INSERT INTO activite (titre, categorie, contenu, duration, id_chapitre) VALUES (?, ?, ?, ?, ?)";
  const values = [titre, categorie, contenu, duration, id_chapitre];

  db.query(insertActiviteQuery, values, (err, data) => {
    if (err) {
      console.error("Erreur création activité:", err);
      return res.status(500).json("Erreur lors de la création de l'activité.");
    }
    return res.status(200).json({ message: "Activité créée avec succès.", id: data.insertId });
  });
};

// Créer une activité de type IMAGE
export const createActivitei = (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error("Erreur Multer:", err);
      return res.status(500).json("Erreur lors du téléchargement de l'image.");
    }

    const { titre, categorie, id_chapitre, duration } = req.body;
    const imageName = req.file?.filename;

    if (!titre || !categorie || !id_chapitre || !imageName || !duration) {
      return res.status(400).json("Tous les champs sont requis.");
    }

    const insertCoursQuery = "INSERT INTO activite (titre, categorie, contenu, duration, id_chapitre) VALUES (?, ?, ?, ?, ?)";
    const values = [titre, categorie, imageName, duration, id_chapitre];

    db.query(insertCoursQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur création activité image:", err);
        return res.status(500).json("Erreur lors de la création.");
      }
      return res.status(200).json({ message: "Activité image créée avec succès.", id: data.insertId });
    });
  });
};

// Créer une activité de type VIDÉO
export const createActivitev = (req, res) => {
  uploadv.single('video')(req, res, function (err) {
    if (err) {
      console.error("Erreur Multer:", err);
      return res.status(500).json("Erreur lors du téléchargement de la vidéo.");
    }

    const { titre, categorie, id_chapitre, duration } = req.body;
    const videoName = req.file?.filename;

    if (!titre || !categorie || !id_chapitre || !videoName || !duration) {
      return res.status(400).json("Tous les champs sont requis.");
    }

    const insertCoursQuery = "INSERT INTO activite (titre, categorie, contenu, duration, id_chapitre) VALUES (?, ?, ?, ?, ?)";
    const values = [titre, categorie, videoName, duration, id_chapitre];

    db.query(insertCoursQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur création activité vidéo:", err);
        return res.status(500).json("Erreur lors de la création.");
      }
      return res.status(200).json({ message: "Activité vidéo créée avec succès.", id: data.insertId });
    });
  });
};

// ==================== NOUVEAUX TYPES D'ACTIVITÉS ====================

// Créer un QUESTIONNAIRE
export const createQuestionnaire = (req, res) => {
  const { titre, description, questions, id_chapitre } = req.body;

  if (!titre || !id_chapitre || !questions || !Array.isArray(questions)) {
    return res.status(400).json("Titre, chapitre et questions sont requis.");
  }

  const questionsJSON = JSON.stringify(questions);
  
  const insertQuery = "INSERT INTO activite (titre, categorie, contenu, id_chapitre) VALUES (?, ?, ?, ?)";
  const values = [titre, 'questionnaire', questionsJSON, id_chapitre];

  db.query(insertQuery, values, (err, data) => {
    if (err) {
      console.error("Erreur création questionnaire:", err);
      return res.status(500).json("Erreur lors de la création du questionnaire.");
    }
    return res.status(200).json({ message: "Questionnaire créé avec succès.", id: data.insertId });
  });
};

// Créer un DEVOIR - UNIQUEMENT Titre, Fichier et Date de rendu
export const createDevoir = (req, res) => {
  uploadDevoir.single('fichier')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Erreur Multer:", err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(500).json("Le fichier est trop volumineux. Maximum 50MB.");
      }
      return res.status(500).json("Erreur lors du téléchargement du fichier.");
    } else if (err) {
      console.error("Erreur:", err);
      return res.status(500).json(err.message);
    }

    const { titre, date_limite, id_chapitre } = req.body;
    const fichier = req.file?.filename;
    const type_fichier = req.body.type_fichier || 'other';

    if (!titre || !id_chapitre || !fichier) {
      return res.status(400).json("Titre, fichier et chapitre sont requis.");
    }

    const devoirData = JSON.stringify({
      fichier: fichier,
      type_fichier: type_fichier,
      date_limite: date_limite || null
    });
    
    const insertQuery = "INSERT INTO activite (titre, categorie, contenu, id_chapitre) VALUES (?, ?, ?, ?)";
    const values = [titre, 'devoir', devoirData, id_chapitre];

    db.query(insertQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur création devoir:", err);
        return res.status(500).json("Erreur lors de la création du devoir.");
      }
      return res.status(200).json({ message: "Devoir créé avec succès.", id: data.insertId });
    });
  });
};

// Créer une VIDÉO INTERACTIVE
export const createVideoInteractive = (req, res) => {
  uploadv.single('video')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Erreur Multer:", err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(500).json("La vidéo est trop volumineuse. Maximum 500MB.");
      }
      return res.status(500).json("Erreur lors du téléchargement de la vidéo.");
    } else if (err) {
      console.error("Erreur:", err);
      return res.status(500).json(err.message);
    }

    const { titre, id_chapitre, questions_interactives } = req.body;
    const videoName = req.file?.filename;

    if (!titre || !id_chapitre || !videoName) {
      return res.status(400).json("Titre, vidéo et chapitre sont requis.");
    }

    const videoData = JSON.stringify({
      video: videoName,
      questions: questions_interactives ? JSON.parse(questions_interactives) : []
    });
    
    const insertQuery = "INSERT INTO activite (titre, categorie, contenu, id_chapitre) VALUES (?, ?, ?, ?)";
    const values = [titre, 'video_interactive', videoData, id_chapitre];

    db.query(insertQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur création vidéo interactive:", err);
        return res.status(500).json("Erreur lors de la création.");
      }
      return res.status(200).json({ message: "Vidéo interactive créée avec succès.", id: data.insertId });
    });
  });
};

// Télécharger un fichier de devoir
export const getDevoirFichier = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join('uploads/devoirs/', filename);
  
  if (fs.existsSync(filePath)) {
    return res.download(filePath);
  } else {
    return res.status(404).json({ error: "Fichier non trouvé." });
  }
};

// ==================== RÉCUPÉRATION ====================

export const getAllActiviteId = (req, res) => {
  const id_chapitre = req.params.id;
  const selectActiviteQuery = "SELECT * FROM activite WHERE id_chapitre = ? ORDER BY id ASC";

  db.query(selectActiviteQuery, [id_chapitre], (err, data) => {
    if (err) {
      console.error("Error retrieving activite:", err);
      return res.status(500).json("An error occurred.");
    }
    return res.status(200).json(data);
  });
};

export const getActivite = (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: "L'ID de l'activité est requis." });
  }
  
  const query = `
    SELECT a.*, c.id_chapitre, c.nom_chapitre
    FROM activite a
    LEFT JOIN chapitre c ON a.id_chapitre = c.id_chapitre
    WHERE a.id = ?
  `;
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur getActivite:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Activité non trouvée." });
    }
    
    const activite = result[0];
    if (activite.categorie === 'questionnaire' || activite.categorie === 'devoir' || activite.categorie === 'video_interactive') {
      try {
        activite.contenu_parsed = JSON.parse(activite.contenu);
      } catch (e) {
        activite.contenu_parsed = activite.contenu;
      }
    }
    
    return res.status(200).json(activite);
  });
};

export const getActivitesByChapitre = (req, res) => {
  const { chapitreId } = req.params;
  
  if (!chapitreId) {
    return res.status(400).json({ error: "L'ID du chapitre est requis." });
  }
  
  const query = "SELECT * FROM activite WHERE id_chapitre = ? ORDER BY id ASC";
  
  db.query(query, [chapitreId], (err, results) => {
    if (err) {
      console.error("Erreur getActivitesByChapitre:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    
    return res.status(200).json(results);
  });
};

// ==================== SUPPRESSION ====================

export const deleteActivite = (req, res) => {
  const id_activite = req.params.id;
  
  // Récupérer le fichier associé avant suppression
  const getFileQuery = "SELECT categorie, contenu FROM activite WHERE id = ?";
  db.query(getFileQuery, [id_activite], (err, result) => {
    if (err) {
      console.error("Erreur récupération:", err);
      return res.status(500).json("Erreur lors de la suppression.");
    }
    
    if (result.length > 0) {
      const activite = result[0];
      // Supprimer le fichier physique si c'est un devoir
      if (activite.categorie === 'devoir') {
        try {
          const devoirData = JSON.parse(activite.contenu);
          if (devoirData.fichier) {
            const filePath = path.join('uploads/devoirs/', devoirData.fichier);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        } catch (e) {
          console.error("Erreur suppression fichier:", e);
        }
      }
    }
    
    const deleteActiviteQuery = "DELETE FROM activite WHERE id = ?";
    db.query(deleteActiviteQuery, [id_activite], (err, deleteResult) => {
      if (err) {
        console.error("Erreur suppression:", err);
        return res.status(500).json("Erreur lors de la suppression.");
      }
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json("Aucune activité trouvée.");
      }
      return res.status(200).json({ message: "Activité supprimée avec succès." });
    });
  });
};

// ==================== MISES À JOUR ====================

export const updateActiviteText = (req, res) => {
  const id_activite = req.params.id;
  const { titre, categorie, contenu, duration, id_chapitre } = req.body;

  if (!titre || !categorie || !contenu || !duration || !id_chapitre) {
    return res.status(400).json("Tous les champs sont requis.");
  }

  const updateQuery = "UPDATE activite SET titre = ?, categorie = ?, contenu = ?, duration = ?, id_chapitre = ? WHERE id = ?";
  const values = [titre, categorie, contenu, duration, id_chapitre, id_activite];

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error("Erreur mise à jour:", err);
      return res.status(500).json("Erreur lors de la mise à jour.");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json("Aucune activité trouvée.");
    }
    return res.status(200).json({ message: "Activité mise à jour avec succès." });
  });
};

export const updateActiviteI = (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error("Erreur Multer:", err);
      return res.status(500).json("Erreur lors du téléchargement.");
    }

    const id = req.params.id;
    const { titre, categorie, id_chapitre, duration } = req.body;

    if (!id || !titre || !categorie || !id_chapitre || !duration) {
      return res.status(400).json("Tous les champs sont requis.");
    }

    let updateQuery;
    let values;

    if (req.file) {
      const imageName = req.file.filename;
      updateQuery = "UPDATE activite SET titre = ?, categorie = ?, contenu = ?, duration = ?, id_chapitre = ? WHERE id = ?";
      values = [titre, categorie, imageName, duration, id_chapitre, id];
    } else {
      updateQuery = "UPDATE activite SET titre = ?, categorie = ?, duration = ?, id_chapitre = ? WHERE id = ?";
      values = [titre, categorie, duration, id_chapitre, id];
    }

    db.query(updateQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur mise à jour:", err);
        return res.status(500).json("Erreur lors de la mise à jour.");
      }
      if (data.affectedRows === 0) {
        return res.status(404).json("L'activité n'existe pas.");
      }
      return res.status(200).json("Activité mise à jour avec succès.");
    });
  });
};

export const updateActiviteVideo = (req, res) => {
  uploadv.single('video')(req, res, function (err) {
    if (err) {
      console.error("Erreur Multer:", err);
      return res.status(500).json("Erreur lors du téléchargement.");
    }

    const id_activite = req.params.id;
    const { titre, categorie, id_chapitre, duration } = req.body;

    if (!id_activite || !titre || !categorie || !id_chapitre || !duration) {
      return res.status(400).json("Tous les champs sont requis.");
    }

    let updateQuery;
    let values;

    if (req.file) {
      const videoName = req.file.filename;
      updateQuery = "UPDATE activite SET titre = ?, categorie = ?, contenu = ?, duration = ?, id_chapitre = ? WHERE id = ?";
      values = [titre, categorie, videoName, duration, id_chapitre, id_activite];
    } else {
      updateQuery = "UPDATE activite SET titre = ?, categorie = ?, duration = ?, id_chapitre = ? WHERE id = ?";
      values = [titre, categorie, duration, id_chapitre, id_activite];
    }

    db.query(updateQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur mise à jour:", err);
        return res.status(500).json("Erreur lors de la mise à jour.");
      }
      if (data.affectedRows === 0) {
        return res.status(404).json("L'activité n'existe pas.");
      }
      return res.status(200).json("Activité mise à jour avec succès.");
    });
  });
};