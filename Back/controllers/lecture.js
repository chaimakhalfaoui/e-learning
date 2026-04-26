import { db } from "../db.js";

export const createLecture = (req, res) => {
    const { avancement, id_cours, id_user } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!id_cours || !id_user) {
        return res.status(400).json({ error: "L'ID du cours et l'ID de l'utilisateur sont requis." });
    }
    
    // Vérifier si la lecture est déjà disponible pour cet utilisateur et ce cours
    const checkLectureQuery = "SELECT COUNT(*) AS count FROM lecture WHERE id_cours = ? AND id_user = ?";
    const values = [id_cours, id_user];

    db.query(checkLectureQuery, values, (err, result) => {
        if (err) {
            console.error("Erreur lors de la vérification de la lecture :", err);
            return res.status(500).json({ error: "Une erreur s'est produite lors de la vérification de la lecture." });
        }

        const lectureExists = result[0].count > 0;
        if (lectureExists) {
            // La lecture existe déjà pour cet utilisateur et ce cours
            return res.status(200).json({ message: "La lecture est déjà disponible.", exists: true });
        } else {
            // Insérer la lecture dans la base de données
            const avancementValue = avancement !== undefined && avancement !== null ? avancement : 0;
            const insertLectureQuery = "INSERT INTO lecture (avancement, id_cours, id_user) VALUES (?, ?, ?)";
            const insertValues = [avancementValue, id_cours, id_user];

            db.query(insertLectureQuery, insertValues, (err, data) => {
                if (err) {
                    console.error("Erreur lors de la création de la lecture :", err);
                    return res.status(500).json({ error: "Une erreur s'est produite lors de la création de la lecture." });
                }
                return res.status(200).json({ message: "La lecture a été créée avec succès.", id: data.insertId });
            });
        }
    });
};

export const getLectureCours = (req, res) => {
    const id_cours = req.params.id;
    
    if (!id_cours) {
        return res.status(400).json({ error: "ID du cours requis." });
    }
    
    const selectLectureQuery = "SELECT COUNT(*) AS lectureCount FROM lecture WHERE id_cours = ?";

    db.query(selectLectureQuery, [id_cours], (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération des lectures :", err);
            return res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des lectures." });
        }

        const lectureCount = result[0].lectureCount;
        return res.status(200).json(lectureCount);
    });
};

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
        return res.status(200).json({ isEnrolled: result[0].count > 0 });
    });
};

export const getTop6CoursesByLecture = (req, res) => {
    const selectTopCoursesQuery = `
        SELECT 
            cours.id AS id_cours, 
            cours.titre, 
            cours.image,
            cours.duration,
            cours.description,
            cat.title AS categorie,
            COUNT(DISTINCT chapitre.id_chapitre) AS chapterCount, 
            COUNT(DISTINCT lecture.id_cours) AS lectureCount 
        FROM cours 
        LEFT JOIN chapitre ON cours.id = chapitre.id_cours 
        LEFT JOIN lecture ON cours.id = lecture.id_cours 
        WHERE cours.status = 'published' AND cours.validation_status = 'approved'
        GROUP BY cours.id 
        ORDER BY lectureCount DESC 
        LIMIT 6
    `;

    db.query(selectTopCoursesQuery, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des cours les plus populaires :", err);
            return res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des cours les plus populaires." });
        }

        return res.status(200).json(results);
    });
};

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
            COALESCE(a.avc, 0) AS progression
        FROM lecture l
        INNER JOIN cours c ON l.id_cours = c.id
        INNER JOIN categorie cat ON c.id_categorie = cat.id
        LEFT JOIN avc a ON c.id = a.idCours AND a.iduser = ?
        WHERE l.id_user = ? AND c.status = 'published'
        ORDER BY l.id DESC
    `;
    
    db.query(query, [id_user, id_user], (err, data) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json(data);
    });
};