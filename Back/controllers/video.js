import path from "path";
import { fileURLToPath } from 'url';

export const getVideoByName = (req, res) => {
    // Récupérer le nom de la vidéo à partir des paramètres de la requête
    const videoName = req.params.name;

    // Obtenir le chemin du répertoire du fichier en cours
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // Construire le chemin complet de la vidéo en fonction de son nom
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', videoName);

    // Envoyer le fichier vidéo en tant que réponse
    res.sendFile(videoPath, (err) => {
        if (err) {
            console.error("Erreur lors de l'envoi du fichier vidéo :", err);

            // Vérifier si les en-têtes ont déjà été envoyés
            if (!res.headersSent) {
                res.status(500).json("Une erreur s'est produite lors de l'envoi du fichier vidéo.");
            }
        }
    });
};