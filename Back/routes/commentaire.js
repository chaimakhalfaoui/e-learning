import express from 'express';
import { createComment,getComments } from '../controllers/commentaire.js';

const router = express.Router();

router.post('/createComment', createComment);
router.get('/getComments', getComments);

export default router;