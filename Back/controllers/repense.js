import { db } from "../db.js";

export const createRepense = (req, res) => {
    const { resultat, idquestion, idUser } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!resultat || !idquestion || !idUser) {
        return res.status(400).json("Tous les champs sont requis.");
    }

    // Récupérer la réponse correcte de la question associée
    const selectCorrectAnswerQuery = "SELECT reponse_correcte FROM question WHERE id = ?";
    db.query(selectCorrectAnswerQuery, [idquestion], (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération de la réponse correcte de la question :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération de la réponse correcte de la question.");
        }

        // Vérifier si la réponse est correcte
        const reponseCorrecte = result[0]?.reponse_correcte;
        const isCorrect = (reponseCorrecte === resultat) ? "true" : "false";

        // Insérer la réponse dans la base de données avec le résultat de vérification
        const insertReponseQuery = "INSERT INTO reponse (resultat, idquestion, idUser) VALUES (?, ?, ?)";
        const values = [isCorrect, idquestion, idUser];

        db.query(insertReponseQuery, values, (err, data) => {
            if (err) {
                console.error("Erreur lors de l'enregistrement de la réponse :", err);
                return res.status(500).json("Une erreur s'est produite lors de la création de la réponse.");
            }
            return res.status(200).json("La réponse a été créée avec succès.");
        });
    });
};

export const fetchFirstFalseResponseQuestion = (req, res) => {
    const { idQuiz, idUser } = req.params;

    // Sélectionner la première question qui n'a pas de correspondance dans la table "reponse" avec le même "idquestion" et "idUser"
    const selectFirstFalseResponseQuery = `
        SELECT * 
        FROM question 
        WHERE id_quiz = ? 
        AND id NOT IN (
            SELECT idquestion 
            FROM reponse 
            WHERE idUser = ?
        ) 
        LIMIT 1`;

    db.query(selectFirstFalseResponseQuery, [idQuiz, idUser], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération de la première question sans réponse :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération de la première question sans réponse.");
        }

        // Vérifier si une question sans réponse a été trouvée
        if (data.length === 0) {
            return res.status(200).json(0);
        }

        // Renvoyer la première question sans réponse
        const firstQuestionWithoutResponse = data[0];
        return res.status(200).json(firstQuestionWithoutResponse);
    });
};


export const getQuizScore = (req, res) => {
    const { idQuiz, idUser } = req.params;

    calculateQuizScore(idQuiz, idUser)
        .then(({ correctResponses, scorePercentage }) => {
            res.status(200).json({ correctResponses, scorePercentage });
        })
        .catch(error => {
            console.error("Erreur lors du calcul du score du quiz :", error);
            res.status(500).json("Une erreur s'est produite lors du calcul du score du quiz.");
        });
};

const calculateQuizScore = (idQuiz, idUser) => {
    return new Promise((resolve, reject) => {
        // Sélectionner toutes les réponses de l'utilisateur pour le quiz spécifié
        const selectUserResponsesQuery = `
            SELECT resultat
            FROM reponse
            INNER JOIN question ON reponse.idquestion = question.id
            WHERE question.id_quiz = ? AND reponse.idUser = ?`;

        db.query(selectUserResponsesQuery, [idQuiz, idUser], (err, userResponses) => {
            if (err) {
                console.error("Erreur lors de la récupération des réponses de l'utilisateur :", err);
                return reject("Une erreur s'est produite lors du calcul du score du quiz.");
            }

            // Compter le nombre total de réponses et le nombre de réponses correctes
            let totalResponses = 0;
            let correctResponses = 0;

            userResponses.forEach(response => {
                totalResponses++;
                if (response.resultat === "true") {
                    correctResponses++;
                }
            });

            // Calculer le pourcentage de réponses correctes
            const scorePercentage = (correctResponses / totalResponses) * 100;

            // Renvoyer le nombre de réponses correctes et le pourcentage de réponses correctes
            resolve({ correctResponses, scorePercentage });
        });
    });
};


