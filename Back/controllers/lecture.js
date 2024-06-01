import { db } from "../db.js";

export const createLecture = (req, res) => {
    const { avancement , id_cours ,id_user  } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!avancement  || !id_cours  || !id_user  ) {
        return res.status(400).json("Tous les champs sont requis.");
    }
    
    // Vérifier si la lecture est déjà disponible pour cet utilisateur et ce cours
    const checkLectureQuery = "SELECT COUNT(*) AS count FROM lecture WHERE id_cours = ? AND id_user = ?";
    const values = [id_cours, id_user];

    db.query(checkLectureQuery, values, (err, result) => {
        if (err) {
            console.error("Erreur lors de la vérification de la lecture :", err);
            return res.status(500).json("Une erreur s'est produite lors de la vérification de la lecture.");
        }

        const lectureExists = result[0].count > 0;
        if (lectureExists) {
            // La lecture existe déjà pour cet utilisateur et ce cours
            return res.status(200).json("La lecture est déjà disponible.");
        } else {
            // Insérer le lecture dans la base de données
            const insertLectureQuery = "INSERT INTO lecture (avancement , id_cours , id_user ) VALUES (?, ?, ?)";
            const insertValues = [avancement, id_cours ,id_user];

            db.query(insertLectureQuery, insertValues, (err, data) => {
                if (err) {
                    console.error("Erreur lors de la création du lecture :", err);
                    return res.status(500).json("Une erreur s'est produite lors de la création du lecture.");
                }
                return res.status(200).json("Le lecture a été créé avec succès.");
            });
        }
    });
};
export const getLectureCours = (req, res) => {
    const id_cours = req.params.id; 
    
    const selectLectureQuery = "SELECT COUNT(*) AS lectureCount FROM lecture WHERE id_cours = ?";

    db.query(selectLectureQuery, id_cours, (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération des lectures :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des lectures.");
        }

        const lectureCount = result[0].lectureCount;
        return res.status(200).json(lectureCount);
    });
};

export const getTop6CoursesByLecture = (req, res) => {
    const selectTopCoursesQuery = `
    SELECT cours.id AS id_cours, cours.titre, cours.image, 
    COUNT(DISTINCT chapitre.id_chapitre) AS chapterCount, 
    COUNT(DISTINCT lecture.id_cours) AS lectureCount 
    FROM cours LEFT JOIN chapitre ON cours.id = chapitre.id_cours 
    LEFT JOIN lecture ON cours.id = lecture.id_cours 
    GROUP BY cours.id ORDER BY lectureCount DESC LIMIT 6`;

    db.query(selectTopCoursesQuery, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des cours les plus populaires :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des cours les plus populaires.");
        }

        // Renvoyer les résultats contenant les 6 cours les plus populaires avec leurs détails
        return res.status(200).json(results);
    });
};