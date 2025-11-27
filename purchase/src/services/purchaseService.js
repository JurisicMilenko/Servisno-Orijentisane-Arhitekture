const ShoppingCart = require('../models/shoppingCartModel');
const TourPurchaseToken = require('../models/tourPurchaseTokenModel');
const crypto = require('crypto');

class PurchaseService {
  // Get or create shopping cart for user
  async getCart(userId) {
    let cart = await ShoppingCart.findOne({ userId });
    if (!cart) {
      cart = new ShoppingCart({ userId, items: [], totalPrice: 0 });
      await cart.save();
    }
    return cart;
  }

  async removeTourFromCarts(tourId) {
    let carts = await ShoppingCart.find();
    for(var i in carts){
      try{
      console.log(i);
      carts[i].removeItem(tourId);
      await carts[i].save();
      }catch{
        console.log("failed: " + i);
      }
    }
    return carts;
  }

  // Add item to cart
  async addToCart(userId, tourId, tourName, price) {
    const cart = await this.getCart(userId);
    
    // Check if tour is already purchased
    const alreadyPurchased = await TourPurchaseToken.findOne({ userId, tourId });
    if (alreadyPurchased) {
      throw new Error('Tour already purchased');
    }
    
    cart.addItem(tourId, tourName, price);
    await cart.save();
    return cart;
  }

  // Remove item from cart
  async removeFromCart(userId, tourId) {
    const cart = await this.getCart(userId);
    cart.removeItem(tourId);
    await cart.save();
    return cart;
  }

  // Clear cart
  async clearCart(userId) {
    const cart = await this.getCart(userId);
    cart.clearCart();
    await cart.save();
    return cart;
  }

  // Checkout - create purchase tokens for all items in cart
  async checkout(userId) {
    const cart = await this.getCart(userId);
    
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const tokens = [];
    
    for (const item of cart.items) {
      // Check if already purchased (in case user added same tour multiple times)
      const existingToken = await TourPurchaseToken.findOne({ 
        userId, 
        tourId: item.tourId 
      });
      
      if (existingToken) {
        // Skip if already purchased
        continue;
      }

      // Generate unique token
      const token = crypto.randomBytes(32).toString('hex');
      
      const purchaseToken = new TourPurchaseToken({
        userId,
        tourId: item.tourId,
        tourName: item.tourName,
        price: item.price,
        token,
        status: 'active'
      });
      
      await purchaseToken.save();
      tokens.push(purchaseToken);
    }

    // Clear cart after successful checkout
    cart.clearCart();
    await cart.save();

    return tokens;
  }

  // Check if user has purchased a tour
  async hasPurchased(userId, tourId) {
    const token = await TourPurchaseToken.findOne({ 
      userId, 
      tourId, 
      status: 'active' 
    });
    return !!token;
  }

  // Get all purchased tours for a user
  async getPurchasedTours(userId) {
    const tokens = await TourPurchaseToken.find({ 
      userId, 
      status: 'active' 
    }).sort({ purchasedAt: -1 });
    return tokens;
  }

  // Verify purchase token
  async verifyToken(token) {
    const purchaseToken = await TourPurchaseToken.findOne({ token, status: 'active' });
    return purchaseToken;
  }

  // Get purchase details by tourId
  async getPurchaseByTourId(userId, tourId) {
    const token = await TourPurchaseToken.findOne({ 
      userId, 
      tourId, 
      status: 'active' 
    });
    return token;
  }
}

module.exports = new PurchaseService();
