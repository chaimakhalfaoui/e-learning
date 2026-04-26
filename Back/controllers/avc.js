import { db } from "../db.js";

export const createOrUpdateAvc = (req, res) => {
    const { idCours, iduser, chapN } = req.body;

    if (!idCours || !iduser) {
        return res.status(400).json({ error: "Missing idCours or iduser." });
    }

    // Check if the record exists
    const checkQuery = "SELECT * FROM avc WHERE idCours = ? AND iduser = ?";

    db.query(checkQuery, [idCours, iduser], (err, results) => {
        if (err) {
            console.error("Error checking record:", err);
            return res.status(500).json({ error: "An error occurred while checking the record." });
        }

        if (results.length === 0) {
            // Insert a new record with chapN and avc initialized to 0
            const insertQuery = "INSERT INTO avc (idCours, iduser, chapN, avc) VALUES (?, ?, 0, 0)";
            db.query(insertQuery, [idCours, iduser], (err, data) => {
                if (err) {
                    console.error("Error inserting record:", err);
                    return res.status(500).json({ error: "An error occurred while inserting the record." });
                }
                return res.status(200).json({ message: "Record created successfully.", id: data.insertId, avc: 0, chapN: 0 });
            });
        } else {
            const currentChapN = parseInt(results[0].chapN, 10);
            
            // Vérifier si chapN est fourni et valide
            if (chapN !== undefined && chapN !== null) {
                const newChapN = parseInt(chapN, 10);
                if (isNaN(newChapN)) {
                    return res.status(400).json({ error: "Invalid chapN value." });
                }
                
                // Count the number of chapters for the course
                const countQuery = "SELECT COUNT(*) AS chapterCount FROM chapitre WHERE id_cours = ?";
                db.query(countQuery, [idCours], (err, countResult) => {
                    if (err) {
                        console.error("Error counting chapters:", err);
                        return res.status(500).json({ error: "An error occurred while counting the chapters." });
                    }

                    const chapterCount = countResult[0].chapterCount;
                    if (chapterCount === 0) {
                        return res.status(400).json({ error: "No chapters found for this course." });
                    }
                    
                    const newAvc = (100 / chapterCount) * newChapN;
                    const finalAvc = Math.min(100, Math.max(0, newAvc)); // Limiter entre 0 et 100

                    // Update the existing record with the new chapN and avc values
                    const updateQuery = "UPDATE avc SET chapN = ?, avc = ? WHERE idCours = ? AND iduser = ?";
                    db.query(updateQuery, [newChapN, finalAvc, idCours, iduser], (err, data) => {
                        if (err) {
                            console.error("Error updating record:", err);
                            return res.status(500).json({ error: "An error occurred while updating the record." });
                        }
                        return res.status(200).json({ message: "Record updated successfully.", avc: finalAvc, chapN: newChapN });
                    });
                });
            } else {
                // Retourner la progression actuelle
                return res.status(200).json({ 
                    avc: results[0].avc, 
                    chapN: results[0].chapN,
                    message: "Current progress retrieved" 
                });
            }
        }
    });
};

export const getAvcByIds = (req, res) => {
    const { idCours, iduser } = req.params;

    if (!idCours || !iduser) {
        return res.status(400).json({ error: "Missing idCours or iduser." });
    }

    const selectQuery = "SELECT avc, chapN, idCours, iduser FROM avc WHERE idCours = ? AND iduser = ?";

    db.query(selectQuery, [idCours, iduser], (err, results) => {
        if (err) {
            console.error("Error retrieving AVC data:", err);
            return res.status(500).json({ error: "An error occurred while retrieving AVC data." });
        }

        if (results.length === 0) {
            // Retourner 0 progression si aucun enregistrement trouvé
            return res.status(200).json({ avc: 0, chapN: 0, message: "No progress found" });
        }

        const avcData = results[0];
        return res.status(200).json(avcData);
    });
};