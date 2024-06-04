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

export const createCours = (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer :", err);
            return res.status(500).json("Une erreur s'est produite lors du téléchargement de l'image.");
        } else if (err) {
            console.error("Erreur inattendue lors du téléchargement de l'image :", err);
            return res.status(500).json("Une erreur inattendue s'est produite lors du téléchargement de l'image.");
        }

        const { titre, description, dateCre, type, level,id_user,duration  } = req.body;
        const imageName = req.file.filename; // Nom de l'image téléchargée

        if (  !titre || !description || !dateCre || !type || !level || !id_user || !imageName || !duration) {
            return res.status(400).json("Tous les champs sont requis.");
        }

        const insertCoursQuery = "INSERT INTO Cours ( titre, description, dateCre, id_user ,image,duration,categorie,id_level) VALUES (?, ?, ?, ?, ?, ?, ?,?)";
        const values = [titre, description, dateCre, id_user , imageName,duration, type,level];

        db.query(insertCoursQuery, values, (err, data) => {
            if (err) {
                console.error("Erreur lors de la création du cours :", err);
                return res.status(500).json("Une erreur s'est produite lors de la création du cours.");
            }
            const coursId = data.insertId; // Récupérer l'ID du cours inséré

            return res.status(200).json({ message: "Le cours a été créé avec succès.", coursId: coursId });
      

        });
    });
};

export const getAllCourses = (req, res) => {
    const selectCoursesQuery = "SELECT * FROM Cours";

    db.query(selectCoursesQuery, (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des cours :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des cours.");
        }

        return res.status(200).json(data);
    });
};


export const getAllCoursesId = (req, res) => {
    const id_user = req.params.id; // Assuming id_user is passed as a parameter in the URL
    
    const selectCoursesQuery = "SELECT * FROM Cours WHERE id_user = ?";

    db.query(selectCoursesQuery, id_user, (err, data) => {
        if (err) {
            console.error("Error retrieving courses for user:", err);
            return res.status(500).json("An error occurred while retrieving courses for user.");
        }

        return res.status(200).json(data);
    });
};


export const getCourse = (req, res) => {
    const id_cours = req.params.id; 
    
    const selectCoursesQuery = "SELECT * FROM Cours WHERE id = ?";

    db.query(selectCoursesQuery, id_cours, (err, data) => {
        if (err) {
            console.error("Error retrieving course:", err);
            return res.status(500).json("An error occurred while retrieving course.");
        }

        return res.status(200).json(data);
    });
};


export const getUserNameByCourseId = (req, res) => {
    const id_cours = req.params.id; // ID du cours passé en paramètre

    // Requête SQL pour récupérer le nom de l'utilisateur associé à un cours
    const query = `
    SELECT Users.username FROM
     Cours JOIN Users ON Cours.id_user = Users.id WHERE Cours.id = ?;
    `;

    db.query(query, [id_cours], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération du nom de l'utilisateur :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération du nom de l'utilisateur.");
        }

        if (data.length === 0) {
            return res.status(404).json("Aucun utilisateur trouvé pour cet ID de cours.");
        }

        const userName = data[0]; // Récupérer le nom de l'utilisateur
        return res.status(200).json(userName.username);
    });
};

export const getUserIdByCourseId = (req, res) => {
    const id_cours = req.params.id; // ID du cours passé en paramètre

    // Requête SQL pour récupérer le nom de l'utilisateur associé à un cours
    const query = `
    SELECT Users.id FROM
     Cours JOIN Users ON Cours.id_user = Users.id WHERE Cours.id = ?;
    `;

    db.query(query, [id_cours], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération du nom de l'utilisateur :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération du nom de l'utilisateur.");
        }

        if (data.length === 0) {
            return res.status(404).json("Aucun utilisateur trouvé pour cet ID de cours.");
        }

        const userName = data[0]; // Récupérer le nom de l'utilisateur
        return res.status(200).json(userName.id);
    });
};

