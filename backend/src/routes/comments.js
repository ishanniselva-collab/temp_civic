const express = require('express');
const router = express.Router();

const { addComment, getComments } = require('../controllers/commentController');
const { authenticateOptional } = require('../middleware/auth');

// Public read
router.get('/:complaintId', getComments);

// Public write (auth optional to auto-fill author name)
router.post('/', authenticateOptional, addComment);

module.exports = router;

