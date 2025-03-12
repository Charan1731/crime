import mongoose from 'mongoose';

const crimeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    dateTime: {
        type: Date,
        required: true
    },
    mediaFiles: [{
        fileUrl: {
            type: String,
            required: true
        },
        fileType: {
            type: String,
            enum: ['image', 'video'],
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'closed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create a geospatial index on the location field
crimeSchema.index({ location: '2dsphere' });

const Crime = mongoose.model('Crime', crimeSchema);

export default Crime; 