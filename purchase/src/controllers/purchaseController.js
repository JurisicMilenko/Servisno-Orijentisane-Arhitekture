const purchaseService = require('../services/purchaseService');

// Get user's shopping cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await purchaseService.getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tourId, tourName, price } = req.body;

    if (!tourId || !tourName || price === undefined) {
      return res.status(400).json({ error: 'tourId, tourName, and price are required' });
    }

    const cart = await purchaseService.addToCart(userId, tourId, tourName, price);
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error.message === 'Tour already in cart' || error.message === 'Tour already purchased') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tourId } = req.params;

    const cart = await purchaseService.removeFromCart(userId, tourId);
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    if (error.message === 'Tour not found in cart') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await purchaseService.clearCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: error.message });
  }
};

// Checkout - purchase all items in cart
exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokens = await purchaseService.checkout(userId);
    res.json({ 
      message: 'Checkout successful',
      purchasedCount: tokens.length,
      tokens 
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    if (error.message === 'Cart is empty') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Check if user has purchased a specific tour
exports.checkPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tourId } = req.params;

    const hasPurchased = await purchaseService.hasPurchased(userId, tourId);
    res.json({ purchased: hasPurchased });
  } catch (error) {
    console.error('Error checking purchase:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all purchased tours
exports.getPurchasedTours = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokens = await purchaseService.getPurchasedTours(userId);
    res.json(tokens);
  } catch (error) {
    console.error('Error getting purchased tours:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify purchase token
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const purchaseToken = await purchaseService.verifyToken(token);
    
    if (!purchaseToken) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }
    
    res.json(purchaseToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get purchase details for a specific tour
exports.getPurchaseByTourId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tourId } = req.params;

    const purchase = await purchaseService.getPurchaseByTourId(userId, tourId);
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    res.json(purchase);
  } catch (error) {
    console.error('Error getting purchase:', error);
    res.status(500).json({ error: error.message });
  }
};
