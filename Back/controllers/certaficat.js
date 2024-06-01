import { db } from "../db.js";


export const createCertificate = (req, res) => {
    const { idCours, idUser, note } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!idCours || !idUser || !note ) {
        return res.status(400).json("Tous les champs sont requis.");
    }

    // Vérifier si un certificat existe déjà pour cette combinaison d'ID de cours et d'ID d'utilisateur
    const checkCertificateQuery = "SELECT * FROM Certificat WHERE idCours = ? AND idUser = ?";
    const checkCertificateValues = [idCours, idUser];

    db.query(checkCertificateQuery, checkCertificateValues, (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Erreur lors de la vérification du certificat existant :", checkErr);
            return res.status(500).json("Une erreur s'est produite lors de la vérification du certificat existant.");
        }

        if (checkResult.length > 0) {
            // Un certificat existe déjà pour cette combinaison d'ID de cours et d'ID d'utilisateur
            // Supprimer le certificat existant
            const deleteCertificateQuery = "DELETE FROM Certificat WHERE idCours = ? AND idUser = ?";
            db.query(deleteCertificateQuery, checkCertificateValues, (deleteErr, deleteResult) => {
                if (deleteErr) {
                    console.error("Erreur lors de la suppression du certificat existant :", deleteErr);
                    return res.status(500).json("Une erreur s'est produite lors de la suppression du certificat existant.");
                }
                // Créer un nouveau certificat
                createNewCertificate();
            });
        } else {
            // Aucun certificat existant, créer un nouveau certificat
            createNewCertificate();
        }
    });

    function createNewCertificate() {
        // Insérer le certificat dans la base de données
        const insertCertificateQuery = "INSERT INTO Certificat (idCours, idUser, note) VALUES (?, ?, ?)";
        const insertCertificateValues = [idCours, idUser, note];

        db.query(insertCertificateQuery, insertCertificateValues, (insertErr, insertResult) => {
            if (insertErr) {
                console.error("Erreur lors de la création du Certificat :", insertErr);
                return res.status(500).json("Une erreur s'est produite lors de la création du Certificat.");
            }
            return res.status(200).json("Le Certificat a été créé avec succès.");
        });
    }
};

export const getCertificateByIds = (req, res) => {
    const { idCours, idUser } = req.params;

    // Vérifier si les ID de cours et d'utilisateur sont fournis
    if (!idCours || !idUser) {
        return res.status(400).json("Les ID de cours et d'utilisateur sont requis.");
    }

    // Requête SQL pour récupérer le certificat correspondant aux ID de cours et d'utilisateur
    const getCertificateQuery = `
        SELECT Certificat.*,Cours.level, Cours.titre AS titreCours, Cours.type AS typeCours, Users.username 
        FROM Certificat 
        INNER JOIN Cours ON Certificat.idCours = Cours.id
        INNER JOIN Users ON Certificat.idUser = Users.id
        WHERE Certificat.idCours = ? AND Certificat.idUser = ?`;

    const getCertificateValues = [idCours, idUser];

    db.query(getCertificateQuery, getCertificateValues, (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération du certificat :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération du certificat.");
        }
        if (result.length === 0) {
            return res.status(404).json("Aucun certificat trouvé pour cette combinaison d'ID de cours et d'ID d'utilisateur.");
        }
        return res.status(200).json(result[0]); // Renvoie le premier certificat trouvé (si plusieurs existent)
    });
};
