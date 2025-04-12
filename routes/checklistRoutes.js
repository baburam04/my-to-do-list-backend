const express = require('express');
const router = express.Router();
const {
  getChecklists,
  createChecklist,
  deleteChecklist,
  togglePinChecklist,
  searchChecklists,
} = require('../controllers/checklistController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getChecklists)
  .post(protect, createChecklist);

router.route('/:id')
  .delete(protect, deleteChecklist);

router.route('/:id/pin')
  .put(protect, togglePinChecklist);

router.route('/search')
  .get(protect, searchChecklists);

module.exports = router;