const mongoose = require('mongoose');

const tourPurchaseTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  tourId: {
    type: String,
    required: true,
    index: true
  },
  tourName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'refunded'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound index to ensure user can't buy the same tour twice
tourPurchaseTokenSchema.index({ userId: 1, tourId: 1 }, { unique: true });

// Method to check if token is valid
tourPurchaseTokenSchema.methods.isValid = function() {
  return this.status === 'active';
};

const TourPurchaseToken = mongoose.model('TourPurchaseToken', tourPurchaseTokenSchema);

module.exports = TourPurchaseToken;
