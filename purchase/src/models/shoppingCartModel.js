const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  tourId: {
    type: String,
    required: true
  },
  tourName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const shoppingCartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to calculate total price
shoppingCartSchema.methods.calculateTotal = function() {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price, 0);
  return this.totalPrice;
};

// Method to add item to cart
shoppingCartSchema.methods.addItem = function(tourId, tourName, price) {
  // Check if item already exists
  const existingItem = this.items.find(item => item.tourId === tourId);
  if (existingItem) {
    throw new Error('Tour already in cart');
  }
  
  this.items.push({ tourId, tourName, price });
  this.calculateTotal();
  this.updatedAt = new Date();
};

// Method to remove item from cart
shoppingCartSchema.methods.removeItem = function(tourId) {
  const index = this.items.findIndex(item => item.tourId === tourId);
  if (index === -1) {
    throw new Error('Tour not found in cart');
  }
  
  this.items.splice(index, 1);
  this.calculateTotal();
  this.updatedAt = new Date();
};

// Method to clear cart
shoppingCartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalPrice = 0;
  this.updatedAt = new Date();
};

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

module.exports = ShoppingCart;
