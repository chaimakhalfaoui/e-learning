import { db } from "../db.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

// Définir le stockage pour multer
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

        const { titre, description, dateCre, type, level, id_user, duration, status } = req.body;
        const imageName = req.file ? req.file.filename : null;

        if (!titre || !description || !dateCre || !type || !level || !id_user || !imageName || !duration) {
            return res.status(400).json("Tous les champs sont requis.");
        }

        // ✅ Statut par défaut 'hidden' si non fourni
        const courseStatus = status || 'hidden';

        const insertCoursQuery = "INSERT INTO Cours (titre, description, dateCre, id_user, image, duration, id_categorie, id_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [titre, description, dateCre, id_user, imageName, duration, type, level, courseStatus];

        db.query(insertCoursQuery, values, (err, data) => {
            if (err) {
                console.error("Erreur lors de la création du cours :", err);
                return res.status(500).json("Une erreur s'est produite lors de la création du cours.");
            }
            const coursId = data.insertId;
            return res.status(200).json({ 
                message: "Le cours a été créé avec succès.", 
                coursId: coursId,
                status: courseStatus 
            });
        });
    });
};

export const getAllCourses = (req, res) => {
    const selectCoursesQuery = `
        SELECT C.*, cat.title AS type, lvl.title AS level
        FROM Cours AS C
        INNER JOIN categorie AS cat ON C.id_categorie = cat.id
        INNER JOIN level AS lvl ON C.id_level = lvl.id
        ORDER BY C.id DESC
    `;

    db.query(selectCoursesQuery, (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des cours :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des cours.");
        }
        return res.status(200).json(data);
    });
};

export const getAllCoursesId = (req, res) => {
    const id_user = req.params.id; 
    
    const selectCoursesQuery = `
        SELECT C.*, cat.title AS type, lvl.title AS level
        FROM Cours AS C 
        INNER JOIN categorie AS cat ON C.id_categorie = cat.id
        INNER JOIN level AS lvl ON C.id_level = lvl.id
        WHERE C.id_user = ?
        ORDER BY C.id DESC
    `;

    db.query(selectCoursesQuery, [id_user], (err, data) => {
        if (err) {
            console.error("Error retrieving courses for user:", err);
            return res.status(500).json("An error occurred while retrieving courses for user.");
        }
        return res.status(200).json(data);
    });
};

export const getCourse = (req, res) => {
    const id_cours = req.params.id; 
    
    const selectCoursesQuery = `
        SELECT C.*, cat.title AS type, lvl.title AS level
        FROM Cours AS C 
        INNER JOIN categorie AS cat ON C.id_categorie = cat.id
        INNER JOIN level AS lvl ON C.id_level = lvl.id
        WHERE C.id = ?
    `;

    db.query(selectCoursesQuery, [id_cours], (err, data) => {
        if (err) {
            console.error("Error retrieving course:", err);
            return res.status(500).json("An error occurred while retrieving course.");
        }
        return res.status(200).json(data);
    });
};

export const getUserNameByCourseId = (req, res) => {
    const id_cours = req.params.id;
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
        return res.status(200).json(data[0].username);
    });
};

export const getUserIdByCourseId = (req, res) => {
    const id_cours = req.params.id;
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
        return res.status(200).json(data[0].id);
    });
};

