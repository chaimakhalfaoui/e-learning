// controllers/chapitre.js - Version corrigée

import { db } from "../db.js";

export const createChapitre = (req, res) => {
    const { nom_chapitre, id_cours } = req.body;

    if (!nom_chapitre || !id_cours) {
        return res.status(400).json("Tous les champs sont requis.");
    }

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

// Récupérer un chapitre par son ID (corrigé)
export const getChapitreById = (req, res) => {
    const id_chapitre = req.params.id;
    
    const selectChapitreQuery = "SELECT * FROM chapitre WHERE id_chapitre = ?";
    
    db.query(selectChapitreQuery, [id_chapitre], (err, data) => {
        if (err) {
            console.error("Error retrieving chapitre:", err);
            return res.status(500).json("An error occurred while retrieving chapitre.");
        }
        if (data.length === 0) {
            return res.status(404).json("Chapitre non trouvé.");
        }
        return res.status(200).json(data[0]);
    });
};

// Récupérer tous les chapitres d'un cours (conserve l'ancienne fonction)
export const getChapitresByCours = (req, res) => {
    const id_cours = req.params.id;
    
    const selectCoursesQuery = "SELECT * FROM chapitre WHERE id_cours = ?";

    db.query(selectCoursesQuery, [id_cours], (err, data) => {
        if (err) {
            console.error("Error retrieving chapitres:", err);
            return res.status(500).json("An error occurred while retrieving chapitres.");
        }
        return res.status(200).json(data);
    });
};

// Récupérer un chapitre (essaye les deux méthodes)
export const getChapitre = (req, res) => {
    const id = req.params.id;
    
    // Essayer d'abord comme id_chapitre
    const queryById = "SELECT * FROM chapitre WHERE id_chapitre = ?";
    
    db.query(queryById, [id], (err, data) => {
        if (err) {
            console.error("Error retrieving chapitre:", err);
            return res.status(500).json("An error occurred while retrieving chapitre.");
        }
        
        if (data.length > 0) {
            return res.status(200).json(data[0]);
        }
        
        // Si pas trouvé, essayer comme id_cours
        const queryByCours = "SELECT * FROM chapitre WHERE id_cours = ?";
        db.query(queryByCours, [id], (err, data2) => {
            if (err) {
                console.error("Error retrieving chapitre:", err);
                return res.status(500).json("An error occurred while retrieving chapitre.");
            }
            
            if (data2.length > 0) {
                // Retourner le premier chapitre du cours
                return res.status(200).json(data2[0]);
            }
            
            return res.status(404).json("Chapitre non trouvé.");
        });
    });
};

export const getChapitreAndActivite = (req, res) => {
    const id_cours = req.params.id;

    const selectChapitresQuery = "SELECT * FROM chapitre WHERE id_cours = ?";
    db.query(selectChapitresQuery, [id_cours], (errChapitres, chapitresData) => {
        if (errChapitres) {
            console.error("Erreur lors de la récupération des chapitres :", errChapitres);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des chapitres.");
        }

        const chapitresWithActivites = [];
        let completedQueries = 0;

        if (chapitresData.length === 0) {
            return res.status(200).json([]);
        }

        chapitresData.forEach((chapitre, index) => {
            const selectActivitesQuery = "SELECT * FROM activite WHERE id_chapitre = ?";
            db.query(selectActivitesQuery, [chapitre.id_chapitre], (errActivites, activitesData) => {
                if (errActivites) {
                    console.error("Erreur lors de la récupération des activités:", errActivites);
                    return res.status(500).json("Une erreur s'est produite lors de la récupération des activités.");
                }

                chapitre.activites = activitesData;
                chapitresWithActivites.push(chapitre);
                completedQueries++;

                if (completedQueries === chapitresData.length) {
                    return res.status(200).json(chapitresWithActivites);
                }
            });
        });
    });
};

export const deleteChapitre = (req, res) => {
    const id_chapitre = req.params.id;

    db.beginTransaction(err => {
        if (err) {
            console.error("Erreur lors du début de la transaction :", err);
            return res.status(500).json("Une erreur s'est produite lors du début de la transaction.");
        }

        const deleteActivitesQuery = "DELETE FROM activite WHERE id_chapitre = ?";
        db.query(deleteActivitesQuery, [id_chapitre], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Erreur lors de la suppression des activités :", err);
                    return res.status(500).json("Une erreur s'est produite lors de la suppression des activités.");
                });
            }

            const deleteChapitreQuery = "DELETE FROM chapitre WHERE id_chapitre = ?";
            db.query(deleteChapitreQuery, [id_chapitre], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Erreur lors de la suppression du chapitre :", err);
                        return res.status(500).json("Une erreur s'est produite lors de la suppression du chapitre.");
                    });
                }

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

    if (!nom_chapitre) {
        return res.status(400).json("Le nom du chapitre est requis.");
    }

    const updateChapitreQuery = "UPDATE chapitre SET nom_chapitre = ? WHERE id_chapitre = ?";
    const values = [nom_chapitre, id_chapitre];

    db.query(updateChapitreQuery, values, (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du chapitre :", err);
            return res.status(500).json("Une erreur s'est produite lors de la mise à jour du chapitre.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).json("Aucun chapitre trouvé avec cet ID.");
        }

        return res.status(200).json({ message: "Le chapitre a été mis à jour avec succès." });
    });
};