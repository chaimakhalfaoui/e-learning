// controllers/lecture.js
import { db } from "../db.js";

// ==================== CRÉATION (Inscription) ====================
export const createLecture = (req, res) => {
    const { avancement, id_cours, id_user } = req.body;

    if (!id_cours || !id_user) {
        return res.status(400).json({ error: "L'ID du cours et l'ID de l'utilisateur sont requis." });
    }
    
    const checkLectureQuery = "SELECT COUNT(*) AS count FROM lecture WHERE id_cours = ? AND id_user = ?";
    
    db.query(checkLectureQuery, [id_cours, id_user], (err, result) => {
        if (err) {
            console.error("Erreur lors de la vérification :", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }

        if (result[0].count > 0) {
            return res.status(409).json({ 
                message: "Vous êtes déjà inscrit à ce cours.", 
                exists: true 
            });
        }
        
        const avancementValue = avancement !== undefined && avancement !== null ? avancement : 0;
        const insertLectureQuery = "INSERT INTO lecture (avancement, id_cours, id_user) VALUES (?, ?, ?)";
        
        db.query(insertLectureQuery, [avancementValue, id_cours, id_user], (err, data) => {
            if (err) {
                console.error("Erreur lors de l'inscription :", err);
                return res.status(500).json({ error: "Erreur lors de l'inscription." });
            }
            
            // Créer également une entrée dans avc pour la progression
            const insertAvcQuery = "INSERT INTO avc (idCours, iduser, chapN, avc) VALUES (?, ?, 0, 0)";
            db.query(insertAvcQuery, [id_cours, id_user], (avcErr) => {
                if (avcErr) {
                    console.error("Erreur création avc:", avcErr);
                }
            });
            
            return res.status(201).json({ 
                message: "Inscription réussie !", 
                id: data.insertId 
            });
        });
    });
};

// ==================== NOMBRE D'ÉTUDIANTS INSCRITS ====================
export const getLectureCours = (req, res) => {
    const id_cours = req.params.id;
    
    if (!id_cours) {
        return res.status(400).json({ error: "ID du cours requis." });
    }
    
    const selectLectureQuery = "SELECT COUNT(*) AS lectureCount FROM lecture WHERE id_cours = ?";

    db.query(selectLectureQuery, [id_cours], (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération :", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }

        const lectureCount = result[0].lectureCount;
        return res.status(200).json(lectureCount);
    });
};

// ==================== VÉRIFIER SI ÉTUDIANT EST INSCRIT ====================
export const getLectureCountByUser = (req, res) => {
    const { id_cours, id_user } = req.params;
    
    if (!id_cours || !id_user) {
        return res.status(400).json({ error: "ID du cours et ID de l'utilisateur requis." });
    }
    
    const query = "SELECT COUNT(*) AS count FROM lecture WHERE id_cours = ? AND id_user = ?";
    
    db.query(query, [id_cours, id_user], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json({ 
            enrolled: result[0].count > 0,
            isEnrolled: result[0].count > 0 
        });
    });
};

