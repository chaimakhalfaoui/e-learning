// controllers/cours.js - Version corrigée

import { db } from "../db.js";
import multer from "multer";
import { createS3Upload, getFileUrl } from "../middleware/s3upload.js";



// Définir le stockage pour multer
const upload = createS3Upload("uploads");


// Configurer multer avec le stockage et le filtre

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
        const imageName = req.file ? req.file.location : null;

        if (!titre || !description || !dateCre || !type || !level || !id_user || !imageName || !duration) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        const insertCoursQuery = `
            INSERT INTO cours 
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

export const getAllCourses = (req, res) => {
    const selectCoursesQuery = `
        SELECT C.*, cat.title AS type, lvl.title AS level, u.username AS enseignant
        FROM cours AS C
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
        FROM cours AS C 
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
        FROM cours AS C 
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
        SELECT users.username FROM
        Cours JOIN users ON cours.id_user = users.id WHERE cours.id = ?;
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
        SELECT users.id FROM
        cours JOIN users ON cours.id_user = users.id WHERE cours.id = ?;
    `;

    db.query(query, [id_cours], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "Cours non trouvé" });
        }
        res.json({ id_user: data[0].id });
    });
};
export const deleteCourse = (req, res) => {
    const id_cours = req.params.id;

    const deleteCourseQuery = "DELETE FROM cours WHERE id = ?";
    db.query(deleteCourseQuery, [id_cours], (err, result) => {
        if (err) {
            console.error("Erreur suppression cours:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cours non trouvé." });
        }
        return res.status(200).json({ message: "Cours supprimé avec succès." });
    });
};

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
        const imageName = req.file ? req.file.location : null;

        if (!titre || !description || !dateCre || !type || !level || !id_user || !duration) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        let updateCoursQuery = "UPDATE cours SET titre = ?, description = ?, dateCre = ?, id_categorie = ?, id_level = ?, id_user = ?, duration = ?";
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
            FROM cours c
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

export const updateCourseStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ error: "ID et statut requis." });
    }

    if (status !== 'published' && status !== 'hidden') {
        return res.status(400).json({ error: "Statut invalide." });
    }

    const checkQuery = "SELECT id, titre, validation_status FROM cours WHERE id = ?";
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

        const query = "UPDATE cours SET status = ? WHERE id = ?";
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
        FROM cours C
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
        FROM cours C
        INNER JOIN categorie cat ON C.id_categorie = cat.id
        INNER JOIN level lvl ON C.id_level = lvl.id
        INNER JOIN users u ON C.id_user = u.id
        INNER JOIN lecture L ON C.id = L.id_cours
        WHERE L.id_user = ? AND C.status = 'published' AND C.validation_status = 'approved'
        GROUP BY C.id
        ORDER BY C.id DESC
    `;

    db.query(query, [idUser], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        
        return res.status(200).json({
            success: true,
            cours: data
        });
    });
};

export const getEtudiantsByCours = (req, res) => {
    const { coursId } = req.params;
    
    if (!coursId) {
        return res.status(400).json({ error: "L'ID du cours est requis." });
    }
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
        FROM users u
        INNER JOIN lecture l ON u.id = l.id_user
        LEFT JOIN avc a ON u.id = a.idUser AND a.idCours = ?
        WHERE l.id_cours = ? AND u.role = 'etudiant'
        ORDER BY l.id DESC
    `;
    
    // Vérifier d'abord si la table inscription existe
    const checkTableQuery = "SHOW TABLES LIKE 'inscription'";
    db.query(checkTableQuery, (err, tableResult) => {
        if (err) {
            console.error("Erreur vérification table:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        
        // Si la table inscription n'existe pas, utiliser la table Lecture
        if (tableResult.length === 0) {
            const query = `
                SELECT DISTINCT 
                    u.id, 
                    u.username, 
                    u.email
                FROM users u
                INNER JOIN lecture l ON u.id = l.id_user
                WHERE l.id_cours = ? AND u.role = 'etudiant'
                ORDER BY u.username ASC
            `;
            
            db.query(query, [coursId], (err, results) => {
                if (err) {
                    console.error("Erreur SQL:", err);
                    return res.status(500).json({ error: "Erreur lors de la récupération des étudiants" });
                }
                return res.status(200).json(results);
            });
        } else {
            // Utiliser la table inscription
            const query = `
                SELECT DISTINCT 
                    u.id, 
                    u.username, 
                    u.email
                FROM users u
                INNER JOIN inscription i ON u.id = i.id_etudiant
                WHERE i.id_cours = ? AND u.role = 'etudiant'
                ORDER BY u.username ASC
            `;
            
            db.query(query, [coursId], (err, results) => {
                if (err) {
                    console.error("Erreur SQL:", err);
                    return res.status(500).json({ error: "Erreur lors de la récupération des étudiants" });
                }
                return res.status(200).json(results);
            });
        }
    });
};


// Demander la validation (enseignant)
export const requestValidation = (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    
    const query = `
        UPDATE cours 
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
    
    const checkQuery = "SELECT id, validation_status FROM cours WHERE id = ?";
    db.query(checkQuery, [id], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Cours non trouvé" });
        }
        if (result[0].validation_status !== 'pending') {
            return res.status(400).json({ error: "Ce cours n'est pas en attente de validation" });
        }

        const query = `
            UPDATE cours 
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
            return res.status(200).json({ 
                message: "Cours validé avec succès. L'enseignant peut maintenant le publier.",
                validation_status: 'approved'
            });
        });
    });
};

// Rejeter un cours (coordinateur)
export const rejectCourse = (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    
    const checkQuery = "SELECT id, validation_status FROM cours WHERE id = ?";
    db.query(checkQuery, [id], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Cours non trouvé" });
        }
        if (result[0].validation_status !== 'pending') {
            return res.status(400).json({ error: "Ce cours n'est pas en attente de validation" });
        }

        const query = `
            UPDATE cours 
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
            return res.status(200).json({ 
                message: "Cours rejeté. L'enseignant doit modifier et re-soumettre.",
                validation_status: 'rejected'
            });
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
        FROM cours C
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
        FROM cours C
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
