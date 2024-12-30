const mongoose = require('mongoose');

// Create a separate schema for tracking our custom ID counter
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 1 }
});

const Counter = mongoose.model('Counter', CounterSchema);

// Define the schema for our items
const itemSchema = new mongoose.Schema({
    itemId: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true
    }
}, {
    timestamps: true
});

// Add a pre-save hook to automatically increment and set the itemId
itemSchema.pre('save', async function(next) {
    const doc = this;
    if (doc.itemId) {
        return next();
    }

    try {
        const counter = await Counter.findByIdAndUpdate(
            'itemId',
            { $inc: { sequence_value: 1 } },
            { upsert: true, new: true }
        );
        
        doc.itemId = counter.sequence_value;
        next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('Item', itemSchema);