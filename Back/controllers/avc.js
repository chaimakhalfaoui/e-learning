import { db } from "../db.js";

export const createOrUpdateAvc = (req, res) => {
    const { idCours, iduser, chapN } = req.body;

    if (!idCours || !iduser) {
        return res.status(400).json("Missing idCours or iduser.");
    }

    // Check if the record exists
    const checkQuery = "SELECT * FROM avc WHERE idCours = ? AND iduser = ?";

    db.query(checkQuery, [idCours, iduser], (err, results) => {
        if (err) {
            console.error("Error checking record:", err);
            return res.status(500).json("An error occurred while checking the record.");
        }

        if (results.length === 0) {
            // Insert a new record with chapN and avc initialized to 0
            const insertQuery = "INSERT INTO avc (idCours, iduser, chapN, avc) VALUES (?, ?, 0, 0)";
            db.query(insertQuery, [idCours, iduser], (err, data) => {
                if (err) {
                    console.error("Error inserting record:", err);
                    return res.status(500).json("An error occurred while inserting the record.");
                }
                return res.status(200).json({ message: "Record created successfully.", id: data.insertId });
            });
        } else {
            let currentChapN = parseInt(results[0].chapN, 10);
            if (chapN === currentChapN || chapN === "0") {
                currentChapN = chapN === "0" ? 0 : currentChapN;

                // Count the number of chapters for the course
                const countQuery = "SELECT COUNT(*) AS chapterCount FROM chapitre WHERE id_cours = ?";
                db.query(countQuery, [idCours], (err, countResult) => {
                    if (err) {
                        console.error("Error counting chapters:", err);
                        return res.status(500).json("An error occurred while counting the chapters.");
                    }

                    const chapterCount = countResult[0].chapterCount;
                    const newChapN = currentChapN + 1;
                    const newAvc = (100 / chapterCount) * newChapN;

                    // Update the existing record with the new chapN and avc values
                    const updateQuery = "UPDATE avc SET chapN = ?, avc = ? WHERE idCours = ? AND iduser = ?";
                    db.query(updateQuery, [newChapN, newAvc, idCours, iduser], (err, data) => {
                        if (err) {
                            console.error("Error updating record:", err);
                            return res.status(500).json("An error occurred while updating the record.");
                        }
                        return res.status(200).json({ message: "Record updated successfully." });
                    });
                });
            } else {
                return res.status(400).json("Invalid chapN value.");
            }
        }
    });
};


export const getAvcByIds = (req, res) => {
    const { idCours, iduser } = req.params;

    if (!idCours || !iduser) {
        return res.status(400).json("Missing idCours or iduser.");
    }

    // Query to retrieve AVC data based on idCours and iduser
    const selectQuery = "SELECT * FROM avc WHERE idCours = ? AND iduser = ?";

    db.query(selectQuery, [idCours, iduser], (err, results) => {
        if (err) {
            console.error("Error retrieving AVC data:", err);
            return res.status(500).json("An error occurred while retrieving AVC data.");
        }

        if (results.length === 0) {
            return res.status(404).json("No AVC data found for the provided idCours and iduser.");
        }

        const avcData = results[0]; // Assuming there's only one record for each idCours and iduser
        return res.status(200).json(avcData);
    });
};