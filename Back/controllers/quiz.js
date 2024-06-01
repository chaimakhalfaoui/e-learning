import { db } from "../db.js";

export const createQuiz = (req, res) => {
    const { titre, duree,id_cours } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!titre || !duree || !id_cours) {
        return res.status(400).json("Tous les champs sont requis.");
    }

    // Insérer le quiz dans la base de données
    const insertQuizQuery = "INSERT INTO quiz (titre, duree, id_cours) VALUES (?, ?, ?)";
    const values = [titre,duree, id_cours];

    db.query(insertQuizQuery, values, (err, data) => {
        if (err) {
            console.error("Erreur lors de la création du quiz :", err);
            return res.status(500).json("Une erreur s'est produite lors de la création du quiz.");
        }
        return res.status(200).json("Le quiz a été créé avec succès.");
    });
};


export const getQuiz = (req, res) => {
    const id_cours = req.params.id; 
    
    const selectCoursesQuery = "SELECT * FROM quiz WHERE id_cours = ?";

    db.query(selectCoursesQuery, id_cours, (err, data) => {
        if (err) {
            console.error("Error retrieving quiz:", err);
            return res.status(500).json("An error occurred while retrieving quiz.");
        }

        return res.status(200).json(data);
    });
};

export const getQuizId = (req, res) => {
    const id = req.params.id; 
    
    const selectCoursesQuery = "SELECT * FROM quiz WHERE id = ?";

    db.query(selectCoursesQuery, id, (err, data) => {
        if (err) {
            console.error("Error retrieving quiz:", err);
            return res.status(500).json("An error occurred while retrieving quiz.");
        }

        return res.status(200).json(data);
    });
};

export const deleteQuiz = (req, res) => {
    const id_quiz = req.params.id;

    // Commencez une transaction pour assurer que toutes les suppressions soient atomiques
    db.beginTransaction(err => {
        if (err) {
            console.error("Erreur lors du début de la transaction :", err);
            return res.status(500).json("Une erreur s'est produite lors du début de la transaction.");
        }

        // Supprimer toutes les questions associées au quiz
        const deleteQuestionsQuery = "DELETE FROM question WHERE id_quiz = ?";
        db.query(deleteQuestionsQuery, [id_quiz], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Erreur lors de la suppression des questions associées au quiz :", err);
                    return res.status(500).json("Une erreur s'est produite lors de la suppression des questions associées au quiz.");
                });
            }

            // Maintenant que toutes les questions sont supprimées, supprimez le quiz lui-même
            const deleteQuizQuery = "DELETE FROM quiz WHERE id = ?";
            db.query(deleteQuizQuery, [id_quiz], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Erreur lors de la suppression du quiz :", err);
                        return res.status(500).json("Une erreur s'est produite lors de la suppression du quiz.");
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

                    // Vérifier si un quiz a été supprimé
                    if (result.affectedRows === 0) {
                        return res.status(404).json("Aucun quiz trouvé avec cet ID.");
                    }

                    return res.status(200).json({ message: "Le quiz et ses questions associées ont été supprimés avec succès." });
                });
            });
        });
    });
};

export const updateQuiz = (req, res) => {
    const id_quiz = req.params.id;
    const { titre, duree } = req.body;

    // Vérifier si le titre et la durée du quiz sont fournis
    if (!titre || !duree) {
        return res.status(400).json("Le titre et la durée du quiz sont requis.");
    }

    // Mettre à jour le quiz dans la base de données
    const updateQuizQuery = "UPDATE quiz SET titre = ?, duree = ? WHERE id = ?";
    const values = [titre, duree, id_quiz];

    db.query(updateQuizQuery, values, (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du quiz :", err);
            return res.status(500).json("Une erreur s'est produite lors de la mise à jour du quiz.");
        }

        // Vérifier si un quiz a été mis à jour
        if (result.affectedRows === 0) {
            return res.status(404).json("Aucun quiz trouvé avec cet ID.");
        }

        return res.status(200).json({ message: "Le quiz a été mis à jour avec succès." });
    });
};