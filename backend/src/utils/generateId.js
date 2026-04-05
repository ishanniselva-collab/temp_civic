// Generate unique complaint ID (e.g., CIV-123456)
const generateComplaintId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CIV-${timestamp.substring(timestamp.length - 6)}${random}`;
};

module.exports = { generateComplaintId };
