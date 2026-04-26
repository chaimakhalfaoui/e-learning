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

// ==================== CRÉATION D'UN COURS ====================
export const createCours = (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer :", err);
            return res.status(500).json({ error: "Erreur lors du téléchargement de l'image." });
        } else if (err) {
            console.error("Erreur inattendue :", err);
            return res.status(500).json({ error: err.message });
        }

        const { titre, description, dateCre, type, level, id_user, duration } = req.body;
        const imageName = req.file ? req.file.filename : null;

        if (!titre || !description || !dateCre || !type || !level || !id_user || !imageName || !duration) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        // ✅ Statut par défaut: 'hidden' (caché) et validation_status: 'pending' (en attente)
        const insertCoursQuery = `
            INSERT INTO Cours 
            (titre, description, dateCre, id_user, image, duration, id_categorie, id_level, status, validation_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'hidden', 'pending')
        `;
        
        const values = [titre, description, dateCre, id_user, imageName, duration, type, level];

        db.query(insertCoursQuery, values, (err, data) => {
            if (err) {
                console.error("Erreur lors de la création du cours :", err);
                return res.status(500).json({ error: "Erreur lors de la création du cours." });
            }
            const coursId = data.insertId;
            return res.status(201).json({ 
                message: "Cours créé avec succès. En attente de validation par le coordinateur.", 
                coursId: coursId,
                status: 'hidden',
                validation_status: 'pending'
            });
        });
    });
};

// ==================== RÉCUPÉRATION DES COURS ====================
export const getAllCourses = (req, res) => {
    const selectCoursesQuery = `
        SELECT C.*, cat.title AS type, lvl.title AS level, u.username AS enseignant
        FROM Cours AS C
        INNER JOIN categorie AS cat ON C.id_categorie = cat.id
        INNER JOIN level AS lvl ON C.id_level = lvl.id
        INNER JOIN users AS u ON C.id_user = u.id
        ORDER BY C.id DESC
    `;

    db.query(selectCoursesQuery, (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des cours :", err);
            return res.status(500).json({ error: "Erreur serveur." });
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
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json(data);
    });
};

export const getCourse = (req, res) => {
    const id_cours = req.params.id; 
    
    const selectCoursesQuery = `
        SELECT C.*, cat.title AS type, lvl.title AS level, u.username AS enseignant
        FROM Cours AS C 
        INNER JOIN categorie AS cat ON C.id_categorie = cat.id
        INNER JOIN level AS lvl ON C.id_level = lvl.id
        INNER JOIN users AS u ON C.id_user = u.id
        WHERE C.id = ?
    `;

    db.query(selectCoursesQuery, [id_cours], (err, data) => {
        if (err) {
            console.error("Error retrieving course:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: "Cours non trouvé." });
        }
        return res.status(200).json(data[0]);
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
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: "Aucun utilisateur trouvé." });
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
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: "Aucun utilisateur trouvé." });
        }
        return res.status(200).json(data[0].id);
    });
};

