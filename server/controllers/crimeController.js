import Crime from "../models/crimeSchema.js";


export const createCrime = async (req, res) => {
    try {
        const { title, description, location, date } = req.body;
        
        // Process uploaded files
        const mediaFiles = req.files.map(file => ({
            fileUrl: file.location,
            fileType: file.mimetype  // Store the full MIME type instead of just 'image' or 'video'
        }));

        const crime = new Crime({
            title,
            description,
            location,
            date,
            uplodedBy:req.user._id,
            images:mediaFiles,
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
        
        // Check if user owns this crime report
        if (existingCrime.uplodedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only edit your own reports"
            });
        }
        
        // Build update object
        const updateData = {
            title,
            description,
            location,
            date
        };
        
        // Process new uploaded files if any
        if (req.files && req.files.length > 0) {
            const newMediaFiles = req.files.map(file => ({
                fileUrl: file.location,
                fileType: file.mimetype
            }));
            
            // Add new media files to existing ones
            updateData.images = [...existingCrime.images, ...newMediaFiles];
        }
        
        // Update the crime with the new data
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
        
        // Check if user owns this crime report
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