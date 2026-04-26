import { db } from "../db.js";

export const createCertificate = (req, res) => {
    const { idCours, idUser, note } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!idCours || !idUser || !note) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    // Vérifier si un certificat existe déjà pour cette combinaison
    const checkCertificateQuery = "SELECT * FROM Certificat WHERE idCours = ? AND idUser = ?";
    const checkCertificateValues = [idCours, idUser];

    db.query(checkCertificateQuery, checkCertificateValues, (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Erreur lors de la vérification du certificat existant :", checkErr);
            return res.status(500).json({ error: "Erreur serveur lors de la vérification." });
        }

        if (checkResult.length > 0) {
            // Un certificat existe déjà - le supprimer d'abord
            const deleteCertificateQuery = "DELETE FROM Certificat WHERE idCours = ? AND idUser = ?";
            db.query(deleteCertificateQuery, checkCertificateValues, (deleteErr, deleteResult) => {
                if (deleteErr) {
                    console.error("Erreur lors de la suppression du certificat existant :", deleteErr);
                    return res.status(500).json({ error: "Erreur lors de la suppression du certificat." });
                }
                // Créer un nouveau certificat
                createNewCertificate();
            });
        } else {
            // Aucun certificat existant, créer un nouveau
            createNewCertificate();
        }
    });

    function createNewCertificate() {
        const insertCertificateQuery = "INSERT INTO Certificat (idCours, idUser, note, date_obtention) VALUES (?, ?, ?, NOW())";
        const insertCertificateValues = [idCours, idUser, note];

        db.query(insertCertificateQuery, insertCertificateValues, (insertErr, insertResult) => {
            if (insertErr) {
                console.error("Erreur lors de la création du certificat :", insertErr);
                return res.status(500).json({ error: "Erreur lors de la création du certificat." });
            }
            return res.status(201).json({ 
                message: "Le certificat a été créé avec succès.",
                id: insertResult.insertId 
            });
        });
    }
};

export const getCertificateByIds = (req, res) => {
    const { idCours, idUser } = req.params;

    // Vérifier si les IDs sont fournis
    if (!idCours || !idUser) {
        return res.status(400).json({ error: "Les ID de cours et d'utilisateur sont requis." });
    }

    // Requête SQL corrigée - Utiliser id_categorie au lieu de categorie
    const getCertificateQuery = `
        SELECT Certificat.*, 
               Cours.titre AS titreCours, 
               cat.title AS typeCours, 
               lvl.title AS level, 
               Users.username,
               Users.email
        FROM Certificat 
        INNER JOIN Cours ON Certificat.idCours = Cours.id
        INNER JOIN categorie AS cat ON Cours.id_categorie = cat.id
        INNER JOIN level AS lvl ON Cours.id_level = lvl.id
        INNER JOIN Users ON Certificat.idUser = Users.id
        WHERE Certificat.idCours = ? AND Certificat.idUser = ?
    `;

    const getCertificateValues = [idCours, idUser];

    db.query(getCertificateQuery, getCertificateValues, (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération du certificat :", err);
            return res.status(500).json({ error: "Erreur serveur lors de la récupération." });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Aucun certificat trouvé pour cette combinaison." });
        }
        return res.status(200).json(result[0]);
    });
};

// Récupérer tous les certificats d'un utilisateur
export const getCertificatesByUser = (req, res) => {
    const { idUser } = req.params;

    if (!idUser) {
        return res.status(400).json({ error: "L'ID utilisateur est requis." });
    }

    const query = `
        SELECT Certificat.*, 
               Cours.titre AS titreCours, 
               cat.title AS typeCours, 
               lvl.title AS level
        FROM Certificat 
        INNER JOIN Cours ON Certificat.idCours = Cours.id
        INNER JOIN categorie AS cat ON Cours.id_categorie = cat.id
        INNER JOIN level AS lvl ON Cours.id_level = lvl.id
        WHERE Certificat.idUser = ?
        ORDER BY Certificat.date_obtention DESC
    `;

    db.query(query, [idUser], (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération des certificats :", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json(result);
    });
};

// Vérifier si un utilisateur a un certificat pour un cours
export const checkCertificateExists = (req, res) => {
    const { idCours, idUser } = req.params;

    if (!idCours || !idUser) {
        return res.status(400).json({ error: "ID cours et ID utilisateur requis." });
    }

    const query = "SELECT * FROM Certificat WHERE idCours = ? AND idUser = ?";
    
    db.query(query, [idCours, idUser], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        return res.status(200).json({ exists: result.length > 0 });
    });
};

// Supprimer un certificat
export const deleteCertificate = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "L'ID du certificat est requis." });
    }

    const query = "DELETE FROM Certificat WHERE id = ?";
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la suppression:", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Certificat non trouvé." });
        }
        return res.status(200).json({ message: "Certificat supprimé avec succès." });
    });
};