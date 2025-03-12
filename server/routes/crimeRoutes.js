import express from 'express';
import { upload } from '../config/s3Config.js';
import Crime from '../models/Crime.js';

const router = express.Router();

// Create a new crime report with media files
router.post('/crimes', upload.array('mediaFiles', 5), async (req, res) => {
    try {
        const { title, description, latitude, longitude, dateTime } = req.body;
        
        // Process uploaded files
        const mediaFiles = req.files.map(file => ({
            fileUrl: file.location,
            fileType: file.mimetype.startsWith('image/') ? 'image' : 'video'
        }));

        const crime = new Crime({
            title,
            description,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            dateTime: new Date(dateTime),
            mediaFiles
        });

        await crime.save();
        res.status(201).json(crime);
    } catch (error) {
        console.error('Error creating crime report:', error);
        res.status(500).json({ error: 'Error creating crime report' });
    }
});

export default router; 