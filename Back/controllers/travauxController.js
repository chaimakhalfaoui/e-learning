import { db } from '../db.js';
import { createS3Upload } from "../middleware/s3upload.js";

// Configuration S3 upload
const upload = createS3Upload("uploads/travaux", { fileSize: 50 * 1024 * 1024 });

// Créer un nouveau travail
export const createTravail = (req, res) => {
    upload.single('fichier')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        const { titre, description, id_activite, id_etudiant, lien } = req.body;
        let fichier = null;
        if (req.file) {
            fichier = req.file.location; // S3 URL
        }
        const checkQuery = 'SELECT * FROM travaux_etudiants WHERE id_activite = ? AND id_etudiant = ?';
        db.query(checkQuery, [id_activite, id_etudiant], (err, existing) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erreur lors de la vérification' });
            }
            if (existing.length > 0) {
                const updateQuery = 
                    `UPDATE travaux_etudiants
                    SET titre = ?, description = ?, fichier = COALESCE(?, fichier), lien = ?, date_rendu = NOW()
                    WHERE id_activite = ? AND id_etudiant = ?`;
                db.query(updateQuery, [titre, description, fichier, lien, id_activite, id_etudiant], (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
                    }
                    res.status(200).json({ message: 'Travail mis à jour avec succès' });
                });
            } else {
                const insertQuery = 
                    `INSERT INTO travaux_etudiants (titre, description, fichier, lien, id_activite, id_etudiant, date_rendu)
                    VALUES (?, ?, ?, ?, ?, ?, NOW())`;
                db.query(insertQuery, [titre, description, fichier, lien, id_activite, id_etudiant], (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Erreur lors de la création' });
                    }
                    res.status(201).json({ message: 'Travail créé avec succès', id: result.insertId });
                });
            }
        });
    });
};

// Récupérer tous les travaux d'un étudiant
export const getTravauxByEtudiant = (req, res) => {
    const { etudiantId } = req.params;
    const query = `
        SELECT t.*, a.titre as activite_titre, a.description as activite_description
        FROM travaux_etudiants t
        INNER JOIN activite a ON t.id_activite = a.id
        WHERE t.id_etudiant = ?
        ORDER BY t.date_rendu DESC
    `;
    db.query(query, [etudiantId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }
        res.status(200).json(results);
    });
};

// Récupérer tous les travaux d'une activité
export const getTravauxByActivite = (req, res) => {
    const { activiteId } = req.params;
    const query = `
        SELECT t.*, u.username, u.email
        FROM travaux_etudiants t
        INNER JOIN users u ON t.id_etudiant = u.id
        WHERE t.id_activite = ?
        ORDER BY t.date_rendu DESC
    `;
    db.query(query, [activiteId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }
        res.status(200).json(results);
    });
};

// Mettre à jour un travail
export const updateTravail = (req, res) => {
    upload.single('fichier')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        const { id } = req.params;
        const { titre, description, lien } = req.body;
        let fichier = null;
        if (req.file) {
            fichier = req.file.location; // S3 URL
        }
        let query = '';
        let params = [];
        if (fichier) {
            query = 
                `UPDATE travaux_etudiants
                SET titre = ?, description = ?, fichier = ?, lien = ?, date_rendu = NOW()
                WHERE id = ?`;
            params = [titre, description, fichier, lien, id];
        } else {
            query = 
                `UPDATE travaux_etudiants
                SET titre = ?, description = ?, lien = ?, date_rendu = NOW()
                WHERE id = ?`;
            params = [titre, description, lien, id];
        }
        db.query(query, params, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
            }
            res.status(200).json({ message: 'Travail mis à jour avec succès' });
        });
    });
};

// Supprimer un travail
export const deleteTravail = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM travaux_etudiants WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
        res.status(200).json({ message: 'Travail supprimé avec succès' });
    });
};

// Télécharger un fichier (redirection vers S3)
export const getFichier = (req, res) => {
    const { filename } = req.params;
    // Rediriger vers l'URL S3
    const s3Url = `https://isetso-uploads-972224594125.s3.us-east-1.amazonaws.com/uploads/travaux/${filename}`;
    res.redirect(s3Url);
};

// Récupérer un travail par ID
export const getTravailById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM travaux_etudiants WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Travail non trouvé' });
        }
        res.status(200).json(results[0]);
    });
};

// Récupérer les travaux par activité et étudiant
export const getTravauxByActiviteAndEtudiant = (req, res) => {
    const { activiteId, etudiantId } = req.params;
    const query = 'SELECT * FROM travaux_etudiants WHERE id_activite = ? AND id_etudiant = ? ORDER BY date_rendu DESC';
    db.query(query, [activiteId, etudiantId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }
        res.status(200).json(results);
    });
};

// Noter un travail
export const noterTravail = (req, res) => {
    const { id } = req.params;
    const { note, commentaire } = req.body;
    const query = 'UPDATE travaux_etudiants SET note = ?, commentaire_enseignant = ?, date_note = NOW() WHERE id = ?';
    db.query(query, [note, commentaire, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la notation' });
        }
        res.status(200).json({ message: 'Travail noté avec succès' });
    });
};
