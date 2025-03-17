import express from 'express';
import { upload } from '../config/s3Config.js';
import verifyToken from '../middlewares/authMiddleware.js';
import { createCrime, getCrimes, getCrimeById, updateCrime, updateCrimeStatus, deleteCrime } from '../controllers/crimeController.js';
const router = express.Router();

router.post('/crimes', upload.array('mediaFiles', 5),verifyToken, createCrime );

router.get('/crimes', getCrimes )

router.get('/crimes/:id',verifyToken, getCrimeById )

router.put('/crimes/:id',verifyToken, updateCrime)

router.put('/crimes/update/:id', updateCrimeStatus)

router.delete('/crimes/:id',verifyToken, deleteCrime)

export default router; 