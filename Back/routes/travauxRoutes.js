import express from 'express';
import * as travauxController from '../controllers/travauxController.js';

const router = express.Router();

// Routes pour les travaux d'étudiants
router.post('/create', travauxController.createTravail);
router.get('/getByActivite/:activiteId', travauxController.getTravauxByActivite);
router.get('/getByActiviteAndEtudiant/:activiteId/:etudiantId', travauxController.getTravauxByActiviteAndEtudiant);
router.get('/getByEtudiant/:etudiantId', travauxController.getTravauxByEtudiant);
router.put('/update/:id', travauxController.updateTravail);
router.put('/noter/:id', travauxController.noterTravail);
router.delete('/delete/:id', travauxController.deleteTravail);
router.get('/fichier/:filename', travauxController.getFichier);
router.get('/test', (req, res) => res.json({ message: 'Route travaux OK' }));


export default router;