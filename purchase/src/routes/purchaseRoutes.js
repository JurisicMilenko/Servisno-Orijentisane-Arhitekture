const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authenticate = require('../middlewares/authenticate');

// All routes require authentication
router.use(authenticate);

// Shopping cart routes
router.get('/cart', purchaseController.getCart);
router.post('/cart', purchaseController.addToCart);
router.delete('/cart/:tourId', purchaseController.removeFromCart);
router.delete('/cart', purchaseController.clearCart);
router.delete('/carts/:tourId', purchaseController.removeTourFromCarts);

// Checkout
router.post('/checkout', purchaseController.checkout);

// Purchase verification and history
router.get('/purchased', purchaseController.getPurchasedTours);
router.get('/check/:tourId', purchaseController.checkPurchase);
router.get('/purchase/:tourId', purchaseController.getPurchaseByTourId);
router.get('/verify/:token', purchaseController.verifyToken);

module.exports = router;