export const deleteResponsesByQuizAndUser = (req, res) => {
    const { idQuiz, idUser } = req.params;

    // Vérifier si les identifiants de quiz et d'utilisateur sont fournis
    if (!idQuiz || !idUser) {
        return res.status(400).json("Les identifiants de quiz et d'utilisateur sont requis.");
    }

    // Récupérer l'ID du cours associé à l'ID du quiz
    const getCoursIdQuery = "SELECT id_cours FROM quiz WHERE id = ?";
    db.query(getCoursIdQuery, [idQuiz], (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération de l'ID du cours :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération de l'ID du cours.");
        }

        if (result.length === 0) {
            return res.status(404).json("Aucun cours n'est associé à l'ID du quiz fourni.");
        }

        const idCours = result[0].id_cours;

        // Commencer une transaction
        db.beginTransaction((err) => {
            if (err) {
                console.error("Erreur lors du démarrage de la transaction :", err);
                return res.status(500).json("Une erreur s'est produite lors du démarrage de la transaction.");
            }

            // Vérifier si un certificat existe pour cet utilisateur et ce cours
            const checkCertificateQuery = "SELECT id FROM Certificat WHERE idCours = ? AND idUser = ?";
            db.query(checkCertificateQuery, [idCours, idUser], (err, certificate) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Erreur lors de la vérification du certificat existant :", err);
                        return res.status(500).json("Une erreur s'est produite lors de la vérification du certificat existant.");
                    });
                }

                // Si un certificat existe, le supprimer
                if (certificate.length > 0) {
                    const deleteCertificateQuery = "DELETE FROM Certificat WHERE idCours = ? AND idUser = ?";
                    db.query(deleteCertificateQuery, [idCours, idUser], (err, result) => {
                        if (err) {
                            console.error("Erreur lors de la suppression du certificat :", err);
                            return db.rollback(() => {
                                res.status(500).json("Une erreur s'est produite lors de la suppression du certificat.");
                            });
                        }
                    });
                }

                // Récupérer les identifiants des questions associées à l'identifiant du quiz
                const selectQuestionsQuery = "SELECT id FROM question WHERE id_quiz = ?";
                db.query(selectQuestionsQuery, [idQuiz], (err, questions) => {
                    if (err) {
                        console.error("Erreur lors de la récupération des questions du quiz :", err);
                        return db.rollback(() => {
                            res.status(500).json("Une erreur s'est produite lors de la récupération des questions du quiz.");
                        });
                    }

                    // Si aucune question n'est associée à l'identifiant du quiz, retourner un message
                    if (questions.length === 0) {
                        return res.status(404).json("Aucune question n'est associée à l'identifiant de quiz fourni.");
                    }

                    // Créer un tableau d'identifiants de questions à partir des résultats de la requête
                    const questionIds = questions.map(question => question.id);

                    // Vérifier si le tableau questionIds n'est pas vide
                    if (questionIds.length === 0) {
                        return res.status(404).json("Aucune question n'est associée à l'identifiant de quiz fourni.");
                    }

                    // Supprimer toutes les réponses de l'utilisateur associées à ces questions
                    const deleteResponsesQuery = "DELETE FROM reponse WHERE idquestion IN (?) AND idUser = ?";
                    db.query(deleteResponsesQuery, [questionIds, idUser], (err, result) => {
                        if (err) {
                            console.error("Erreur lors de la suppression des réponses :", err);
                            return db.rollback(() => {
                                res.status(500).json("Une erreur s'est produite lors de la suppression des réponses.");
                            });
                        }
                        
                        // Valider la transaction
                        db.commit((err) => {
                            if (err) {
                                console.error("Erreur lors de la validation de la transaction :", err);
                                return db.rollback(() => {
                                    res.status(500).json("Une erreur s'est produite lors de la validation de la transaction.");
                                });
                            }
                            
                            return res.status(200).json("Toutes les réponses pour le quiz ont été supprimées avec succès.");
                        });
                    });
                });
            });
        });
    });
};


export const createFalseResponsesForUnansweredQuestions = (req, res) => {
    const { idQuiz, idUser } = req.params;

    // Vérifier si les identifiants de quiz et d'utilisateur sont fournis
    if (!idQuiz || !idUser) {
        return res.status(400).json("Les identifiants de quiz et d'utilisateur sont requis.");
    }

    // Sélectionner toutes les questions du quiz auxquelles l'utilisateur n'a pas répondu
    const selectUnansweredQuestionsQuery = `
        SELECT q.id AS questionId
        FROM question q
        LEFT JOIN reponse r ON q.id = r.idquestion AND r.idUser = ?
        WHERE q.id_quiz = ? AND r.id IS NULL`;

    db.query(selectUnansweredQuestionsQuery, [idUser, idQuiz], (err, questions) => {
        if (err) {
            console.error("Erreur lors de la récupération des questions non répondues :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des questions non répondues.");
        }

        // Vérifier si des questions non répondues ont été trouvées
        if (questions.length === 0) {
            return res.status(200).json("Aucune question non répondue n'a été trouvée pour ce quiz et cet utilisateur.");
        }

        // Créer une réponse avec un résultat "false" pour chaque question non répondue
        const insertResponsesQuery = "INSERT INTO reponse (resultat, idquestion, idUser) VALUES ?";
        const values = questions.map(question => ["false", question.questionId, idUser]);

        db.query(insertResponsesQuery, [values], (err, result) => {
            if (err) {
                console.error("Erreur lors de l'enregistrement des réponses :", err);
                return res.status(500).json("Une erreur s'est produite lors de la création des réponses.");
            }

            return res.status(200).json("Les réponses ont été créées avec succès.");
        });
    });
};