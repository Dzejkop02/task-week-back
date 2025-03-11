const {pool} = require("../utils/db");
const {ValidationError} = require("../utils/errors");

class UserRecord {
    constructor(obj) {
        if (!obj.id) {
            throw new ValidationError('Provide ID.');
        }

        if (!obj.email || !obj.email.includes('@') || obj.email.length > 255) {
            throw new ValidationError('Invalid email.');
        }

        if (!obj.name || obj.name.length < 2 || obj.name.length > 64) {
            throw new ValidationError('Name should have 2 - 64 characters.');
        }

        if (!obj.pwd_hash) {
            throw new ValidationError('Provide password hash.');
        }

        this.id = obj.id;
        this.name = obj.name;
        this.email = obj.email;
        this.pwd_hash = obj.pwd_hash;
        this.current_token_id = obj?.current_token_id;
    }

    static async find(email) {
        const {rows} =  await pool.query(`SELECT * FROM users WHERE email = ($1)`, [email]);
        return rows[0] ? new UserRecord(rows[0]) : null;
    }

    static async findToLogin(email, pwdHash) {
        const {rows} =  await pool.query(`SELECT * FROM users WHERE email = ($1) AND pwd_hash = ($2)`, [email, pwdHash]);
        return rows[0] ? new UserRecord(rows[0]) : null;
    }

    static async findByToken(token) {
        const {rows} =  await pool.query(`SELECT * FROM users WHERE current_token_id = ($1)`, [token]);
        return rows[0] ? new UserRecord(rows[0]) : null;
    }

    async save() {
        const result = await pool.query(`INSERT INTO users (id, name, email, pwd_hash, current_token_id) VALUES ($1, $2, $3, $4, $5)`, [
            this.id, this.name, this.email, this.pwd_hash, this.current_token_id
        ]);

        if (result.rowCount < 1) {
            throw new Error('Error while adding new user.');
        }
    }

    async updateToken() {
        const result = await pool.query(`UPDATE users SET current_token_id = ($1) WHERE id = ($2)`, [
            this.current_token_id, this.id
        ]);

        if (result.rowCount < 1) {
            throw new Error('Error while adding new user.');
        }
    }
}

module.exports = {
    UserRecord,
};
