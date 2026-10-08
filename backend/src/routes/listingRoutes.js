const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  toggleSaveListing,
  getSavedListings,
  getMyListings,
} = require('../controllers/listingController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', optionalAuth, getListings);
router.get('/saved', authenticate, getSavedListings);
router.get('/my-listings', authenticate, getMyListings);
router.get('/:id', optionalAuth, getListingById);
router.post('/', authenticate, upload.single('image'), createListing);
router.put('/:id', authenticate, upload.single('image'), updateListing);
router.delete('/:id', authenticate, deleteListing);
router.post('/:id/save', authenticate, toggleSaveListing);

module.exports = router;