// ==================== COURS SUIVIS PAR UN ÉTUDIANT ====================
export const getUserEnrolledCourses = (req, res) => {
    const { id_user } = req.params;
    
    if (!id_user) {
        return res.status(400).json({ error: "ID utilisateur requis." });
    }
    
    const query = `
        SELECT DISTINCT 
            c.id,
            c.titre,
            c.description,
            c.image,
            c.duration,
            cat.title AS categorie,
            c.id_categorie,
            c.id_level,
            c.status,
            c.validation_status,
            COALESCE(a.avc, 0) AS progression,
            COALESCE(a.chapN, 0) AS chapitre_actuel,
            u.username AS enseignant,
            l.created_at AS date_inscription
        FROM lecture l
        INNER JOIN cours c ON l.id_cours = c.id
        INNER JOIN categorie cat ON c.id_categorie = cat.id
        INNER JOIN level lvl ON c.id_level = lvl.id
        INNER JOIN users u ON c.id_user = u.id
        LEFT JOIN avc a ON c.id = a.idCours AND a.iduser = ?
        WHERE l.id_user = ? AND c.status = 'published' AND c.validation_status = 'approved'
        ORDER BY l.id DESC
    `;
    
    db.query(query, [id_user, id_user], (err, data) => {
        if (err) {
            console.error("Erreur getUserEnrolledCourses:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json(data);
    });
};

// ==================== TOP 6 COURS POPULAIRES ====================
export const getTop6CoursesByLecture = (req, res) => {
    const selectTopCoursesQuery = `
        SELECT 
            cours.id,
            cours.titre,
            cours.image,
            cours.duration,
            cours.description,
            cours.id_categorie,
            cours.id_level,
            cat.title AS categorie,
            lvl.title AS niveau,
            COUNT(DISTINCT lecture.id_user) AS nb_etudiants,
            COUNT(DISTINCT chapitre.id_chapitre) AS nb_chapitres
        FROM cours 
        LEFT JOIN chapitre ON cours.id = chapitre.id_cours 
        LEFT JOIN lecture ON cours.id = lecture.id_cours 
        LEFT JOIN categorie cat ON cours.id_categorie = cat.id
        LEFT JOIN level lvl ON cours.id_level = lvl.id
        WHERE cours.status = 'published' AND cours.validation_status = 'approved'
        GROUP BY cours.id 
        ORDER BY nb_etudiants DESC 
        LIMIT 6
    `;

    db.query(selectTopCoursesQuery, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des cours populaires :", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json(results);
    });
};

// ==================== DÉTAILS D'UNE INSCRIPTION ====================
export const getLectureById = (req, res) => {
    const { id_cours, id_user } = req.params;
    
    if (!id_cours || !id_user) {
        return res.status(400).json({ error: "ID du cours et ID de l'utilisateur requis." });
    }
    
    const query = `
        SELECT l.*, a.avc as progression, a.chapN
        FROM lecture l
        LEFT JOIN avc a ON l.id_cours = a.idCours AND l.id_user = a.iduser
        WHERE l.id_cours = ? AND l.id_user = ?
    `;
    
    db.query(query, [id_cours, id_user], (err, result) => {
        if (err) {
            console.error("Erreur getLectureById:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Inscription non trouvée." });
        }
        return res.status(200).json(result[0]);
    });
};

// ==================== METTRE À JOUR L'AVANCEMENT ====================
export const updateLectureProgress = (req, res) => {
    const { id_cours, id_user } = req.params;
    const { avancement } = req.body;
    
    if (!id_cours || !id_user) {
        return res.status(400).json({ error: "ID du cours et ID de l'utilisateur requis." });
    }
    
    const query = "UPDATE lecture SET avancement = ? WHERE id_cours = ? AND id_user = ?";
    
    db.query(query, [avancement, id_cours, id_user], (err, result) => {
        if (err) {
            console.error("Erreur updateLectureProgress:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Inscription non trouvée." });
        }
        return res.status(200).json({ message: "Avancement mis à jour avec succès." });
    });
};

// ==================== DÉSINSCRIPTION ====================
export const deleteLecture = (req, res) => {
    const { id_cours, id_user } = req.params;
    
    if (!id_cours || !id_user) {
        return res.status(400).json({ error: "ID du cours et ID de l'utilisateur requis." });
    }
    
    const query = "DELETE FROM lecture WHERE id_cours = ? AND id_user = ?";
    
    db.query(query, [id_cours, id_user], (err, result) => {
        if (err) {
            console.error("Erreur deleteLecture:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Inscription non trouvée." });
        }
        return res.status(200).json({ message: "Désinscription réussie." });
    });
};

// ==================== TOUS LES COURS AVEC NOMBRE D'INSCRITS ====================
export const getAllCoursesWithCount = (req, res) => {
    const query = `
        SELECT 
            c.*,
            cat.title AS categorie,
            lvl.title AS niveau,
            u.username AS enseignant,
            COUNT(DISTINCT lec.id_user) AS nb_etudiants
        FROM cours c
        INNER JOIN categorie cat ON c.id_categorie = cat.id
        INNER JOIN level lvl ON c.id_level = lvl.id
        INNER JOIN users u ON c.id_user = u.id
        LEFT JOIN lecture lec ON c.id = lec.id_cours
        WHERE c.status = 'published' AND c.validation_status = 'approved'
        GROUP BY c.id
        ORDER BY c.id DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Erreur getAllCoursesWithCount:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json(results);
    });
};