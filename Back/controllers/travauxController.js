import { db } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration multer directement dans le controller
const uploadDir = path.join(__dirname, '../uploads/travaux');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'travail-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Créer un nouveau travail
export const createTravail = (req, res) => {
    upload.single('fichier')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        const { titre, description, id_activite, id_etudiant, lien } = req.body;
        let fichier = null;
        
        if (req.file) {
            fichier = req.file.filename;
        }
        
        const checkQuery = 'SELECT * FROM travaux_etudiants WHERE id_activite = ? AND id_etudiant = ?';
        db.query(checkQuery, [id_activite, id_etudiant], (err, existing) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erreur lors de la vérification' });
            }
            
            if (existing.length > 0) {
                const updateQuery = `
                    UPDATE travaux_etudiants 
                    SET titre = ?, description = ?, fichier = COALESCE(?, fichier), lien = ?, date_rendu = NOW()
                    WHERE id_activite = ? AND id_etudiant = ?
                `;
                db.query(updateQuery, [titre, description, fichier, lien, id_activite, id_etudiant], (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
                    }
                    res.status(200).json({ message: 'Travail mis à jour avec succès' });
                });
            } else {
                const insertQuery = `
                    INSERT INTO travaux_etudiants (titre, description, fichier, lien, id_activite, id_etudiant, date_rendu)
                    VALUES (?, ?, ?, ?, ?, ?, NOW())
                `;
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

// Récupérer tous les travaux d'une activité - CORRIGÉ pour username
export const getTravauxByActivite = (req, res) => {
    const { activiteId } = req.params;
    
    const query = `
        SELECT t.*, 
               u.username as etudiant_nom, 
               u.email as etudiant_email
        FROM travaux_etudiants t
        LEFT JOIN users u ON t.id_etudiant = u.id
        WHERE t.id_activite = ?
        ORDER BY t.date_rendu DESC
    `;
    
    db.query(query, [activiteId], (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération', details: err.message });
        }
        res.status(200).json(results);
    });
};

// Récupérer le travail d'un étudiant pour une activité - CORRIGÉ
export const getTravauxByActiviteAndEtudiant = (req, res) => {
    const { activiteId, etudiantId } = req.params;
    const query = `
        SELECT t.*, 
               u.username as etudiant_nom,
               u.email as etudiant_email
        FROM travaux_etudiants t
        LEFT JOIN users u ON t.id_etudiant = u.id
        WHERE t.id_activite = ? AND t.id_etudiant = ?
        ORDER BY t.date_rendu DESC
    `;
    db.query(query, [activiteId, etudiantId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }
        res.status(200).json(results);
    });
};

// Récupérer tous les travaux d'un étudiant
export const getTravauxByEtudiant = (req, res) => {
    const { etudiantId } = req.params;
    const query = `
        SELECT t.*, a.titre as activite_titre
        FROM travaux_etudiants t
        JOIN activite a ON t.id_activite = a.id
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
            fichier = req.file.filename;
        }
        
        let query = '';
        let params = [];
        
        if (fichier) {
            query = `
                UPDATE travaux_etudiants 
                SET titre = ?, description = ?, fichier = ?, lien = ?, date_rendu = NOW()
                WHERE id = ?
            `;
            params = [titre, description, fichier, lien, id];
        } else {
            query = `
                UPDATE travaux_etudiants 
                SET titre = ?, description = ?, lien = ?, date_rendu = NOW()
                WHERE id = ?
            `;
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

// Noter un travail
export const noterTravail = (req, res) => {
    const { id } = req.params;
    const { note, commentaire } = req.body;
    
    const query = 'UPDATE travaux_etudiants SET note = ?, commentaire = ? WHERE id = ?';
    db.query(query, [note, commentaire || null, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de l\'attribution de la note' });
        }
        res.status(200).json({ message: 'Note attribuée avec succès' });
    });
};

// Supprimer un travail
export const deleteTravail = (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT fichier FROM travaux_etudiants WHERE id = ?', [id], (err, travail) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }
        
        if (travail[0] && travail[0].fichier) {
            const filePath = path.join(__dirname, '../uploads/travaux', travail[0].fichier);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        const query = 'DELETE FROM travaux_etudiants WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erreur lors de la suppression' });
            }
            res.status(200).json({ message: 'Travail supprimé avec succès' });
        });
    });
};

// Télécharger un fichier
export const getFichier = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/travaux', filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Fichier non trouvé' });
    }
};