// ==================== SUPPRESSION D'UN COURS ====================
export const deleteCourse = (req, res) => {
    const id_cours = req.params.id;

    db.beginTransaction(err => {
        if (err) {
            console.error("Erreur transaction:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }

        const deleteLectureQuery = "DELETE FROM lecture WHERE id_cours = ?";
        db.query(deleteLectureQuery, [id_cours], (err) => {
            if (err) return db.rollback(() => {
                console.error("Erreur suppression lecture:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            });

            const deleteAVCQuery = "DELETE FROM avc WHERE idCours = ?";
            db.query(deleteAVCQuery, [id_cours], (err) => {
                if (err) return db.rollback(() => {
                    console.error("Erreur suppression avc:", err);
                    return res.status(500).json({ error: "Erreur serveur." });
                });

                const deleteActivitiesQuery = `
                    DELETE Activite FROM Activite
                    JOIN Chapitre ON Activite.id_chapitre = Chapitre.id_chapitre
                    WHERE Chapitre.id_cours = ?
                `;
                db.query(deleteActivitiesQuery, [id_cours], (err) => {
                    if (err) return db.rollback(() => {
                        console.error("Erreur suppression activités:", err);
                        return res.status(500).json({ error: "Erreur serveur." });
                    });

                    const deleteChaptersQuery = "DELETE FROM Chapitre WHERE id_cours = ?";
                    db.query(deleteChaptersQuery, [id_cours], (err) => {
                        if (err) return db.rollback(() => {
                            console.error("Erreur suppression chapitres:", err);
                            return res.status(500).json({ error: "Erreur serveur." });
                        });

                        const deleteQuizQuestionsQuery = `
                            DELETE question FROM question
                            JOIN Quiz ON question.id_quiz = Quiz.id
                            WHERE Quiz.id_cours = ?
                        `;
                        db.query(deleteQuizQuestionsQuery, [id_cours], (err) => {
                            if (err) return db.rollback(() => {
                                console.error("Erreur suppression questions:", err);
                                return res.status(500).json({ error: "Erreur serveur." });
                            });

                            const deleteQuizzesQuery = "DELETE FROM Quiz WHERE id_cours = ?";
                            db.query(deleteQuizzesQuery, [id_cours], (err) => {
                                if (err) return db.rollback(() => {
                                    console.error("Erreur suppression quizzes:", err);
                                    return res.status(500).json({ error: "Erreur serveur." });
                                });

                                const deleteCourseQuery = "DELETE FROM Cours WHERE id = ?";
                                db.query(deleteCourseQuery, [id_cours], (err) => {
                                    if (err) return db.rollback(() => {
                                        console.error("Erreur suppression cours:", err);
                                        return res.status(500).json({ error: "Erreur serveur." });
                                    });

                                    db.commit(err => {
                                        if (err) return db.rollback(() => {
                                            console.error("Erreur validation:", err);
                                            return res.status(500).json({ error: "Erreur serveur." });
                                        });
                                        return res.status(200).json({ message: "Cours supprimé avec succès." });
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

// ==================== MISE À JOUR D'UN COURS ====================
export const updateCours = (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer:", err);
            return res.status(500).json({ error: "Erreur lors du téléchargement." });
        } else if (err) {
            console.error("Erreur inattendue:", err);
            return res.status(500).json({ error: err.message });
        }

        const { id } = req.params;
        const { titre, description, dateCre, type, level, id_user, duration, status } = req.body;
        const imageName = req.file ? req.file.filename : null;

        if (!titre || !description || !dateCre || !type || !level || !id_user || !duration) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        let updateCoursQuery = "UPDATE Cours SET titre = ?, description = ?, dateCre = ?, id_categorie = ?, id_level = ?, id_user = ?, duration = ?";
        const values = [titre, description, dateCre, type, level, id_user, duration];

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
                console.error("Erreur mise à jour:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }

            if (data.affectedRows === 0) {
                return res.status(404).json({ error: "Cours non trouvé." });
            }

            return res.status(200).json({ message: "Cours mis à jour avec succès." });
        });
    });
};

// ==================== COURS PAR CATÉGORIE ====================
export const getCoursByCategorie = (req, res) => {
    const { idCategorie } = req.params;
    const { includeHidden } = req.query;

    if (!idCategorie) {
        return res.status(400).json({ error: "ID catégorie requis." });
    }

    const categorieId = parseInt(idCategorie);
    if (isNaN(categorieId)) {
        return res.status(400).json({ error: "ID catégorie invalide." });
    }

    const checkCategorieQuery = "SELECT id, title FROM categorie WHERE id = ?";
    
    db.query(checkCategorieQuery, [categorieId], (err, categorieResult) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }

        if (categorieResult.length === 0) {
            return res.status(404).json({ error: "Catégorie non trouvée." });
        }

        let statusFilter = "AND c.status = 'published' AND c.validation_status = 'approved'";
        if (includeHidden === 'true') {
            statusFilter = "";
        }

        const query = `
            SELECT 
                c.id, c.titre, c.description, c.dateCre, c.image, c.duration,
                c.id_categorie, c.id_user, c.id_level, c.status, c.validation_status,
                cat.title AS type, lvl.title AS level, u.username AS enseignant
            FROM Cours c
            INNER JOIN categorie cat ON c.id_categorie = cat.id
            INNER JOIN level lvl ON c.id_level = lvl.id
            INNER JOIN users u ON c.id_user = u.id
            WHERE c.id_categorie = ? ${statusFilter}
            ORDER BY c.id DESC
        `;

        db.query(query, [categorieId], (err, coursData) => {
            if (err) {
                console.error("Erreur:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            return res.status(200).json({
                categorie: { id: categorieResult[0].id, nom: categorieResult[0].title },
                total: coursData.length,
                cours: coursData
            });
        });
    });
};

// ==================== PUBLIER/CACHER UN COURS ====================
export const updateCourseStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ error: "ID et statut requis." });
    }

    if (status !== 'published' && status !== 'hidden') {
        return res.status(400).json({ error: "Statut invalide." });
    }

    const checkQuery = "SELECT id, titre, validation_status FROM Cours WHERE id = ?";
    db.query(checkQuery, [id], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Cours non trouvé." });
        }

        if (status === 'published' && result[0].validation_status !== 'approved') {
            return res.status(403).json({ 
                error: "Ce cours n'a pas encore été validé par le coordinateur. Vous ne pouvez pas le publier." 
            });
        }

        const query = "UPDATE Cours SET status = ? WHERE id = ?";
        db.query(query, [status, id], (err, data) => {
            if (err) {
                console.error("Erreur:", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            return res.status(200).json({ 
                message: `Cours ${status === 'published' ? 'publié' : 'caché'} avec succès.`,
                status: status 
            });
        });
    });
};

// ==================== COURS PAR STATUT ====================
export const getCoursesByStatus = (req, res) => {
    const { status } = req.params;
    
    if (status !== 'published' && status !== 'hidden') {
        return res.status(400).json({ error: "Statut invalide." });
    }

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
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json({
            count: data.length,
            status: status,
            cours: data
        });
    });
};
// Récupérer les cours suivis par un étudiant - VERSION CORRIGÉE
export const getCoursesByStudent = (req, res) => {
    const { idUser } = req.params;
    
    if (!idUser) {
        return res.status(400).json({ 
            success: false,
            message: "L'ID de l'utilisateur est requis." 
        });
    }

    // Version corrigée sans ORDER BY sur created_at
    const query = `
        SELECT DISTINCT 
            C.*, 
            cat.title AS type, 
            lvl.title AS level, 
            u.username AS enseignant,
            COALESCE(A.avc, 0) AS progression
        FROM Cours C
        INNER JOIN categorie cat ON C.id_categorie = cat.id
        INNER JOIN level lvl ON C.id_level = lvl.id
        INNER JOIN users u ON C.id_user = u.id
        INNER JOIN Lecture L ON C.id = L.id_cours
        LEFT JOIN Avc A ON C.id = A.idCours AND A.idUser = ?
        WHERE L.id_user = ? AND C.status = 'published'
        ORDER BY C.id DESC
    `;

    db.query(query, [idUser, idUser], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ 
                success: false,
                message: "Erreur serveur.",
                error: err.message
            });
        }
        return res.status(200).json({
            success: true,
            count: data.length,
            cours: data
        });
    });
};
// ==================== COURS SUIVIS PAR UN ÉTUDIANT ====================
export const getStudentEnrolledCourses = (req, res) => {
    const { idUser } = req.params;
    
    if (!idUser) {
        return res.status(400).json({ error: "ID utilisateur requis." });
    }

    const query = `
        SELECT 
            C.id,
            C.titre,
            C.description,
            C.image,
            C.duration,
            C.status,
            cat.title AS categorie,
            lvl.title AS niveau,
            u.username AS enseignant
        FROM Cours C
        INNER JOIN categorie cat ON C.id_categorie = cat.id
        INNER JOIN level lvl ON C.id_level = lvl.id
        INNER JOIN users u ON C.id_user = u.id
        INNER JOIN Lecture L ON C.id = L.id_cours
        WHERE L.id_user = ? AND C.status = 'published'
        GROUP BY C.id
        ORDER BY C.id DESC
    `;

    db.query(query, [idUser], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        
        // CORRECTION : Retourner une structure cohérente avec ce qu'attend le frontend
        return res.status(200).json({
            success: true,
            cours: data
        });
    });
};

// ==================== ÉTUDIANTS INSCRITS À UN COURS ====================
export const getEtudiantsByCours = (req, res) => {
    const { idCours } = req.params;
    
    const query = `
        SELECT DISTINCT 
            u.id,
            u.username,
            u.email,
            u.telephone,
            u.genre,
            u.age,
            COALESCE(a.avc, 0) AS progression,
            l.created_at AS date_inscription
        FROM Users u
        INNER JOIN Lecture l ON u.id = l.id_user
        LEFT JOIN Avc a ON u.id = a.idUser AND a.idCours = ?
        WHERE l.id_cours = ? AND u.role = 'etudiant'
        ORDER BY l.id DESC
    `;
    
    db.query(query, [idCours, idCours], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        return res.status(200).json(data);
    });
};

// ==================== VALIDATION DES COURS ====================

// Demander la validation (enseignant)
export const requestValidation = (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    
    const query = `
        UPDATE Cours 
        SET validation_status = 'pending', 
            validation_comment = ?,
            status = 'hidden'
        WHERE id = ?
    `;
    
    db.query(query, [message || 'En attente de validation', id], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cours non trouvé." });
        }
        return res.status(200).json({ 
            message: "Demande de validation envoyée au coordinateur",
            validation_status: 'pending'
        });
    });
};

// Valider un cours (coordinateur)
export const approveCourse = (req, res) => {
    const { id } = req.params;
    const { validated_by, comment } = req.body;
    
    const query = `
        UPDATE Cours 
        SET validation_status = 'approved',
            validation_comment = ?,
            validation_date = NOW(),
            validated_by = ?
        WHERE id = ?
    `;
    
    db.query(query, [comment || 'Cours validé', validated_by, id], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cours non trouvé." });
        }
        return res.status(200).json({ 
            message: "Cours validé avec succès. L'enseignant peut maintenant le publier.",
            validation_status: 'approved'
        });
    });
};

// Rejeter un cours (coordinateur)
export const rejectCourse = (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    
    const query = `
        UPDATE Cours 
        SET validation_status = 'rejected',
            validation_comment = ?,
            status = 'hidden'
        WHERE id = ?
    `;
    
    db.query(query, [comment || 'Cours rejeté - modifications nécessaires', id], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cours non trouvé." });
        }
        return res.status(200).json({ 
            message: "Cours rejeté. L'enseignant doit modifier et re-soumettre.",
            validation_status: 'rejected'
        });
    });
};

