const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Item = require('./models/Item');

const app = express();

// Connect to MongoDB with logging
connectDB().then(() => {
    console.log('Ready to perform database operations');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use(cors());
app.use(express.json());

// CREATE - Add a new item
app.post('/api/items', async (req, res) => {
    try {
        console.log('Attempting to create item with data:', req.body);
        
        const newItem = await Item.create({
            name: req.body.name,
            description: req.body.description
        });
        
        console.log('Successfully created item in database:', newItem);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error in create operation:', error);
        res.status(400).json({ 
            message: 'Error creating item', 
            error: error.message 
        });
    }
});

// READ - Get all items
app.get('/api/items', async (req, res) => {
    try {
        console.log('Attempting to fetch all items from database...');
        const items = await Item.find().sort({ createdAt: -1 });
        console.log('Successfully retrieved items:', items);
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ 
            message: 'Error fetching items', 
            error: error.message 
        });
    }
});

// READ - Get specific item
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findOne({ itemId: parseInt(req.params.id) });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching item', 
            error: error.message 
        });
    }
});

// UPDATE - Update an item
app.put('/api/items/:id', async (req, res) => {
    try {
        console.log('Attempting to update item with ID:', req.params.id);
        
        const item = await Item.findOne({ itemId: parseInt(req.params.id) });
        
        if (!item) {
            console.log('Item not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Item not found' });
        }

        item.name = req.body.name;
        item.description = req.body.description;
        await item.save();
        
        console.log('Successfully updated item:', item);
        res.json(item);
    } catch (error) {
        console.error('Error in update operation:', error);
        res.status(400).json({ 
            message: 'Error updating item', 
            error: error.message 
        });
    }
});

// DELETE - Remove an item
app.delete('/api/items/:id', async (req, res) => {
    try {
        console.log('Attempting to delete item with ID:', req.params.id);
        
        const item = await Item.findOneAndDelete({ itemId: parseInt(req.params.id) });

        if (!item) {
            console.log('Item not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Item not found' });
        }

        console.log('Successfully deleted item:', item);
        res.json({ message: 'Item deleted successfully', item });
    } catch (error) {
        console.error('Error in delete operation:', error);
        res.status(500).json({ 
            message: 'Error deleting item', 
            error: error.message 
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});