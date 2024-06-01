import { db } from "../db.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

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

export const createActivitei = (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer :", err);
            return res.status(500).json("Une erreur s'est produite lors du téléchargement de l'image.");
        } else if (err) {
            console.error("Erreur inattendue lors du téléchargement de l'image :", err);
            return res.status(500).json("Une erreur inattendue s'est produite lors du téléchargement de l'image.");
        }

        const { titre, categorie,id_chapitre,duration  } = req.body;
        const imageName = req.file.filename; // Nom de l'image téléchargée

        if (  !titre || !categorie  || !id_chapitre || !imageName||!duration) {
            return res.status(400).json("Tous les champs sont requis.");
        }

        const insertCoursQuery = "INSERT INTO activite (titre, categorie, contenu,duration, id_chapitre) VALUES (?,?, ?, ?, ?)";
        const values = [titre, categorie, imageName,duration, id_chapitre ];

        db.query(insertCoursQuery, values, (err, data) => {
            if (err) {
                console.error("Erreur lors de la création du Activité :", err);
                return res.status(500).json("Une erreur s'est produite lors de la création du Activité.");
            }
            return res.status(200).json("L'Activité a été créé avec succès.");
        });
    });
};










export const createActivite = (req, res) => {
    const { titre, categorie,contenu,duration,id_chapitre } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!titre || !categorie || !contenu ||!duration|| !id_chapitre) {
        return res.status(400).json("Tous les champs sont requis.");
    }

    // Insérer le chapitre dans la base de données
    const insertActiviteQuery = "INSERT INTO activite (titre, categorie, contenu, duration,id_chapitre) VALUES (?, ?, ?, ?,?)";
    const values = [titre, categorie, contenu,duration, id_chapitre];

    db.query(insertActiviteQuery, values, (err, data) => {
        if (err) {
            console.error("Erreur lors de la création du activite :", err);
            return res.status(500).json("Une erreur s'est produite lors de la création du chapitre.");
        }
        return res.status(200).json("Le activite a été créé avec succès.");
    });
};