export const deleteCourse = (req, res) => {
    const id_cours = req.params.id;

    // Commencez une transaction pour assurer que toutes les suppressions soient atomiques
    db.beginTransaction(err => {
        if (err) {
            console.error("Erreur lors du début de la transaction :", err);
            return res.status(500).json("Une erreur s'est produite lors du début de la transaction.");
        }

        // Supprimer les enregistrements associés dans la table lecture
        const deleteLectureQuery = "DELETE FROM lecture WHERE id_cours = ?";
        db.query(deleteLectureQuery, [id_cours], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Erreur lors de la suppression des enregistrements de la table lecture :", err);
                    return res.status(500).json("Une erreur s'est produite lors de la suppression des enregistrements de la table lecture.");
                });
            }

            // Supprimer les enregistrements associés dans la table avc
            const deleteAVCQuery = "DELETE FROM avc WHERE idCours = ?";
            db.query(deleteAVCQuery, [id_cours], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Erreur lors de la suppression des enregistrements de la table avc :", err);
                        return res.status(500).json("Une erreur s'est produite lors de la suppression des enregistrements de la table avc.");
                    });
                }

                // Supprimer toutes les activités associées aux chapitres du cours
                const deleteActivitiesQuery = `
                DELETE Activite FROM Activite
                JOIN Chapitre ON Activite.id_chapitre = Chapitre.id_chapitre
                WHERE Chapitre.id_cours = ?
                `;
                db.query(deleteActivitiesQuery, [id_cours], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Erreur lors de la suppression des activités :", err);
                            return res.status(500).json("Une erreur s'est produite lors de la suppression des activités.");
                        });
                    }

                    // Supprimer tous les chapitres associés au cours
                    const deleteChaptersQuery = "DELETE FROM Chapitre WHERE id_cours = ?";
                    db.query(deleteChaptersQuery, [id_cours], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Erreur lors de la suppression des chapitres :", err);
                                return res.status(500).json("Une erreur s'est produite lors de la suppression des chapitres.");
                            });
                        }

                        // Supprimer les questions de quiz associées aux quizzes du cours
                        const deleteQuizQuestionsQuery = `
                        DELETE question FROM question
                        JOIN Quiz ON question.id_quiz = Quiz.id
                        WHERE Quiz.id_cours = ?
                        `;
                        db.query(deleteQuizQuestionsQuery, [id_cours], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Erreur lors de la suppression des questions de quiz :", err);
                                    return res.status(500).json("Une erreur s'est produite lors de la suppression des questions de quiz.");
                                });
                            }

                            // Supprimer les quizzes associés au cours
                            const deleteQuizzesQuery = "DELETE FROM Quiz WHERE id_cours = ?";
                            db.query(deleteQuizzesQuery, [id_cours], (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error("Erreur lors de la suppression des quizzes :", err);
                                        return res.status(500).json("Une erreur s'est produite lors de la suppression des quizzes.");
                                    });
                                }

                                // Supprimer le cours lui-même
                                const deleteCourseQuery = "DELETE FROM Cours WHERE id = ?";
                                db.query(deleteCourseQuery, [id_cours], (err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error("Erreur lors de la suppression du cours :", err);
                                            return res.status(500).json("Une erreur s'est produite lors de la suppression du cours.");
                                        });
                                    }

                                    // Valider la transaction
                                    db.commit(err => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error("Erreur lors de la validation de la transaction :", err);
                                                return res.status(500).json("Une erreur s'est produite lors de la validation de la transaction.");
                                            });
                                        }

                                        return res.status(200).json({ message: "Le cours et ses éléments associés ont été supprimés avec succès." });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};




export const updateCours = (req, res) => {
    upload.single('image')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.error("Erreur Multer :", err);
        return res.status(500).json("Une erreur s'est produite lors du téléchargement de l'image.");
      } else if (err) {
        console.error("Erreur inattendue lors du téléchargement de l'image :", err);
        return res.status(500).json("Une erreur inattendue s'est produite lors du téléchargement de l'image.");
      }
  
      const { id } = req.params;
      const { titre, description, dateCre, type, level, id_user, duration } = req.body;
      const imageName = req.file ? req.file.filename : null; // Nom de l'image téléchargée ou null si aucune image
  
      if (!titre || !description || !dateCre || !type || !level || !id_user || !duration) {
        return res.status(400).json("Tous les champs sont requis.");
      }
  
      // Construire la requête SQL et les valeurs
      let updateCoursQuery = "UPDATE Cours SET titre = ?, description = ?, dateCre = ?, type = ?, level = ?, id_user = ?, duration = ?";
      const values = [titre, description, dateCre, type, level, id_user, duration];
  
      if (imageName) {
        updateCoursQuery += ", image = ?";
        values.push(imageName);
      }
  
      updateCoursQuery += " WHERE id = ?";
      values.push(id);
  
      db.query(updateCoursQuery, values, (err, data) => {
        if (err) {
          console.error("Erreur lors de la mise à jour du cours :", err);
          return res.status(500).json("Une erreur s'est produite lors de la mise à jour du cours.");
        }
  
        if (data.affectedRows === 0) {
          return res.status(404).json("Le cours n'existe pas.");
        }
  
        return res.status(200).json("Le cours a été mis à jour avec succès.");
      });
    });
  };