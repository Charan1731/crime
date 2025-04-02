import Crime from "../models/crimeSchema.js";


export const createCrime = async (req, res) => {
    try {
        const { title, description, location, date } = req.body;
        

        const images = [];
        let video = null;
        
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.mimetype.startsWith('image/')) {
                    images.push({
                        fileUrl: file.location,
                        fileType: file.mimetype
                    });
                } else if (file.mimetype.startsWith('video/')) {
                    video = file.location;
                }
            });
        }

        const crime = new Crime({
            title,
            description,
            location,
            date,
            uplodedBy: req.user._id,
            images: images,
            video: video
        });

        await crime.save();
        res.status(201).json(crime);
    } catch (error) {
        console.error('Error creating crime report:', error);
        res.status(500).json({ error: 'Error creating crime report' });
    }
}

export const getCrimes = async (req, res) => {
    try {

        const crimes = await Crime.find();

        res.status(200).json({
            success: true,
            message: "Crimes fetched successfully",
            crimes,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error fetching crimes",
            error:error.message,
        })
    }
}

export const getCrimeById = async (req, res) => {
    try {

        const id = req.params.id;

        const crimes = await Crime.find({uplodedBy:id})

        res.status(200).json({
            success: true,
            message: "Crime fetched successfully",
            crimes,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error fetching crime by id",
            error:error.message,
        })
    }
}

export const updateCrime = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description, location, date } = req.body;
        
        // Find the crime first to ensure it exists
        const existingCrime = await Crime.findById(id);
        
        if (!existingCrime) {
            return res.status(404).json({
                success: false,
                message: "Crime not found"
            });
        }
        

        if (existingCrime.uplodedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only edit your own reports"
            });
        }
        

        const updateData = {
            title,
            description,
            location,
            date
        };
        

        if (req.files && req.files.length > 0) {
            const newImages = [];
            let newVideo = null;
            
            req.files.forEach(file => {
                if (file.mimetype.startsWith('image/')) {
                    newImages.push({
                        fileUrl: file.location,
                        fileType: file.mimetype
                    });
                } else if (file.mimetype.startsWith('video/')) {
                    newVideo = file.location;
                }
            });
            

            if (newImages.length > 0) {
                updateData.images = [...existingCrime.images, ...newImages];
            }
            

            if (newVideo) {
                updateData.video = newVideo;
            }
        }
        

        const updatedCrime = await Crime.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: "Crime updated successfully",
            crime: updatedCrime,
        });
        
    } catch (error) {
        console.error('Error updating crime:', error);
        res.status(500).json({
            success: false,
            message: "Error updating crime",
            error: error.message,
        });
    }
}

export const updateCrimeStatus = async (req, res) => {
    try {

        const id = req.params.id;

        const crime = await Crime.findByIdAndUpdate(id, req.body, {new:true});

        res.status(200).json({
            success: true,
            message: "Crime status updated successfully",
            crime,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error updating crime status",
            error:error.message,
        })
    }
}

export const deleteCrime = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Find the crime first to ensure it exists
        const existingCrime = await Crime.findById(id);
        
        if (!existingCrime) {
            return res.status(404).json({
                success: false,
                message: "Crime not found"
            });
        }
        

        if (existingCrime.uplodedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own reports"
            });
        }
        
        const deletedCrime = await Crime.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Crime deleted successfully",
            crime: deletedCrime,
        });
        
    } catch (error) {
        console.error('Error deleting crime:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting crime",
            error: error.message,
        });
    }
}