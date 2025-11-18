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

// Get published tours only
exports.getPublishedTours = async (req, res) => {
  try {
    const tours = await tourService.getAllTours({ status: 'published' });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get published tours for tourists (only basic info and first key point)
exports.getPublishedToursForTourists = async (req, res) => {
  try {
    const tours = await tourService.getPublishedToursForTourists();
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
    
    // Check if user has access to full tour details
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role;
    
    // If tour is published and user is not the author or admin/guide
    if (tour.status === 'published' && tour.authorId !== userId && userRole !== 'admin' && userRole !== 'guide') {
      // Tourist view: return only basic info and first key point
      const tourObj = tour.toObject();
      if (tourObj.keyPoints && tourObj.keyPoints.length > 0) {
        const sorted = [...tourObj.keyPoints].sort((a, b) => (a.order || 0) - (b.order || 0));
        tourObj.keyPoints = [sorted[0]];
      }
      return res.json(tourObj);
    }
    
    // Full access for author, admin, guide, or draft/archived tours
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create tour
exports.createTour = async (req, res) => {
  try {
    const { name, description, difficulty, tags, duration, distance } = req.body;
    
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
    
    // Add duration and distance if provided
    if (duration !== undefined) {
      tourData.duration = duration;
    }
    if (distance !== undefined) {
      tourData.distance = distance;
    }
    
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

// Archive tour
exports.archiveTour = async (req, res) => {
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Check if user is the author
    const userId = req.user?.sub || req.user?.id;
    if (tour.authorId !== userId) {
      return res.status(403).json({ error: 'Only tour author can archive the tour' });
    }
    
    const updated = await tourService.archiveTour(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reactivate archived tour
exports.reactivateTour = async (req, res) => {
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Check if user is the author
    const userId = req.user?.sub || req.user?.id;
    if (tour.authorId !== userId) {
      return res.status(403).json({ error: 'Only tour author can reactivate the tour' });
    }
    
    const updated = await tourService.reactivateTour(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Validate if tour can be published
exports.validateForPublish = async (req, res) => {
  try {
    const validation = await tourService.validateForPublish(req.params.id);
    if (validation === null) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(validation);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