// Récupérer les cours en attente (coordinateur)
export const getPendingCourses = (req, res) => {
    const query = `
        SELECT C.*, 
               cat.title AS categorie,
               lvl.title AS niveau,
               u.username AS enseignant,
               u.email AS enseignant_email
        FROM Cours C
        INNER JOIN categorie cat ON C.id_categorie = cat.id
        INNER JOIN level lvl ON C.id_level = lvl.id
        INNER JOIN users u ON C.id_user = u.id
        WHERE C.validation_status = 'pending'
        ORDER BY C.id DESC
    `;
    
    db.query(query, (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        return res.status(200).json(data);
    });
};

// Récupérer les cours d'un enseignant avec statut de validation
export const getCoursesWithValidationStatus = (req, res) => {
    const { idUser } = req.params;
    
    const query = `
        SELECT C.*, 
               cat.title AS categorie,
               lvl.title AS niveau,
               C.validation_status,
               C.validation_comment,
               CASE 
                   WHEN C.validation_status = 'pending' THEN 'En attente de validation'
                   WHEN C.validation_status = 'approved' THEN 'Validé'
                   WHEN C.validation_status = 'rejected' THEN 'Rejeté'
                   ELSE 'Non soumis'
               END AS validation_status_text
        FROM Cours C
        INNER JOIN categorie cat ON C.id_categorie = cat.id
        INNER JOIN level lvl ON C.id_level = lvl.id
        WHERE C.id_user = ?
        ORDER BY C.id DESC
    `;
    
    db.query(query, [idUser], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        return res.status(200).json(data);
    });
};