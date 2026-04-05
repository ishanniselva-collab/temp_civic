const express = require('express');
const router = express.Router();

const {
    createComplaint,
    getComplaintById,
    getAllComplaints,
    getComplaintsByUser,
    getNearbyComplaints,
    updateComplaintStatus,
    assignComplaint,
    deleteComplaint
} = require('../controllers/complaintController');

const {
    validateComplaint,
    validateStatusUpdate,
    validateDepartmentAssignment
} = require('../middleware/validateComplaint');
const upload = require('../middleware/uploadMiddleware');
const { authenticate, authenticateOptional } = require('../middleware/auth');

// Routes match the architecture specification:

// 1. POST /complaints - Create complaint
// Generates unique complaint ID, stores in database, handles image upload
router.post('/', upload.single('image'), authenticateOptional, validateComplaint, createComplaint);

// 2. GET /complaints/user - List complaints for current user
router.get('/user', authenticate, getComplaintsByUser);

// 3. GET /complaints/nearby - Nearby complaints for volunteer dashboard
router.get('/nearby', getNearbyComplaints);

// 4. GET /complaints/:id - Fetch complaint details
router.get('/:id', getComplaintById);

// 5. GET /complaints - List all complaints (admin)
router.get('/', getAllComplaints);

// 6. PUT /complaints/:id - Update status (Pending → In Progress → Resolved)
router.put('/:id', validateStatusUpdate, updateComplaintStatus);

// 7. POST /assign - Assign complaint to department
// (Note: This is mounted at /api/assign in server.js)
router.post('/assign', validateDepartmentAssignment, assignComplaint);

// 8. Admin: Delete complaint
router.delete('/:id', deleteComplaint);

module.exports = router;