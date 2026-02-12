const Tour = require('../models/Tour');

// Haversine formula to calculate distance between two points on Earth
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Calculate total distance for a tour based on key points
function calculateTourDistance(keyPoints) {
  if (!keyPoints || keyPoints.length < 2) {
    return 0;
  }
  
  // Sort by order
  const sorted = [...keyPoints].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  let totalDistance = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    totalDistance += calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
  }
  
  return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
}

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

// Get published tours for tourists (only basic info and first key point)
exports.getPublishedToursForTourists = async () => {
  try {
    const tours = await Tour.find({ status: 'published' }).sort({ createdAt: -1 });
    
    // Transform to show only basic info and first key point
    return tours.map(tour => {
      const tourObj = tour.toObject();
      
      // Keep only first key point
      if (tourObj.keyPoints && tourObj.keyPoints.length > 0) {
        // Sort by order and keep only first
        const sorted = [...tourObj.keyPoints].sort((a, b) => (a.order || 0) - (b.order || 0));
        tourObj.keyPoints = [sorted[0]];
      }
      
      return tourObj;
    });
  } catch (err) {
    throw new Error('Failed to fetch published tours: ' + err.message);
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
      keyPoints: [],
      duration: data.duration || null,
      distance: 0
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
    // distance is auto-calculated from key points, not manually set
    
    // Update transport durations
    if (data.transportDurations !== undefined) {
      tour.transportDurations = {
        walking: data.transportDurations.walking || null,
        bicycle: data.transportDurations.bicycle || null,
        car: data.transportDurations.car || null
      };
    }
    
    await tour.save();
    return tour;
  } catch (err) {
    throw new Error('Failed to update tour: ' + err.message);
  }
};

// Validate if tour can be published
const canPublishTour = (tour) => {
  const errors = [];
  
  // 1. Check basic data
  if (!tour.name || tour.name.trim() === '') {
    errors.push('Tour must have a name');
  }
  if (!tour.description || tour.description.trim() === '') {
    errors.push('Tour must have a description');
  }
  if (!tour.difficulty) {
    errors.push('Tour must have a difficulty level');
  }
  if (!tour.tags || tour.tags.length === 0) {
    errors.push('Tour must have at least one tag');
  }
  
  // 2. Check minimum 2 key points
  if (!tour.keyPoints || tour.keyPoints.length < 2) {
    errors.push('Tour must have at least 2 key points');
  }
  
  // 3. Check at least one transport duration
  const hasTransportDuration = tour.transportDurations && (
    tour.transportDurations.walking > 0 ||
    tour.transportDurations.bicycle > 0 ||
    tour.transportDurations.car > 0
  );
  
  if (!hasTransportDuration) {
    errors.push('Tour must have at least one transport duration defined (walking, bicycle, or car)');
  }
  
  return {
    canPublish: errors.length === 0,
    errors
  };
};

// Publish tour (change status from draft to published)
exports.publishTour = async (id) => {
  try {
    const tour = await Tour.findById(id);
    if (!tour) return null;
    
    // Check if tour is already published
    if (tour.status === 'published') {
      throw new Error('Tour is already published');
    }
    
    // Validate tour can be published
    const validation = canPublishTour(tour);
    if (!validation.canPublish) {
      throw new Error('Tour cannot be published: ' + validation.errors.join(', '));
    }
    
    tour.status = 'published';
    tour.publishedAt = new Date();
    await tour.save();
    return tour;
  } catch (err) {
    throw new Error('Failed to publish tour: ' + err.message);
  }
};

// Archive tour
exports.archiveTour = async (id, token) => {
  try {
    const tour = await Tour.findById(id);
    if (!tour) return null;
    
    // Can only archive published tours
    if (tour.status !== 'published') {
      throw new Error('Only published tours can be archived');
    }
    
    const res1 = await fetch(`http://purchase:3004/api/purchase/carts/`+id, {
      method: 'DELETE',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    tour.status = 'archived';
    tour.archivedAt = new Date();
    await tour.save();
    return tour;
  } catch (err) {
    throw new Error('Failed to archive tour: ' + err.message);
  }
};

// Reactivate archived tour (back to published)
exports.reactivateTour = async (id) => {
  try {
    const tour = await Tour.findById(id);
    if (!tour) return null;
    
    // Can only reactivate archived tours
    if (tour.status !== 'archived') {
      throw new Error('Only archived tours can be reactivated');
    }
    
    tour.status = 'published';
    tour.archivedAt = null;
    tour.publishedAt = new Date(); // Update published date
    await tour.save();
    return tour;
  } catch (err) {
    throw new Error('Failed to reactivate tour: ' + err.message);
  }
};

// Check if tour can be published (public method for validation without publishing)
exports.validateForPublish = async (id) => {
  try {
    const tour = await Tour.findById(id);
    if (!tour) return null;
    
    return canPublishTour(tour);
  } catch (err) {
    throw new Error('Failed to validate tour: ' + err.message);
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
    
    // Calculate next order number
    const nextOrder = keyPointData.order !== undefined 
      ? keyPointData.order 
      : tour.keyPoints.length + 1;
    
    const keyPoint = {
      name: keyPointData.name,
      description: keyPointData.description || '',
      latitude: keyPointData.latitude,
      longitude: keyPointData.longitude,
      imageUrl: keyPointData.imageUrl || null,
      order: nextOrder
    };
    
    tour.keyPoints.push(keyPoint);
    tour.distance = calculateTourDistance(tour.keyPoints);
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
    
    tour.distance = calculateTourDistance(tour.keyPoints);
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
    tour.distance = calculateTourDistance(tour.keyPoints);
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
