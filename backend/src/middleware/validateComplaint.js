/**
 * Validate complaint creation data
 */
const validateComplaint = (req, res, next) => {
    const {
        name,
        phone,
        area,
        city,
        issueType,
        description
    } = req.body;

    const errors = [];

    // Required fields
    if (!name || name.trim() === '') {
        errors.push('Name is required');
    }

    if (!phone || phone.trim() === '') {
        errors.push('Phone is required');
    }

    if (!area || area.trim() === '') {
        errors.push('Area is required');
    }

    if (!city || city.trim() === '') {
        errors.push('City is required');
    }

    if (!issueType || issueType.trim() === '') {
        errors.push('Issue type is required');
    }

    if (!description || description.trim() === '') {
        errors.push('Description is required');
    }

    // Phone validation (basic)
    if (phone && !/^[\d\s\-\+\(\)]{10,}$/.test(phone)) {
        errors.push('Phone number must be at least 10 digits');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                details: errors
            }
        });
    }

    next();
};

/**
 * Validate status update
 */
const validateStatusUpdate = (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: {
                message: `Status must be one of: ${validStatuses.join(', ')}`
            }
        });
    }

    next();
};

/**
 * Validate department assignment
 */
const validateDepartmentAssignment = (req, res, next) => {
    const { department } = req.body;

    if (!department || department.trim() === '') {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Department is required'
            }
        });
    }

    next();
};

module.exports = {
    validateComplaint,
    validateStatusUpdate,
    validateDepartmentAssignment
};