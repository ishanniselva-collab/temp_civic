const pool = require('../config/database');

class Comment {
    static async create({ complaintId, authorName, message }) {
        const query = `
            INSERT INTO comments (complaint_id, author_name, message)
            VALUES ($1, $2, $3)
            RETURNING id, complaint_id, author_name, message, created_at
        `;
        const result = await pool.query(query, [complaintId, authorName, message]);
        return result.rows[0];
    }

    static async findByComplaintId(complaintId) {
        const query = `
            SELECT id, complaint_id, author_name, message, created_at
            FROM comments
            WHERE complaint_id = $1
            ORDER BY created_at ASC
            LIMIT 200
        `;
        const result = await pool.query(query, [complaintId]);
        return result.rows;
    }
}

module.exports = Comment;

