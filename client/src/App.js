// App.js
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import './App.css';

// Define our backend API URL
const API_URL = 'http://localhost:3001/api';

const CrudApp = () => {
    // State management using React hooks
    // We separate our state by concern to make it easier to manage
    const [items, setItems] = useState([]); // Main items list
    const [createFormData, setCreateFormData] = useState({ name: '', description: '' }); 
    const [updateFormData, setUpdateFormData] = useState({ id: '', name: '', description: '' });
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState(null); // For error handling

    // This effect runs once when the component mounts
    useEffect(() => {
        fetchItems();
    }, []);

    // Main data fetching function to get all items
    const fetchItems = async () => {
        try {
            setError(null); // Clear any previous errors
            const response = await fetch(`${API_URL}/items`);
            if (!response.ok) throw new Error('Failed to fetch items');
            const data = await response.json();
            // Process the data to ensure we're using itemId consistently
            const processedData = data.map(item => ({
                ...item,
                id: item.itemId // Map MongoDB's itemId to our frontend id
            }));
            setItems(processedData);
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('Failed to load items. Please try again.');
        }
    };

    // Search function to find a specific item
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId) return;
        
        try {
            setError(null);
            const response = await fetch(`${API_URL}/items/${searchId}`);
            if (!response.ok) throw new Error('Item not found');
            const data = await response.json();
            setSearchResult({
                ...data,
                id: data.itemId
            });
        } catch (error) {
            console.error('Error fetching item:', error);
            setSearchResult(null);
            setError('Item not found or error occurred while searching.');
        }
    };

    // Create new item function
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const response = await fetch(`${API_URL}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createFormData),
            });
            if (!response.ok) throw new Error('Failed to create item');
            
            await response.json();
            setCreateFormData({ name: '', description: '' }); // Reset form
            fetchItems(); // Refresh the list
        } catch (error) {
            console.error('Error creating item:', error);
            setError('Failed to create item. Please try again.');
        }
    };

    // Update existing item function
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const response = await fetch(`${API_URL}/items/${updateFormData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: updateFormData.name,
                    description: updateFormData.description
                }),
            });
            if (!response.ok) throw new Error('Failed to update item');

            setUpdateFormData({ id: '', name: '', description: '' }); // Reset form
            fetchItems(); // Refresh the list
        } catch (error) {
            console.error('Error updating item:', error);
            setError('Failed to update item. Please try again.');
        }
    };

    // Delete item function
    const handleDelete = async (id) => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/items/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete item');
            
            fetchItems(); // Refresh the list
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('Failed to delete item. Please try again.');
        }
    };

    return (
        <div className="crud-container">
            <h1 className="text-4xl font-bold text-center mb-8">CRUD Operations</h1>
            
            {/* Error display section */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}
            
            <div className="operations-grid">
                {/* Read Operation Card */}
                <div className="operation-card">
                    <h2 className="operation-title">Read Operations</h2>
                    
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Enter item ID"
                            className="form-input"
                        />
                        <button type="submit" className="button bg-blue-500 text-white hover:bg-blue-600">
                            <Search className="w-4 h-4" />
                            Search
                        </button>
                    </form>
                    
                    {/* Search Result Display */}
                    {searchResult && (
                        <div className="search-result">
                            <p><strong>ID:</strong> {searchResult.id}</p>
                            <p><strong>Name:</strong> {searchResult.name}</p>
                            <p><strong>Description:</strong> {searchResult.description}</p>
                        </div>
                    )}
                    
                    {/* Items List */}
                    <div className="items-list">
                        {items.map((item) => (
                            <div key={item._id} className="item-card">
                                <p><strong>ID:</strong> {item.id}</p>
                                <p><strong>Name:</strong> {item.name}</p>
                                <p><strong>Description:</strong> {item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create Operation Card */}
                <div className="operation-card">
                    <h2 className="operation-title">Create New Item</h2>
                    <form onSubmit={handleCreate} className="h-full flex flex-col">
                        <input
                            type="text"
                            value={createFormData.name}
                            onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                            placeholder="Name"
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            value={createFormData.description}
                            onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                            placeholder="Description"
                            className="form-input"
                            required
                        />
                        <button type="submit" className="button bg-green-500 text-white hover:bg-green-600 mt-auto">
                            <Plus className="w-4 h-4" />
                            Create Item
                        </button>
                    </form>
                </div>

                {/* Update Operation Card */}
                <div className="operation-card">
                    <h2 className="operation-title">Update Item</h2>
                    <form onSubmit={handleUpdate}>
                        <input
                            type="text"
                            value={updateFormData.id}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, id: e.target.value })}
                            placeholder="Item ID"
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            value={updateFormData.name}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                            placeholder="New Name"
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            value={updateFormData.description}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                            placeholder="New Description"
                            className="form-input"
                            required
                        />
                        <button type="submit" className="button bg-yellow-500 text-white hover:bg-yellow-600">
                            <Pencil className="w-4 h-4" />
                            Update Item
                        </button>
                    </form>
                </div>

                {/* Delete Operation Card */}
                <div className="operation-card">
                    <h2 className="operation-title">Delete Item</h2>
                    <div className="items-list">
                        {items.map((item) => (
                            <div key={item._id} className="item-card flex justify-between items-center">
                                <div>
                                    <p><strong>ID:</strong> {item.id}</p>
                                    <p><strong>Name:</strong> {item.name}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="button bg-red-500 text-white hover:bg-red-600 w-auto"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrudApp;