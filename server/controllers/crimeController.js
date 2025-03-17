import Crime from "../models/crimeSchema.js";


export const createCrime = async (req, res) => {
    try {
        const { title, description, location, date } = req.body;
        
        // Process uploaded files
        const mediaFiles = req.files.map(file => ({
            fileUrl: file.location,
            fileType: file.mimetype.startsWith('image/') ? 'image' : 'video'
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

        const crime = await Crime.findByIdAndUpdate(id, req.body, {new:true});

        res.status(200).json({
            success: true,
            message: "Crime updated successfully",
            crime,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error updating crime",
            error:error.message,
        })
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
        
        const crime = await Crime.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Crime deleted successfully",
            crime,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error deleting crime",
            error:error.message,
        })
    }
}