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

    async save() {
        const result = await pool.query(`INSERT INTO users (id, name, email, pwd_hash) VALUES ($1, $2, $3, $4)`, [
            this.id, this.name, this.email, this.pwd_hash
        ]);

        if (result.rowCount < 1) {
            throw new Error('Error while adding new user.');
        }
    }
}

module.exports = {
    UserRecord,
};
