const express = require('express');
const Kubb = require('../models/Kubb');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all kubbs
router.get('/', async (req, res) => {
    try {
        const filters = {};
        
        // Apply filters from query parameters
        if (req.query.status) filters.status = req.query.status;
        if (req.query.location) filters.location = new RegExp(req.query.location, 'i');
        if (req.query.minPrice) filters.price = { $gte: parseFloat(req.query.minPrice) };
        if (req.query.maxPrice) {
            filters.price = { ...filters.price, $lte: parseFloat(req.query.maxPrice) };
        }

        const kubbs = await Kubb.find(filters)
            .populate('owner', 'username email')
            .sort({ createdAt: -1 });

        res.json(kubbs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching kubbs', error: error.message });
    }
});

// Get single kubb
router.get('/:id', async (req, res) => {
    try {
        const kubb = await Kubb.findById(req.params.id)
            .populate('owner', 'username email')
            .populate('ratings.user', 'username');

        if (!kubb) {
            return res.status(404).json({ message: 'Kubb not found' });
        }

        res.json(kubb);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching kubb', error: error.message });
    }
});

// Create new kubb (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const kubb = new Kubb({
            ...req.body,
            owner: req.user._id
        });

        await kubb.save();
        res.status(201).json(kubb);
    } catch (error) {
        res.status(400).json({ message: 'Error creating kubb', error: error.message });
    }
});

// Update kubb (protected route)
router.patch('/:id', auth, async (req, res) => {
    try {
        const kubb = await Kubb.findOne({ _id: req.params.id, owner: req.user._id });
        
        if (!kubb) {
            return res.status(404).json({ message: 'Kubb not found or unauthorized' });
        }

        Object.assign(kubb, req.body);
        await kubb.save();
        
        res.json(kubb);
    } catch (error) {
        res.status(400).json({ message: 'Error updating kubb', error: error.message });
    }
});

// Delete kubb (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const kubb = await Kubb.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        
        if (!kubb) {
            return res.status(404).json({ message: 'Kubb not found or unauthorized' });
        }

        res.json({ message: 'Kubb deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting kubb', error: error.message });
    }
});

// Add rating to kubb (protected route)
router.post('/:id/ratings', auth, async (req, res) => {
    try {
        const kubb = await Kubb.findById(req.params.id);
        
        if (!kubb) {
            return res.status(404).json({ message: 'Kubb not found' });
        }

        // Check if user has already rated
        const existingRating = kubb.ratings.find(
            rating => rating.user.toString() === req.user._id.toString()
        );

        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this kubb' });
        }

        kubb.ratings.push({
            user: req.user._id,
            rating: req.body.rating,
            review: req.body.review
        });

        await kubb.save();
        res.status(201).json(kubb);
    } catch (error) {
        res.status(400).json({ message: 'Error adding rating', error: error.message });
    }
});

module.exports = router;
