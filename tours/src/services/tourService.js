const Tour = require('../models/Tour');

// Get all tours (optionally filtered by status)
exports.getAllTours = async (filters = {}) => {
  try {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.authorId) query.authorId = filters.authorId;
    
    const tours = await Tour.find(query).sort({ createdAt: -1 });
    return tours;
  } catch (err) {
    throw new Error('Failed to fetch tours: ' + err.message);
  }
};

// Get tours by author
exports.getToursByAuthor = async (authorId) => {
  try {
    const tours = await Tour.find({ authorId }).sort({ createdAt: -1 });
    return tours;
  } catch (err) {
    throw new Error('Failed to fetch author tours: ' + err.message);
  }
};

// Get tour by ID
exports.getTourById = async (id) => {
  try {
    const tour = await Tour.findById(id);
    return tour;
  } catch (err) {
    throw new Error('Failed to fetch tour: ' + err.message);
  }
};

// Create new tour
exports.createTour = async (data) => {
  try {
    const tour = new Tour({
      name: data.name,
      description: data.description,
      authorId: data.authorId,
      difficulty: data.difficulty || 'medium',
      tags: data.tags || [],
      status: 'draft',
      price: 0,
      keyPoints: []
    });
    
    await tour.save();
    return tour;
  } catch (err) {
    throw new Error('Failed to create tour: ' + err.message);
  }
};

// Update tour
exports.updateTour = async (id, data) => {
  try {
    const tour = await Tour.findById(id);
    if (!tour) return null;
    
    // Update allowed fields
    if (data.name !== undefined) tour.name = data.name;
    if (data.description !== undefined) tour.description = data.description;
    if (data.difficulty !== undefined) tour.difficulty = data.difficulty;
    if (data.tags !== undefined) tour.tags = data.tags;
    if (data.price !== undefined) tour.price = data.price;
    if (data.duration !== undefined) tour.duration = data.duration;
    if (data.distance !== undefined) tour.distance = data.distance;
    
    await tour.save();
    return tour;
  } catch (err) {
    throw new Error('Failed to update tour: ' + err.message);
  }
};

// Publish tour (change status from draft to published)
exports.publishTour = async (id) => {
  try {
    const tour = await Tour.findById(id);
    if (!tour) return null;
    
    tour.status = 'published';
    await tour.save();
    return tour;
  } catch (err) {
    throw new Error('Failed to publish tour: ' + err.message);
  }
};

// Delete tour
exports.deleteTour = async (id) => {
  try {
    const result = await Tour.findByIdAndDelete(id);
    return result;
  } catch (err) {
    throw new Error('Failed to delete tour: ' + err.message);
  }
};

// Add key point to tour
exports.addKeyPoint = async (tourId, keyPointData) => {
  try {
    const tour = await Tour.findById(tourId);
    if (!tour) return null;
    
    const keyPoint = {
      name: keyPointData.name,
      description: keyPointData.description || '',
      latitude: keyPointData.latitude,
      longitude: keyPointData.longitude,
      imageUrl: keyPointData.imageUrl || null,
      order: tour.keyPoints.length
    };
    
    tour.keyPoints.push(keyPoint);
    await tour.save();
    
    return tour.keyPoints[tour.keyPoints.length - 1];
  } catch (err) {
    throw new Error('Failed to add key point: ' + err.message);
  }
};

// Update key point
exports.updateKeyPoint = async (tourId, keyPointId, data) => {
  try {
    const tour = await Tour.findById(tourId);
    if (!tour) return null;
    
    const keyPoint = tour.keyPoints.id(keyPointId);
    if (!keyPoint) return null;
    
    if (data.name !== undefined) keyPoint.name = data.name;
    if (data.description !== undefined) keyPoint.description = data.description;
    if (data.latitude !== undefined) keyPoint.latitude = data.latitude;
    if (data.longitude !== undefined) keyPoint.longitude = data.longitude;
    if (data.imageUrl !== undefined) keyPoint.imageUrl = data.imageUrl;
    if (data.order !== undefined) keyPoint.order = data.order;
    
    await tour.save();
    return keyPoint;
  } catch (err) {
    throw new Error('Failed to update key point: ' + err.message);
  }
};

// Delete key point
exports.deleteKeyPoint = async (tourId, keyPointId) => {
  try {
    const tour = await Tour.findById(tourId);
    if (!tour) return null;
    
    tour.keyPoints.pull(keyPointId);
    await tour.save();
    
    return true;
  } catch (err) {
    throw new Error('Failed to delete key point: ' + err.message);
  }
};

// Get key points for a tour
exports.getKeyPoints = async (tourId) => {
  try {
    const tour = await Tour.findById(tourId).select('keyPoints');
    if (!tour) return null;
    
    return tour.keyPoints.sort((a, b) => a.order - b.order);
  } catch (err) {
    throw new Error('Failed to fetch key points: ' + err.message);
  }
};
