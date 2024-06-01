import path from "path";
import { fileURLToPath } from 'url';

export const getImageByName = (req, res) => {
    // Récupérer le nom de l'image à partir des paramètres de la requête
    const imageName = req.params.name;

    // Obtenir le chemin du fichier actuel
    const __filename = fileURLToPath(import.meta.url);

    // Construire le chemin complet de l'image en fonction de son nom
    const imagePath = path.join(path.dirname(__filename), '..', 'uploads', imageName);

    // Envoyer le fichier image en tant que réponse
    res.sendFile(imagePath, (err) => {
        if (err) {
            console.error("Erreur lors de l'envoi du fichier image :", err);
            res.status(500).json("Une erreur s'est produite lors de l'envoi du fichier image.");
        }
    });
};