const storagev = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/videos/'); // Répertoire où enregistrer les vidéos
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + uuidv4(); // Générer un UUID unique
      cb(null, uniqueSuffix + '-' + file.originalname); // Nom de fichier vidéo unique
    }
  });
  
  // Vérifier le type de fichier pour la vidéo
  const fileFilterv = (req, file, cb) => {
    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/mpeg' || file.mimetype === 'video/quicktime') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  // Configurer multer avec le stockage et le filtre pour les vidéos
  const uploadv = multer({ storage: storagev, fileFilter: fileFilterv });
  
  export const createActivitev = (req, res) => {
      uploadv.single('video')(req, res, function (err) {
          if (err instanceof multer.MulterError) {
              console.error("Erreur Multer :", err);
              return res.status(500).json("Une erreur s'est produite lors du téléchargement de la vidéo.");
          } else if (err) {
              console.error("Erreur inattendue lors du téléchargement de la vidéo :", err);
              return res.status(500).json("Une erreur inattendue s'est produite lors du téléchargement de la vidéo.");
          }
  
          const { titre, categorie, id_chapitre, duration } = req.body;
          const videoName = req.file.filename; // Nom de la vidéo téléchargée
  
          if (!titre || !categorie || !id_chapitre || !videoName || !duration) {
              return res.status(400).json("Tous les champs sont requis.");
          }
  
          const insertCoursQuery = "INSERT INTO activite (titre, categorie, contenu, duration, id_chapitre) VALUES (?, ?, ?,? , ?)";
          const values = [titre, categorie, videoName,duration, id_chapitre];
  
          db.query(insertCoursQuery, values, (err, data) => {
              if (err) {
                  console.error("Erreur lors de la création de l'activité :", err);
                  return res.status(500).json("Une erreur s'est produite lors de la création de l'activité.");
              }
              return res.status(200).json("L'activité a été créée avec succès.");
          });
      });
  };

  export const getAllActiviteId = (req, res) => {
    const id_chapitre = req.params.id;

    const selectActiviteQuery = "SELECT * FROM activite WHERE id_chapitre = ?";

    db.query(selectActiviteQuery, [id_chapitre], (err, data) => {
        if (err) {
            console.error("Error retrieving activite for chapitre:", err);
            return res.status(500).json("An error occurred while retrieving activite for chapitre.");
        }

        return res.status(200).json(data);
    });
};


export const deleteActivite = (req, res) => {
  const id_activite = req.params.id;

  // Requête SQL pour supprimer l'activité en fonction de son ID
  const deleteActiviteQuery = "DELETE FROM activite WHERE id = ?";

  db.query(deleteActiviteQuery, [id_activite], (err, result) => {
      if (err) {
          console.error("Erreur lors de la suppression de l'activité :", err);
          return res.status(500).json("Une erreur s'est produite lors de la suppression de l'activité.");
      }

      // Vérifier si une activité a été supprimée
      if (result.affectedRows === 0) {
          return res.status(404).json("Aucune activité trouvée avec cet ID.");
      }

      return res.status(200).json({ message: "L'activité a été supprimée avec succès." });
  });
};


export const updateActiviteText = (req, res) => {
  const id_activite = req.params.id;
  const { titre, categorie, contenu, duration, id_chapitre } = req.body;

  // Vérifier si tous les champs requis sont fournis
  if (!titre || !categorie || !contenu || !duration || !id_chapitre) {
      return res.status(400).json("Tous les champs sont requis pour mettre à jour l'activité avec du texte.");
  }

  // Requête SQL pour mettre à jour l'activité avec du texte en fonction de son ID
  const updateActiviteTextQuery = "UPDATE activite SET titre = ?, categorie = ?, contenu = ?, duration = ?, id_chapitre = ? WHERE id = ?";
  const values = [titre, categorie, contenu, duration, id_chapitre, id_activite];

  db.query(updateActiviteTextQuery, values, (err, result) => {
      if (err) {
          console.error("Erreur lors de la mise à jour de l'activité avec du texte :", err);
          return res.status(500).json("Une erreur s'est produite lors de la mise à jour de l'activité avec du texte.");
      }

      // Vérifier si une activité a été mise à jour
      if (result.affectedRows === 0) {
          return res.status(404).json("Aucune activité trouvée avec cet ID.");
      }

      return res.status(200).json({ message: "L'activité a été mise à jour avec du texte avec succès." });
  });
};










export const updateActiviteVideo = (req, res) => {
  // Vérifier si une nouvelle vidéo a été téléchargée
  uploadv.single('video')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Erreur Multer :", err);
      return res.status(500).json("Une erreur s'est produite lors du téléchargement de la vidéo.");
    } else if (err) {
      console.error("Erreur inattendue lors du téléchargement de la vidéo :", err);
      return res.status(500).json("Une erreur inattendue s'est produite lors du téléchargement de la vidéo.");
    }

    const id_activite = req.params.id;
    const { titre, categorie, id_chapitre, duration } = req.body;

    if (!id_activite || !titre || !categorie || !id_chapitre || !duration) {
      return res.status(400).json("Tous les champs sont requis.");
    }

    let updateActiviteQuery;
    let values;

    if (req.file) {
      const videoName = req.file.filename;
      updateActiviteQuery = "UPDATE activite SET titre = ?, categorie = ?, contenu = ?, duration = ?, id_chapitre = ? WHERE id = ?";
      values = [titre, categorie, videoName, duration, id_chapitre, id_activite];
    } else {
      updateActiviteQuery = "UPDATE activite SET titre = ?, categorie = ?, duration = ?, id_chapitre = ? WHERE id = ?";
      values = [titre, categorie, duration, id_chapitre, id_activite];
    }

    db.query(updateActiviteQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur lors de la mise à jour de l'activité vidéo :", err);
        return res.status(500).json("Une erreur s'est produite lors de la mise à jour de l'activité vidéo.");
      }

      if (data.affectedRows === 0) {
        return res.status(404).json("L'activité n'existe pas.");
      }

      return res.status(200).json("L'activité vidéo a été mise à jour avec succès.");
    });
  });
};



export const updateActiviteI = (req, res) => {
  // Vérifier si une nouvelle image a été téléchargée
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Erreur Multer :", err);
      return res.status(500).json("Une erreur s'est produite lors du téléchargement de l'image.");
    } else if (err) {
      console.error("Erreur inattendue lors du téléchargement de l'image :", err);
      return res.status(500).json("Une erreur inattendue s'est produite lors du téléchargement de l'image.");
    }

    const id = req.params.id;
    const { titre, categorie, id_chapitre, duration } = req.body;

    if (!id || !titre || !categorie || !id_chapitre || !duration) {
      return res.status(400).json("Tous les champs sont requis.");
    }

    let updateActiviteQuery;
    let values;

    if (req.file) {
      const imageName = req.file.filename;
      updateActiviteQuery = "UPDATE activite SET titre = ?, categorie = ?, contenu = ?, duration = ?, id_chapitre = ? WHERE id = ?";
      values = [titre, categorie, imageName, duration, id_chapitre, id];
    } else {
      updateActiviteQuery = "UPDATE activite SET titre = ?, categorie = ?, duration = ?, id_chapitre = ? WHERE id = ?";
      values = [titre, categorie, duration, id_chapitre, id];
    }

    db.query(updateActiviteQuery, values, (err, data) => {
      if (err) {
        console.error("Erreur lors de la mise à jour de l'activité :", err);
        return res.status(500).json("Une erreur s'est produite lors de la mise à jour de l'activité.");
      }

      if (data.affectedRows === 0) {
        return res.status(404).json("L'activité n'existe pas.");
      }

      return res.status(200).json("L'activité a été mise à jour avec succès.");
    });
  });
};