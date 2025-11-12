const tourService = require('../services/tourService');

// Get all tours
exports.listTours = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.authorId) filters.authorId = parseInt(req.query.authorId);
    
    const tours = await tourService.getAllTours(filters);
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get tours by author
exports.getAuthorTours = async (req, res) => {
  try {
    const authorId = parseInt(req.params.authorId);
    const tours = await tourService.getToursByAuthor(authorId);
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single tour
exports.getTour = async (req, res) => {
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create tour
exports.createTour = async (req, res) => {
  try {
    const { name, description, difficulty, tags } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    // Get authorId from JWT token (set by authenticate middleware)
    const authorId = req.user?.sub || req.user?.id;
    if (!authorId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tourData = {
      name,
      description,
      difficulty,
      tags,
      authorId
    };
    
    const tour = await tourService.createTour(tourData);
    res.status(201).json(tour);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update tour
exports.updateTour = async (req, res) => {
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Check if user is the author
    const userId = req.user?.sub || req.user?.id;
    if (tour.authorId !== userId) {
      return res.status(403).json({ error: 'Only tour author can update the tour' });
    }
    
    const updated = await tourService.updateTour(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Publish tour
exports.publishTour = async (req, res) => {
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Check if user is the author
    const userId = req.user?.sub || req.user?.id;
    if (tour.authorId !== userId) {
      return res.status(403).json({ error: 'Only tour author can publish the tour' });
    }
    
    const updated = await tourService.publishTour(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete tour
exports.deleteTour = async (req, res) => {
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Check if user is the author
    const userId = req.user?.sub || req.user?.id;
    if (tour.authorId !== userId) {
      return res.status(403).json({ error: 'Only tour author can delete the tour' });
    }
    
    await tourService.deleteTour(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get key points for a tour
exports.getKeyPoints = async (req, res) => {
  try {
    const keyPoints = await tourService.getKeyPoints(req.params.tourId);
    if (keyPoints === null) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(keyPoints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add key point to tour
exports.addKeyPoint = async (req, res) => {
  try {
    const { name, description, latitude, longitude, imageUrl } = req.body;
    
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }
    
    const tour = await tourService.getTourById(req.params.tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Check if user is the author
    const userId = req.user?.sub || req.user?.id;
    if (tour.authorId !== userId) {
      return res.status(403).json({ error: 'Only tour author can add key points' });
    }
    
    const keyPoint = await tourService.addKeyPoint(req.params.tourId, {
      name,
      description,
      latitude,
      longitude,
      imageUrl
    });
    
    res.status(201).json(keyPoint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update key point
exports.updateKeyPoint = async (req, res) => {
  try {
    const { tourId, keyPointId } = req.params;
    
    const tour = await tourService.getTourById(tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Check if user is the author
    const userId = req.user?.sub || req.user?.id;
    if (tour.authorId !== userId) {
      return res.status(403).json({ error: 'Only tour author can update key points' });
    }
    
    const updated = await tourService.updateKeyPoint(tourId, keyPointId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Key point not found' });
    }
    
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete key point
exports.deleteKeyPoint = async (req, res) => {
  try {
    const { tourId, keyPointId } = req.params;
    
    const tour = await tourService.getTourById(tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Check if user is the author
    const userId = req.user?.sub || req.user?.id;
    if (tour.authorId !== userId) {
      return res.status(403).json({ error: 'Only tour author can delete key points' });
    }
    
    await tourService.deleteKeyPoint(tourId, keyPointId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
