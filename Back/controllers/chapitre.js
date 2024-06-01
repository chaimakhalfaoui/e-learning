import { db } from "../db.js";

export const createChapitre = (req, res) => {
    const { nom_chapitre, id_cours } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!nom_chapitre || !id_cours) {
        return res.status(400).json("Tous les champs sont requis.");
    }

    // Insérer le chapitre dans la base de données
    const insertChapitreQuery = "INSERT INTO chapitre (nom_chapitre, id_cours) VALUES (?, ?)";
    const values = [nom_chapitre, id_cours];

    db.query(insertChapitreQuery, values, (err, data) => {
        if (err) {
            console.error("Erreur lors de la création du chapitre :", err);
            return res.status(500).json("Une erreur s'est produite lors de la création du chapitre.");
        }
        return res.status(200).json("Le chapitre a été créé avec succès.");
    });
};

export const getChapitre = (req, res) => {
    const id_cours = req.params.id; 
    
    const selectCoursesQuery = "SELECT * FROM chapitre WHERE id_cours = ?";

    db.query(selectCoursesQuery, id_cours, (err, data) => {
        if (err) {
            console.error("Error retrieving chapitres:", err);
            return res.status(500).json("An error occurred while retrieving chapitres.");
        }

        return res.status(200).json(data);
    });
};


export const getChapitreAndActivite = (req, res) => {
    const id_cours = req.params.id;

    // Sélectionner tous les chapitres du cours en fonction de l'id_cours
    const selectChapitresQuery = "SELECT * FROM chapitre WHERE id_cours = ?";
    db.query(selectChapitresQuery, id_cours, (errChapitres, chapitresData) => {
        if (errChapitres) {
            console.error("Erreur lors de la récupération des chapitres :", errChapitres);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des chapitres.");
        }

        // Pour chaque chapitre, récupérer toutes les activités associées
        const chapitresWithActivites = [];

        const getActivitesForChapitre = (chapitre, index) => {
            const selectActivitesQuery = "SELECT * FROM activite WHERE id_chapitre = ?";
            db.query(selectActivitesQuery, chapitre.id_chapitre, (errActivites, activitesData) => {
                if (errActivites) {
                    console.error("Erreur lors de la récupération des activités pour le chapitre", chapitre.id_chapitre, ":", errActivites);
                    return res.status(500).json("Une erreur s'est produite lors de la récupération des activités.");
                }

                // Ajouter les activités récupérées au chapitre correspondant
                chapitre.activites = activitesData;

                // Ajouter le chapitre avec ses activités au tableau
                chapitresWithActivites.push(chapitre);

                // Si toutes les activités de tous les chapitres ont été récupérées, retourner les résultats
                if (index === chapitresData.length - 1) {
                    return res.status(200).json(chapitresWithActivites);
                }
            });
        };

        // Pour chaque chapitre, récupérer toutes les activités associées
        chapitresData.forEach((chapitre, index) => {
            getActivitesForChapitre(chapitre, index);
        });
    });
};


export const deleteChapitre = (req, res) => {
    const id_chapitre = req.params.id;

    // Commencer une transaction pour garantir que toutes les suppressions sont atomiques
    db.beginTransaction(err => {
        if (err) {
            console.error("Erreur lors du début de la transaction :", err);
            return res.status(500).json("Une erreur s'est produite lors du début de la transaction.");
        }

        // Supprimer toutes les activités associées au chapitre
        const deleteActivitesQuery = "DELETE FROM activite WHERE id_chapitre = ?";
        db.query(deleteActivitesQuery, [id_chapitre], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Erreur lors de la suppression des activités :", err);
                    return res.status(500).json("Une erreur s'est produite lors de la suppression des activités.");
                });
            }

            // Supprimer le chapitre lui-même
            const deleteChapitreQuery = "DELETE FROM chapitre WHERE id_chapitre = ?";
            db.query(deleteChapitreQuery, [id_chapitre], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Erreur lors de la suppression du chapitre :", err);
                        return res.status(500).json("Une erreur s'est produite lors de la suppression du chapitre.");
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

                    return res.status(200).json({ message: "Le chapitre et ses activités associées ont été supprimés avec succès." });
                });
            });
        });
    });
};

export const updateChapitre = (req, res) => {
    const id_chapitre = req.params.id;
    const { nom_chapitre } = req.body;

    // Vérifier si le nom du chapitre est fourni
    if (!nom_chapitre) {
        return res.status(400).json("Le nom du chapitre est requis.");
    }

    // Mettre à jour le chapitre dans la base de données
    const updateChapitreQuery = "UPDATE chapitre SET nom_chapitre = ? WHERE id_chapitre = ?";
    const values = [nom_chapitre, id_chapitre];

    db.query(updateChapitreQuery, values, (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du chapitre :", err);
            return res.status(500).json("Une erreur s'est produite lors de la mise à jour du chapitre.");
        }

        // Vérifier si un chapitre a été mis à jour
        if (result.affectedRows === 0) {
            return res.status(404).json("Aucun chapitre trouvé avec cet ID.");
        }

        return res.status(200).json({ message: "Le chapitre a été mis à jour avec succès." });
    });
};