export const deleteCourse = (req, res) => {
    const id_cours = req.params.id;

    db.beginTransaction(err => {
        if (err) {
            console.error("Erreur lors du début de la transaction :", err);
            return res.status(500).json("Une erreur s'est produite lors du début de la transaction.");
        }

        const deleteLectureQuery = "DELETE FROM lecture WHERE id_cours = ?";
        db.query(deleteLectureQuery, [id_cours], (err) => {
            if (err) return db.rollback(() => {
                console.error("Erreur lors de la suppression des enregistrements de la table lecture :", err);
                return res.status(500).json("Une erreur s'est produite lors de la suppression des enregistrements de la table lecture.");
            });

            const deleteAVCQuery = "DELETE FROM avc WHERE idCours = ?";
            db.query(deleteAVCQuery, [id_cours], (err) => {
                if (err) return db.rollback(() => {
                    console.error("Erreur lors de la suppression des enregistrements de la table avc :", err);
                    return res.status(500).json("Une erreur s'est produite lors de la suppression des enregistrements de la table avc.");
                });

                const deleteActivitiesQuery = `
                    DELETE Activite FROM Activite
                    JOIN Chapitre ON Activite.id_chapitre = Chapitre.id_chapitre
                    WHERE Chapitre.id_cours = ?
                `;
                db.query(deleteActivitiesQuery, [id_cours], (err) => {
                    if (err) return db.rollback(() => {
                        console.error("Erreur lors de la suppression des activités :", err);
                        return res.status(500).json("Une erreur s'est produite lors de la suppression des activités.");
                    });

                    const deleteChaptersQuery = "DELETE FROM Chapitre WHERE id_cours = ?";
                    db.query(deleteChaptersQuery, [id_cours], (err) => {
                        if (err) return db.rollback(() => {
                            console.error("Erreur lors de la suppression des chapitres :", err);
                            return res.status(500).json("Une erreur s'est produite lors de la suppression des chapitres.");
                        });

                        const deleteQuizQuestionsQuery = `
                            DELETE question FROM question
                            JOIN Quiz ON question.id_quiz = Quiz.id
                            WHERE Quiz.id_cours = ?
                        `;
                        db.query(deleteQuizQuestionsQuery, [id_cours], (err) => {
                            if (err) return db.rollback(() => {
                                console.error("Erreur lors de la suppression des questions de quiz :", err);
                                return res.status(500).json("Une erreur s'est produite lors de la suppression des questions de quiz.");
                            });

                            const deleteQuizzesQuery = "DELETE FROM Quiz WHERE id_cours = ?";
                            db.query(deleteQuizzesQuery, [id_cours], (err) => {
                                if (err) return db.rollback(() => {
                                    console.error("Erreur lors de la suppression des quizzes :", err);
                                    return res.status(500).json("Une erreur s'est produite lors de la suppression des quizzes.");
                                });

                                const deleteCourseQuery = "DELETE FROM Cours WHERE id = ?";
                                db.query(deleteCourseQuery, [id_cours], (err) => {
                                    if (err) return db.rollback(() => {
                                        console.error("Erreur lors de la suppression du cours :", err);
                                        return res.status(500).json("Une erreur s'est produite lors de la suppression du cours.");
                                    });

                                    db.commit(err => {
                                        if (err) return db.rollback(() => {
                                            console.error("Erreur lors de la validation de la transaction :", err);
                                            return res.status(500).json("Une erreur s'est produite lors de la validation de la transaction.");
                                        });
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
        const { titre, description, dateCre, type, level, id_user, duration, status } = req.body;
        const imageName = req.file ? req.file.filename : null;

        if (!titre || !description || !dateCre || !type || !level || !id_user || !duration) {
            return res.status(400).json("Tous les champs sont requis.");
        }

        let updateCoursQuery = "UPDATE Cours SET titre = ?, description = ?, dateCre = ?, id_categorie = ?, id_level = ?, id_user = ?, duration = ?";
        const values = [titre, description, dateCre, type, level, id_user, duration];

        // ✅ Ajout du statut si fourni
        if (status && (status === 'published' || status === 'hidden')) {
            updateCoursQuery += ", status = ?";
            values.push(status);
        }

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

export const getCoursByCategorie = (req, res) => {
    const { idCategorie } = req.params;
    const { includeHidden } = req.query;

    // Validation de l'ID
    if (!idCategorie) {
        return res.status(400).json({ 
            success: false,
            message: "L'identifiant de la catégorie est requis." 
        });
    }

    const categorieId = parseInt(idCategorie);
    if (isNaN(categorieId)) {
        return res.status(400).json({ 
            success: false,
            message: "L'identifiant de la catégorie doit être un nombre valide." 
        });
    }

    // ✅ CORRECTION: Supprimer 'description' de la requête
    const checkCategorieQuery = "SELECT id, title FROM categorie WHERE id = ?";
    
    db.query(checkCategorieQuery, [categorieId], (err, categorieResult) => {
        if (err) {
            console.error("Erreur lors de la vérification de la catégorie:", err);
            return res.status(500).json({ 
                success: false,
                message: "Erreur serveur." 
            });
        }

        if (categorieResult.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: `La catégorie avec l'ID ${categorieId} n'existe pas.` 
            });
        }

        // Construction du filtre de statut
        let statusFilter = "AND c.status = 'published'";
        if (includeHidden === 'true') {
            statusFilter = "";
        }

        const query = `
            SELECT 
                c.id,
                c.titre,
                c.description,
                c.dateCre,
                c.image,
                c.duration,
                c.id_categorie,
                c.id_user,
                c.id_level,
                c.status,
                cat.title AS type,
                lvl.title AS level,
                u.username AS enseignant
            FROM Cours c
            INNER JOIN categorie cat ON c.id_categorie = cat.id
            INNER JOIN level lvl ON c.id_level = lvl.id
            INNER JOIN users u ON c.id_user = u.id
            WHERE c.id_categorie = ? ${statusFilter}
            ORDER BY c.dateCre DESC
        `;

        db.query(query, [categorieId], (err, coursData) => {
            if (err) {
                console.error("Erreur lors de la récupération des cours:", err);
                return res.status(500).json({ 
                    success: false,
                    message: "Erreur lors de la récupération des cours.",
                    error: err.message 
                });
            }

            return res.status(200).json({
                success: true,
                categorie: {
                    id: categorieResult[0].id,
                    nom: categorieResult[0].title
                },
                total: coursData.length,
                cours: coursData
            });
        });
    });
};

export const updateCourseStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`📝 Mise à jour du statut du cours ID ${id} vers: ${status}`);

    if (!id || !status) {
        return res.status(400).json({ 
            success: false,
            message: "ID du cours et statut sont requis." 
        });
    }

    if (status !== 'published' && status !== 'hidden') {
        return res.status(400).json({ 
            success: false,
            message: "Statut invalide. Utilisez 'published' ou 'hidden'." 
        });
    }

    // Vérifier d'abord si le cours existe
    const checkQuery = "SELECT id, titre FROM Cours WHERE id = ?";
    db.query(checkQuery, [id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la vérification du cours:", err);
            return res.status(500).json({ 
                success: false,
                message: "Erreur serveur." 
            });
        }

        if (result.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Cours non trouvé." 
            });
        }

        const query = "UPDATE Cours SET status = ? WHERE id = ?";
        
        db.query(query, [status, id], (err, data) => {
            if (err) {
                console.error("Erreur lors de la mise à jour du statut:", err);
                return res.status(500).json({ 
                    success: false,
                    message: "Erreur serveur.",
                    error: err.message 
                });
            }

            console.log(`✅ Statut du cours "${result[0].titre}" mis à jour en: ${status}`);
            
            return res.status(200).json({ 
                success: true,
                message: `Statut mis à jour avec succès en "${status === 'published' ? 'Publié' : 'Caché'}".`,
                status: status 
            });
        });
    });
};

export const getCoursesByStatus = (req, res) => {
    const { status } = req.params;
    
    if (status !== 'published' && status !== 'hidden') {
        return res.status(400).json({ 
            success: false,
            message: "Statut invalide. Utilisez 'published' ou 'hidden'." 
        });
    }

    // ✅ CORRECTION: Remplacer created_at par id ou dateCre
    const query = `
        SELECT 
            C.*, 
            cat.title AS type, 
            lvl.title AS level, 
            u.username AS enseignant
        FROM Cours C
        INNER JOIN categorie cat ON C.id_categorie = cat.id
        INNER JOIN level lvl ON C.id_level = lvl.id
        INNER JOIN users u ON C.id_user = u.id
        WHERE C.status = ?
        ORDER BY C.id DESC
    `;

    db.query(query, [status], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des cours par statut:", err);
            return res.status(500).json({ 
                success: false,
                message: "Erreur serveur." 
            });
        }
        return res.status(200).json({
            success: true,
            count: data.length,
            status: status,
            cours: data
        });
    });
};