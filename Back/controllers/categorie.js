import { db } from "../db.js";

export const getAllCategorie = (req, res) => {
    const selectQuery = "SELECT * FROM categorie";

    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error("Error retrieving categories:", err);
            return res.status(500).json("An error occurred while retrieving categories.");
        }

        return res.status(200).json(results);
    });
};