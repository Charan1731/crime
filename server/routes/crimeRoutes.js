import express from 'express';
import { upload } from '../config/s3Config.js';
import verifyToken from '../middlewares/authMiddleware.js';
import { createCrime, getCrimes, getCrimeById, updateCrime, updateCrimeStatus, deleteCrime } from '../controllers/crimeController.js';

const router = express.Router();

// Public routes (if any)
router.get('/', getCrimes);

// Protected routes
router.post('/', verifyToken, upload.array('mediaFiles', 5), createCrime);
router.get('/:id', getCrimeById);
router.put('/:id', verifyToken, upload.array('mediaFiles', 5), updateCrime);
router.put('/status/:id', updateCrimeStatus);
router.delete('/:id', verifyToken, deleteCrime);

export default router; 