const {pool} = require("../utils/db");
const {ValidationError} = require("../utils/errors");

class TaskRecord {
    constructor(obj) {
        if (!obj.title || obj.title.length > 100) {
            throw new ValidationError('Invalid title.');
        }

        if (obj.description && obj.description.length > 255) {
            throw new ValidationError('Invalid description.');
        }

        this.id = obj.id;
        this.user_id = obj.user_id;
        this.title = obj.title;
        this.description = obj?.description;
        this.is_completed = obj?.is_completed ?? false;
        this.created_at = obj?.created_at;
    }

    async save() {
        const result = await pool.query(`INSERT INTO tasks (id, user_id, title, description, is_completed) VALUES ($1, $2, $3, $4, $5)`, [
            this.id, this.user_id, this.title, this.description, this.is_completed
        ]);

        if (result.rowCount < 1) {
            throw new Error('Error while adding new task.');
        }
    }
}

module.exports = {
    TaskRecord,
};
