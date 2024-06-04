import { db } from "../db.js";

export const getAllLevel = (req, res) => {
    const selectQuery = "SELECT * FROM level";

    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error("Error retrieving level:", err);
            return res.status(500).json("An error occurred while retrieving level.");
        }

        return res.status(200).json(results);
    });
};