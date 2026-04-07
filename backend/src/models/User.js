const pool = require('../config/database');

class User {
    static async create({ name, email, passwordHash, role }) {
        const query = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, latitude, longitude, created_at, updated_at
        `;

        const values = [name, email, passwordHash, role || 'citizen'];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = `
            SELECT id, name, email, password_hash, role, latitude, longitude, created_at, updated_at
            FROM users
            WHERE email = $1
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    static async findById(id) {
        const query = `
            SELECT id, name, email, role, latitude, longitude, created_at, updated_at
            FROM users
            WHERE id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    static async updateLocation(id, { latitude, longitude }) {
        const query = `
            UPDATE users
            SET latitude = $1, longitude = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, name, email, role, latitude, longitude, created_at, updated_at
        `;
        const result = await pool.query(query, [latitude, longitude, id]);
        return result.rows[0] || null;
    }

    static async updateRole(id, role) {
        const query = `
            UPDATE users
            SET role = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, name, email, role, latitude, longitude, created_at, updated_at
        `;
        const result = await pool.query(query, [role, id]);
        return result.rows[0] || null;
    }
}

module.exports = User;

